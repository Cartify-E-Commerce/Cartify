package com.cartify;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("Buyer")
public class Buyer extends User {
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "cart_id")
    private Cart cart;

    @OneToMany(mappedBy = "buyer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<Transaction> orderHistory = new ArrayList<>();

    public Buyer() {
        super();
    }

    public Buyer(String userId, String name, String email, String password, String address) {
        super(userId, name, email, password, address);
        this.cart = new Cart("CART-" + userId, this, new ArrayList<>());
        this.orderHistory = new ArrayList<>();
    }

    public void addToCart(Product p) {
        // Cari apakah produk sudah ada di cart
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
        System.out.println("Produk " + p.getName() + " ditambahkan ke keranjang Buyer: " + getName());
    }

    public void removeFromCart(String id) {
        cart.removeItem(id);
    }

    public Transaction checkout() {
        if (cart.getItemList().isEmpty()) {
            System.out.println("Keranjang kosong, tidak dapat checkout!");
            return null;
        }
        
        List<OrderItem> transactionItems = new ArrayList<>();
        for (OrderItem cartItem : cart.getItemList()) {
            transactionItems.add(new OrderItem(cartItem.getProduct(), cartItem.getQuantity()));
        }
        
        Transaction t = new Transaction(
            "TX-" + System.currentTimeMillis(),
            this,
            transactionItems,
            TransactionStatus.PENDING,
            cart.calculateTotal(),
            new java.util.Date()
        );
        orderHistory.add(t);
        cart.clearCart();
        System.out.println("Checkout berhasil untuk " + getName() + ". Total: Rp" + t.totalAmount);
        return t;
    }

    public List<Transaction> getOrderHistory() {
        return orderHistory;
    }

    public void writeReview(Review r) {
        r.getProduct().addReview(r);
        System.out.println("Buyer " + getName() + " menulis ulasan untuk " + r.getProduct().getName());
    }

    public void viewDashboard() {
        System.out.println("=== Dashboard Buyer " + getName() + " ===");
        System.out.println("Total Belanjaan di Keranjang: " + cart.getItemList().size() + " item");
        System.out.println("Total Riwayat Transaksi: " + orderHistory.size());
    }

    @Override
    public String getRole() {
        return "Buyer";
    }

    // Getters and Setters
    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }
    public void setOrderHistory(List<Transaction> orderHistory) { this.orderHistory = orderHistory; }
}
