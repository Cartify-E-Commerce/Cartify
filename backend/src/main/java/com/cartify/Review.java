package com.cartify;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "reviews")
public class Review {
    @Id
    private String reviewId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "buyer_id")
    private User buyer;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;
    private int rating;
    private String comment;
    private String reply;
    private Date createdAt;
    private String transactionId;

    public Review() {}

    public Review(String reviewId, User buyer, Product product, int rating, String comment, Date createdAt) {
        this.reviewId = reviewId;
        this.buyer = buyer;
        this.product = product;
        this.rating = rating;
        this.comment = comment;
        this.reply = "";
        this.createdAt = createdAt;
    }

    public Review(String reviewId, User buyer, Product product, int rating, String comment, String transactionId, Date createdAt) {
        this.reviewId = reviewId;
        this.buyer = buyer;
        this.product = product;
        this.rating = rating;
        this.comment = comment;
        this.reply = "";
        this.transactionId = transactionId;
        this.createdAt = createdAt;
    }

    public int getRating() {
        return rating;
    }

    public void setReply(String message) {
        this.reply = message;
        System.out.println("Seller membalas ulasan: " + message);
    }

    // Getters and Setters
    public String getReviewId() { return reviewId; }
    public void setReviewId(String reviewId) { this.reviewId = reviewId; }
    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getReply() { return reply; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
}
