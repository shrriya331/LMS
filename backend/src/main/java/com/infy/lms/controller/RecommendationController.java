package com.infy.lms.controller;

import com.infy.lms.dto.BookDTO;
import com.infy.lms.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping("/{userId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<List<BookDTO>> getRecommendations(@PathVariable Long userId) {
        List<BookDTO> recommendations = recommendationService.getRecommendationsForUser(userId);
        return ResponseEntity.ok(recommendations);
    }

    // Librarian and Admin endpoints for insights
    @GetMapping("/analytics/popular-books")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Integer>> getPopularBooks() {
        Map<String, Integer> popularBooks = recommendationService.getFrequentlyRecommendedBooks();
        return ResponseEntity.ok(popularBooks);
    }

    @GetMapping("/analytics/category-trends")
    @PreAuthorize("hasRole('LIBRARIAN') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Integer>> getCategoryTrends() {
        Map<String, Integer> categoryTrends = recommendationService.getCategoryDemandTrends();
        return ResponseEntity.ok(categoryTrends);
    }
}
