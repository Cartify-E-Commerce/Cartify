package com.cartify;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class RatingCalculator {
    private int maxScale;
    private List<Review> reviewsCache;

    public RatingCalculator(int maxScale) {
        this.maxScale = maxScale;
    }

    public double calculate(List<Review> data) {
        this.reviewsCache = data;
        if (data == null || data.isEmpty()) {
            return 5.0; // Default rating
        }
        double sum = 0;
        for (Review r : data) {
            sum += r.getRating();
        }
        return sum / data.size();
    }

    public Map<Integer, Integer> getRatingDistribution() {
        Map<Integer, Integer> distribution = new HashMap<>();
        // Inisialisasi skala 1 sampai maxScale dengan 0
        for (int i = 1; i <= maxScale; i++) {
            distribution.put(i, 0);
        }
        if (reviewsCache != null) {
            for (Review r : reviewsCache) {
                int rating = r.getRating();
                if (rating >= 1 && rating <= maxScale) {
                    distribution.put(rating, distribution.get(rating) + 1);
                }
            }
        }
        return distribution;
    }

    public int getTotalReviews() {
        return reviewsCache == null ? 0 : reviewsCache.size();
    }

    // Getters and Setters
    public int getMaxScale() { return maxScale; }
    public void setMaxScale(int maxScale) { this.maxScale = maxScale; }
}
