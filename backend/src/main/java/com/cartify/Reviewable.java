package com.cartify;

import java.util.List;

public interface Reviewable {
    void addReview(Review r);
    double getAverageRating();
    List<Review> getAllReviews();
}
