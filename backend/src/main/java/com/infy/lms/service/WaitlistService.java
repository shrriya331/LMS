package com.infy.lms.service;

import com.infy.lms.dto.BookReservationDto;
import com.infy.lms.dto.BookWaitlistDto;
import com.infy.lms.model.*;
import com.infy.lms.repository.BookReservationRepository;
import com.infy.lms.repository.BookWaitlistRepository;
import com.infy.lms.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WaitlistService {

    private final BookWaitlistRepository waitlistRepository;
    private final BookReservationRepository reservationRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    // Priority calculation constants (configurable via admin settings later)
    private static final BigDecimal WAITING_TIME_WEIGHT = new BigDecimal("1.0");
    private static final BigDecimal COURSE_URGENCY_WEIGHT = new BigDecimal("15.0");
    private static final BigDecimal LATE_RETURN_PENALTY = new BigDecimal("-5.0");
    private static final BigDecimal MEMBERSHIP_BONUS = new BigDecimal("8.0");

    /**
     * Join the waitlist for an unavailable book
     */
    @Transactional
    public BookWaitlistDto joinWaitlist(User student, Book book) {
        // Check if already in waitlist
        Optional<BookWaitlist> existing = waitlistRepository.findByStudentAndBookAndIsActiveTrue(student, book);
        if (existing.isPresent()) {
            throw new RuntimeException("Student is already in the waitlist for this book");
        }

        // Create new waitlist entry
        BookWaitlist waitlistEntry = BookWaitlist.builder()
                .student(student)
                .book(book)
                .joinedAt(Instant.now())
                .isActive(true)
                .build();

        // Calculate initial priority
        calculateAndUpdatePriority(waitlistEntry);

        // Save and update queue positions
        BookWaitlist saved = waitlistRepository.save(waitlistEntry);
        updateQueuePositions(book);

        return convertToDto(saved);
    }

    /**
     * Leave the waitlist
     */
    @Transactional
    public void leaveWaitlist(User student, Book book) {
        Optional<BookWaitlist> waitlistEntry = waitlistRepository.findByStudentAndBookAndIsActiveTrue(student, book);
        if (waitlistEntry.isPresent()) {
            BookWaitlist entry = waitlistEntry.get();
            entry.setIsActive(false);
            waitlistRepository.save(entry);
            updateQueuePositions(book);
        }
    }

    /**
     * Get waitlist position and details for a student-book combination
     */
    public BookWaitlistDto getWaitlistPosition(User student, Book book) {
        Optional<BookWaitlist> waitlistEntry = waitlistRepository.findByStudentAndBookAndIsActiveTrue(student, book);
        return waitlistEntry.map(this::convertToDto).orElse(null);
    }

    /**
     * Get all waitlist entries for a student
     */
    public List<BookWaitlistDto> getStudentWaitlist(User student) {
        List<BookWaitlist> entries = waitlistRepository.findByStudentAndIsActiveTrue(student);
        return entries.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Get waitlist for a book (admin/librarian view)
     */
    public List<BookWaitlistDto> getBookWaitlist(Book book) {
        List<BookWaitlist> entries = waitlistRepository.findActiveWaitlistForBook(book);
        return entries.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    /**
     * Handle book return - auto-allocate to highest priority student
     */
    @Transactional
    public void handleBookReturn(Book book) {
        // Find highest priority student in waitlist
        List<BookWaitlist> waitlist = waitlistRepository.findActiveWaitlistForBook(book);

        if (!waitlist.isEmpty()) {
            BookWaitlist highestPriority = waitlist.get(0);

            // Create reservation for the student
            BookReservation reservation = BookReservation.builder()
                    .student(highestPriority.getStudent())
                    .book(book)
                    .reservedAt(Instant.now())
                    .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS)) // 24 hours to collect
                    .status(BookReservation.ReservationStatus.ACTIVE)
                    .notificationSent(false)
                    .build();

            reservationRepository.save(reservation);

            // Remove student from waitlist
            highestPriority.setIsActive(false);
            waitlistRepository.save(highestPriority);

            // Update queue positions for remaining students
            updateQueuePositions(book);
        }
    }

    /**
     * Convert reservation to borrow (when student collects the book)
     */
    @Transactional
    public void convertReservationToBorrow(BookReservation reservation, User librarian) {
        if (reservation.isActive()) {
            // Mark reservation as converted
            reservation.convertToBorrow();
            reservationRepository.save(reservation);

            // Create borrow record (this would normally be done by the existing borrow service)
            // For now, we'll just mark the reservation
        }
    }

    /**
     * Clean up expired reservations
     */
    @Transactional
    public void cleanupExpiredReservations() {
        List<BookReservation> expiredReservations = reservationRepository.findExpiredReservations(
                BookReservation.ReservationStatus.ACTIVE, Instant.now());

        for (BookReservation reservation : expiredReservations) {
            reservation.expire();
            reservationRepository.save(reservation);

            // Re-queue the book for the next student
            handleBookReturn(reservation.getBook());
        }
    }

    /**
     * Calculate and update priority score for a waitlist entry
     */
    private void calculateAndUpdatePriority(BookWaitlist waitlistEntry) {
        User student = waitlistEntry.getStudent();

        // Update waiting days
        waitlistEntry.updateWaitingDays();

        // Calculate priority components
        BigDecimal waitingScore = WAITING_TIME_WEIGHT.multiply(BigDecimal.valueOf(waitlistEntry.getWaitingDays()));

        // Course urgency bonus (simplified - would need course/year info)
        BigDecimal courseUrgency = calculateCourseUrgencyBonus(student);

        // Late return penalty
        BigDecimal latePenalty = calculateLateReturnPenalty(student);

        // Membership bonus
        BigDecimal membershipBonus = calculateMembershipBonus(student);

        // Total priority score
        BigDecimal totalScore = waitingScore
                .add(courseUrgency)
                .add(latePenalty)
                .add(membershipBonus);

        // Update the entry
        waitlistEntry.setPriorityScore(totalScore);
        waitlistEntry.setCourseUrgencyBonus(courseUrgency);
        waitlistEntry.setLateReturnPenalty(latePenalty);
        waitlistEntry.setMembershipBonus(membershipBonus);
        waitlistEntry.setLastUpdated(Instant.now());
    }

    /**
     * Calculate course urgency bonus (would need student profile/course data)
     */
    private BigDecimal calculateCourseUrgencyBonus(User student) {
        // Simplified logic - in real implementation, this would check:
        // - Student year (final year = higher priority)
        // - Course type (core subjects = higher priority)
        // - Assignment deadlines, exam schedules, etc.

        // For now, give basic bonus based on role or other criteria
        if (student.getRole() != null && student.getRole().toString().contains("PREMIUM")) {
            return COURSE_URGENCY_WEIGHT.multiply(new BigDecimal("0.5"));
        }

        return BigDecimal.ZERO;
    }

    /**
     * Calculate late return penalty
     */
    private BigDecimal calculateLateReturnPenalty(User student) {
        // Count recent late returns
        List<BorrowRecord> recentBorrows = borrowRecordRepository.findByStudent(student);

        long lateReturns = recentBorrows.stream()
                .filter(record -> record.getReturnedAt() != null &&
                        record.getReturnedAt().isAfter(record.getDueDate()))
                .count();

        // Penalty increases with more late returns
        return LATE_RETURN_PENALTY.multiply(BigDecimal.valueOf(Math.min(lateReturns, 5)));
    }

    /**
     * Calculate membership bonus
     */
    private BigDecimal calculateMembershipBonus(User student) {
        // Premium members get priority bonus
        if (student.getRole() != null && student.getRole().toString().contains("PREMIUM")) {
            return MEMBERSHIP_BONUS;
        }

        return BigDecimal.ZERO;
    }

    /**
     * Update queue positions for all active waitlist entries of a book
     */
    private void updateQueuePositions(Book book) {
        List<BookWaitlist> waitlist = waitlistRepository.findActiveWaitlistForBook(book);

        for (int i = 0; i < waitlist.size(); i++) {
            BookWaitlist entry = waitlist.get(i);
            entry.setQueuePosition(i + 1);

            // Estimate wait time based on position and average borrow duration
            int estimatedDays = (i + 1) * 7; // Rough estimate: 7 days per person ahead
            entry.setEstimatedWaitDays(estimatedDays);

            waitlistRepository.save(entry);
        }
    }

    /**
     * Convert BookWaitlist entity to DTO
     */
    private BookWaitlistDto convertToDto(BookWaitlist waitlist) {
        String priorityReason = buildPriorityReason(waitlist);
        String estimatedDate = calculateEstimatedDate(waitlist.getEstimatedWaitDays());

        return BookWaitlistDto.builder()
                .id(waitlist.getId())
                .bookId(waitlist.getBook().getId())
                .bookTitle(waitlist.getBook().getTitle())
                .bookAuthor(waitlist.getBook().getAuthor())
                .studentId(waitlist.getStudent().getId())
                .studentName(waitlist.getStudent().getName())
                .studentEmail(waitlist.getStudent().getEmail())
                .joinedAt(waitlist.getJoinedAt())
                .priorityScore(waitlist.getPriorityScore())
                .queuePosition(waitlist.getQueuePosition())
                .estimatedWaitDays(waitlist.getEstimatedWaitDays())
                .waitingDays(waitlist.getWaitingDays())
                .courseUrgencyBonus(waitlist.getCourseUrgencyBonus())
                .lateReturnPenalty(waitlist.getLateReturnPenalty())
                .membershipBonus(waitlist.getMembershipBonus())
                .isActive(waitlist.getIsActive())
                .priorityReason(priorityReason)
                .estimatedAvailableDate(estimatedDate)
                .build();
    }

    private String buildPriorityReason(BookWaitlist waitlist) {
        StringBuilder reason = new StringBuilder();

        if (waitlist.getCourseUrgencyBonus().compareTo(BigDecimal.ZERO) > 0) {
            reason.append("Course urgency bonus (+").append(waitlist.getCourseUrgencyBonus()).append(")");
        }

        if (waitlist.getWaitingDays() > 0) {
            if (reason.length() > 0) reason.append(", ");
            reason.append("Waiting ").append(waitlist.getWaitingDays()).append(" days (+")
                    .append(WAITING_TIME_WEIGHT.multiply(BigDecimal.valueOf(waitlist.getWaitingDays()))).append(")");
        }

        if (waitlist.getMembershipBonus().compareTo(BigDecimal.ZERO) > 0) {
            if (reason.length() > 0) reason.append(", ");
            reason.append("Premium member (+").append(waitlist.getMembershipBonus()).append(")");
        }

        if (waitlist.getLateReturnPenalty().compareTo(BigDecimal.ZERO) < 0) {
            if (reason.length() > 0) reason.append(", ");
            reason.append("Late return penalty (").append(waitlist.getLateReturnPenalty()).append(")");
        }

        return reason.length() > 0 ? reason.toString() : "Standard priority";
    }

    private String calculateEstimatedDate(Integer estimatedWaitDays) {
        if (estimatedWaitDays == null || estimatedWaitDays <= 0) {
            return "Available soon";
        }

        Instant estimatedDate = Instant.now().plus(estimatedWaitDays, ChronoUnit.DAYS);
        return estimatedDate.toString().substring(0, 10); // YYYY-MM-DD format
    }
}
