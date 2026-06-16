package com.cartify;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

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

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    protected String profilePhoto;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "cart_id")
    protected Cart cart;

    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    protected List<Transaction> orderHistory = new ArrayList<>();

    protected User() {}

    public User(String userId, String name, String email, String password, String address) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.address = address;
        this.cart = new Cart("CART-" + userId, this, new ArrayList<>());
        this.orderHistory = new ArrayList<>();
    }

    public void addToCart(Product p) {
        if (cart == null) {
            cart = new Cart("CART-" + userId, this, new ArrayList<>());
        }
        boolean found = false;
        for (OrderItem item : cart.getItemList()) {
            if (item.getProduct().getProductId().equals(p.getProductId())) {
                item.setQuantity(item.getQuantity() + 1);
                found = true;
                break;
            }
        }
        if (!found) {
            cart.addItem(new OrderItem(p, 1));
        }
        System.out.println("Produk " + p.getName() + " ditambahkan ke keranjang User: " + getName());
    }

    public void removeFromCart(String id) {
        if (cart != null) {
            cart.removeItem(id);
        }
    }

    public Transaction checkout() {
        return checkout(this.getAddress(), "JNE Regular", 15000.0, 0.0, "GoPay");
    }

    public Transaction checkout(String shippingAddress, String courier, double shippingCost, double discount, String paymentMethod) {
        if (cart == null || cart.getItemList().isEmpty()) {
            System.out.println("Keranjang kosong, tidak dapat checkout!");
            return null;
        }
        
        List<OrderItem> transactionItems = new ArrayList<>();
        for (OrderItem cartItem : cart.getItemList()) {
            transactionItems.add(new OrderItem(cartItem.getProduct(), cartItem.getQuantity()));
        }
        
        double finalTotal = cart.calculateTotal() + shippingCost - discount;
        if (finalTotal < 0) finalTotal = 0;
        
        Transaction t = new Transaction(
            "TX-" + System.currentTimeMillis(),
            this,
            transactionItems,
            TransactionStatus.PENDING,
            finalTotal,
            new java.util.Date()
        );
        t.setShippingAddress(shippingAddress);
        t.setCourier(courier);
        t.setShippingCost(shippingCost);
        t.setDiscount(discount);
        t.setPaymentMethod(paymentMethod);
        
        orderHistory.add(t);
        cart.clearCart();
        System.out.println("Checkout berhasil untuk " + getName() + ". Total: Rp" + t.totalAmount);
        return t;
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
    public String getProfilePhoto() { return profilePhoto; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }
    public List<Transaction> getOrderHistory() { return orderHistory; }
    public void setOrderHistory(List<Transaction> orderHistory) { this.orderHistory = orderHistory; }
}