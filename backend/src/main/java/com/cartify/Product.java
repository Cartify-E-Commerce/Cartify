package com.cartify;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "product_type", discriminatorType = DiscriminatorType.STRING)
public abstract class Product implements Reviewable, Stockable {
    @Id
    protected String productId;
    protected String name;
    protected String description;
    protected double price;
    protected int stock;

    protected String imageUrl;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "seller_id")
    protected Seller seller;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    protected List<Review> reviewList = new ArrayList<>();

    protected Product() {}

    public Product(String productId, String name, String description, double price, int stock, Seller seller) {
        this.productId = productId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stock = stock;
        this.seller = seller;
        this.reviewList = new ArrayList<>();
        this.imageUrl = null;
    }

    public abstract String getCategory();

    @Override
    public void addStock(int qty) {
        this.stock += qty;
    }

    @Override
    public void reduceStock(int qty) {
        if (this.stock >= qty) {
            this.stock -= qty;
        } else {
            System.out.println("Stok tidak mencukupi!");
        }
    }

    @Override
    public int getStock() {
        return this.stock;
    }

    @Override
    public void addReview(Review r) {
        reviewList.add(r);
    }

    @Override
    public double getAverageRating() {
        if (reviewList.isEmpty()) {
            return 5.0; // Default rating if no review
        }
        double sum = 0;
        for (Review r : reviewList) {
            sum += r.getRating();
        }
        return sum / reviewList.size();
    }

    @Override
    public List<Review> getAllReviews() {
        return reviewList;
    }

    // Getters and Setters
    public String getProductId() { return productId; }
    public void setProductId(String productId) { this.productId = productId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public Seller getSeller() { return seller; }
    public void setSeller(Seller seller) { this.seller = seller; }
    public void setStock(int stock) { this.stock = stock; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
