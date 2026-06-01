package com.cartify;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "user_role", discriminatorType = DiscriminatorType.STRING)
public abstract class User {
    @Id
    protected String userId;
    protected String name;
    protected String email;
    protected String password;
    protected String address;

    protected User() {}

    public User(String userId, String name, String email, String password, String address) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.address = address;
    }

    public boolean login() {
        System.out.println("User " + name + " berhasil login.");
        return true;
    }

    public void logout() {
        System.out.println("User " + name + " berhasil logout.");
    }

    public void updateProfile() {
        System.out.println("Profil " + name + " berhasil diperbarui.");
    }

    public abstract String getRole();

    // Getters and Setters
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}