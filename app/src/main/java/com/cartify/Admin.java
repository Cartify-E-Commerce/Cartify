package com.cartify;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("Admin")
public class Admin extends User {
    private int adminLevel;

    public Admin() {
        super();
    }

    public Admin(String userId, String name, String email, String password, String address, int adminLevel) {
        super(userId, name, email, password, address);
        this.adminLevel = adminLevel;
    }

    public void blockUser(User u) {
        System.out.println("Admin memblokir pengguna: " + u.getName());
    }

    public void deleteProduct(String id) {
        System.out.println("Admin menghapus produk dengan ID: " + id);
    }

    public void manageProducts() {
        System.out.println("Admin sedang mengelola produk sistem.");
    }

    @Override
    public String getRole() {
        return "Admin";
    }

    // Getters and Setters
    public int getAdminLevel() { return adminLevel; }
    public void setAdminLevel(int adminLevel) { this.adminLevel = adminLevel; }
}
