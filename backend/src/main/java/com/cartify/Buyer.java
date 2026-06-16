package com.cartify;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("Buyer")
public class Buyer extends User {

    public Buyer() {
        super();
    }

    public Buyer(String userId, String name, String email, String password, String address) {
        super(userId, name, email, password, address);
    }

    public void writeReview(Review r) {
        r.getProduct().addReview(r);
        System.out.println("Buyer " + getName() + " menulis ulasan untuk " + r.getProduct().getName());
    }

    public void viewDashboard() {
        System.out.println("=== Dashboard Buyer " + getName() + " ===");
        if (getCart() != null && getCart().getItemList() != null) {
            System.out.println("Total Belanjaan di Keranjang: " + getCart().getItemList().size() + " item");
        }
        if (getOrderHistory() != null) {
            System.out.println("Total Riwayat Transaksi: " + getOrderHistory().size());
        }
    }

    @Override
    public String getRole() {
        return "Buyer";
    }
}
