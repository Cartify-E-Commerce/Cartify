package com.cartify;

import jakarta.persistence.*;
import java.util.Arrays;
import java.util.List;

@Entity
@DiscriminatorValue("Fashion")
public class FashionProduct extends Product {
    private String size;
    private String material;
    private String color;

    public FashionProduct() {
        super();
    }

    public FashionProduct(String productId, String name, String description, double price, int stock, Seller seller, String size, String material, String color) {
        super(productId, name, description, price, stock, seller);
        this.size = size;
        this.material = material;
        this.color = color;
    }

    @Override
    public String getCategory() {
        return "Pakaian";
    }

    public List<String> getAvailableSizes() {
        return Arrays.asList("S", "M", "L", "XL", "XXL");
    }

    // Getters and Setters
    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
}
