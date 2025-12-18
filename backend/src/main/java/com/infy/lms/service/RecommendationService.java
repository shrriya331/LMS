package com.infy.lms.service;

import com.infy.lms.dto.BookDTO;
import com.infy.lms.model.Book;
import com.infy.lms.model.BorrowRecord;
import com.infy.lms.model.User;
import com.infy.lms.repository.BookRepository;
import com.infy.lms.repository.BorrowRecordRepository;
import com.infy.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;

    public List<BookDTO> getRecommendationsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get user's borrow history
        List<BorrowRecord> borrowHistory = borrowRecordRepository.findByStudentId(userId);

        // If user has no borrow history, return popular books
        if (borrowHistory.isEmpty()) {
            return getPopularBooks(10);
        }

        // Calculate recommendation scores
        Map<Book, Double> bookScores = new HashMap<>();

        // 1. Category relevance based on borrow history
        Map<String, Integer> genrePreferences = getGenrePreferences(borrowHistory);
        Map<String, Integer> tagPreferences = getTagPreferences(borrowHistory);

        // 2. Get all available books (not borrowed by user and have available copies)
        List<Book> allBooks = bookRepository.findAll();
        Set<Long> borrowedBookIds = borrowHistory.stream()
                .map(br -> br.getBook().getId())
                .collect(Collectors.toSet());

        List<Book> candidateBooks = allBooks.stream()
                .filter(book -> !borrowedBookIds.contains(book.getId()))
                .filter(book -> book.getAvailableCopies() > 0)
                .collect(Collectors.toList());

        // 3. Calculate scores for each candidate book
        for (Book book : candidateBooks) {
            double score = calculateRecommendationScore(book, genrePreferences, tagPreferences, borrowHistory);
            bookScores.put(book, score);
        }

        // 4. Sort by score and return top recommendations
        return bookScores.entrySet().stream()
                .sorted(Map.Entry.<Book, Double>comparingByValue().reversed())
                .limit(10)
                .map(entry -> convertToBookDTO(entry.getKey()))
                .collect(Collectors.toList());
    }

    private List<BookDTO> getPopularBooks(int limit) {
        List<Book> allBooks = bookRepository.findAll();
        return allBooks.stream()
                .filter(book -> book.getAvailableCopies() > 0)
                .sorted((a, b) -> Integer.compare(
                        borrowRecordRepository.findByBookId(b.getId()).size(),
                        borrowRecordRepository.findByBookId(a.getId()).size()))
                .limit(limit)
                .map(this::convertToBookDTO)
                .collect(Collectors.toList());
    }

    private Map<String, Integer> getGenrePreferences(List<BorrowRecord> borrowHistory) {
        Map<String, Integer> genreCount = new HashMap<>();
        for (BorrowRecord record : borrowHistory) {
            String genre = record.getBook().getGenre();
            if (genre != null && !genre.trim().isEmpty()) {
                genreCount.put(genre, genreCount.getOrDefault(genre, 0) + 1);
            }
        }
        return genreCount;
    }

    private Map<String, Integer> getTagPreferences(List<BorrowRecord> borrowHistory) {
        Map<String, Integer> tagCount = new HashMap<>();
        for (BorrowRecord record : borrowHistory) {
            List<String> tags = record.getBook().tagList();
            for (String tag : tags) {
                tagCount.put(tag, tagCount.getOrDefault(tag, 0) + 1);
            }
        }
        return tagCount;
    }

    private double calculateRecommendationScore(Book book, Map<String, Integer> genrePreferences,
                                              Map<String, Integer> tagPreferences, List<BorrowRecord> borrowHistory) {
        double score = 0.0;

        // 1. Category relevance (40% weight)
        String genre = book.getGenre();
        if (genre != null && genrePreferences.containsKey(genre)) {
            int genreFrequency = genrePreferences.get(genre);
            score += genreFrequency * 0.4;
        }

        // 2. Tag relevance (30% weight)
        List<String> bookTags = book.tagList();
        int totalTagMatches = 0;
        for (String tag : bookTags) {
            if (tagPreferences.containsKey(tag)) {
                totalTagMatches += tagPreferences.get(tag);
            }
        }
        score += totalTagMatches * 0.3;

        // 3. Book popularity (20% weight) - based on how often this book has been borrowed
        List<BorrowRecord> bookBorrowHistory = borrowRecordRepository.findByBookId(book.getId());
        int popularityScore = bookBorrowHistory.size();
        score += popularityScore * 0.2;

        // 4. Availability boost (10% weight) - prefer books with higher availability
        int availabilityRatio = book.getAvailableCopies() * 100 / book.getTotalCopies();
        score += availabilityRatio * 0.1;

        return score;
    }

    private BookDTO convertToBookDTO(Book book) {
        return BookDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .issuedCopies(book.getIssuedCopies())
                .genre(book.getGenre())
                .publisher(book.getPublisher())
                .tags(book.getTags())
                .tagList(book.tagList())
                .mrp(book.getMrp())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .accessLevel(book.getAccessLevel())
                .build();
    }

    // Analytics methods for librarian and admin
    public Map<String, Integer> getFrequentlyRecommendedBooks() {
        // This would require storing recommendation history
        // For now, return popular books as proxy
        List<Book> allBooks = bookRepository.findAll();
        return allBooks.stream()
                .collect(Collectors.toMap(
                        Book::getTitle,
                        book -> borrowRecordRepository.findByBookId(book.getId()).size()
                ));
    }

    public Map<String, Integer> getCategoryDemandTrends() {
        List<BorrowRecord> allBorrows = borrowRecordRepository.findAll();
        Map<String, Integer> categoryTrends = new HashMap<>();

        for (BorrowRecord record : allBorrows) {
            String genre = record.getBook().getGenre();
            if (genre != null && !genre.trim().isEmpty()) {
                categoryTrends.put(genre, categoryTrends.getOrDefault(genre, 0) + 1);
            }
        }

        return categoryTrends;
    }
}
