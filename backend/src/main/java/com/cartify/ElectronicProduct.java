package com.cartify;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("Electronic")
public class ElectronicProduct extends Product {
    private String brand;
    private int warrantyMonths;

    public ElectronicProduct() {
        super();
    }

    public ElectronicProduct(String productId, String name, String description, double price, int stock, Seller seller, String brand, int warrantyMonths) {
        super(productId, name, description, price, stock, seller);
        this.brand = brand;
        this.warrantyMonths = warrantyMonths;
    }

    @Override
    public String getCategory() {
        return "Elektronik";
    }

    public String getWarrantyInfo() {
        return "Garansi " + warrantyMonths + " bulan dari " + brand;
    }

    // Getters and Setters
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public int getWarrantyMonths() { return warrantyMonths; }
    public void setWarrantyMonths(int warrantyMonths) { this.warrantyMonths = warrantyMonths; }
}
