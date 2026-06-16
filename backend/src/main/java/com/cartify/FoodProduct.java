package com.cartify;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@DiscriminatorValue("Food")
public class FoodProduct extends Product {
    private Date expiryDate;
    private double weightGram;

    public FoodProduct() {
        super();
    }

    public FoodProduct(String productId, String name, String description, double price, int stock, Seller seller, Date expiryDate, double weightGram) {
        super(productId, name, description, price, stock, seller);
        this.expiryDate = expiryDate;
        this.weightGram = weightGram;
    }

    @Override
    public String getCategory() {
        return "Makanan";
    }

    public boolean isExpired() {
        return new Date().after(expiryDate);
    }

    // Getters and Setters
    public Date getExpiryDate() { return expiryDate; }
    public void setExpiryDate(Date expiryDate) { this.expiryDate = expiryDate; }
    public double getWeightGram() { return weightGram; }
    public void setWeightGram(double weightGram) { this.weightGram = weightGram; }
}
