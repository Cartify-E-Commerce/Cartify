package com.cartify;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("Seller")
public class Seller extends User {
    private String shopName;

    @OneToMany(mappedBy = "seller", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Product> productList = new ArrayList<>();
    private double totalRevenue;
    private String shopCategory;

    public Seller() {
        super();
    }

    public Seller(String userId, String name, String email, String password, String address, String shopName) {
        super(userId, name, email, password, address);
        this.shopName = shopName;
        this.productList = new ArrayList<>();
        this.totalRevenue = 0.0;
    }

    public void addProduct(Product p) {
        productList.add(p);
        System.out.println("Produk " + p.getName() + " ditambahkan ke toko " + shopName);
    }

    public void removeProduct(String id) {
        productList.removeIf(p -> p.getProductId().equals(id));
        System.out.println("Produk ID " + id + " dihapus dari toko " + shopName);
    }

    public void updateProduct(Product p) {
        for (int i = 0; i < productList.size(); i++) {
            if (productList.get(i).getProductId().equals(p.getProductId())) {
                productList.set(i, p);
                System.out.println("Produk " + p.getName() + " berhasil diupdate.");
                return;
            }
        }
    }

    public void respondToReview(Review r) {
        System.out.println("Toko " + shopName + " menanggapi ulasan ReviewID: " + r.getReviewId());
    }

    public void viewDashboard() {
        System.out.println("=== Dashboard Seller " + shopName + " ===");
        System.out.println("Total Pendapatan: Rp" + totalRevenue);
        System.out.println("Jumlah Produk Aktif: " + productList.size());
    }

    @Override
    public String getRole() {
        return "Seller";
    }

    // Getters and Setters
    public String getShopName() { return shopName; }
    public void setShopName(String shopName) { this.shopName = shopName; }
    public List<Product> getProductList() { return productList; }
    public void setProductList(List<Product> productList) { this.productList = productList; }
    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }
    public void addRevenue(double amount) { this.totalRevenue += amount; }
    public String getShopCategory() { return shopCategory; }
    public void setShopCategory(String shopCategory) { this.shopCategory = shopCategory; }
}
