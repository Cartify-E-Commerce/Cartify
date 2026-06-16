package com.cartify;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "carts")
public class Cart {
    @Id
    private String cartId;

    @OneToOne(mappedBy = "cart", fetch = FetchType.EAGER)
    private User buyer;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "cart_id")
    private List<OrderItem> itemList = new ArrayList<>();

    public Cart() {}

    public Cart(String cartId, User buyer, List<OrderItem> itemList) {
        this.cartId = cartId;
        this.buyer = buyer;
        this.itemList = itemList;
    }

    public void addItem(OrderItem item) {
        itemList.add(item);
        System.out.println("Item " + item.getProduct().getName() + " ditambahkan ke Cart.");
    }

    public void removeItem(String productId) {
        itemList.removeIf(item -> item.getProduct().getProductId().equals(productId));
        System.out.println("Item dengan ProductID " + productId + " dihapus dari Cart.");
    }

    public double calculateTotal() {
        double total = 0.0;
        for (OrderItem item : itemList) {
            total += item.calculateSubtotal();
        }
        return total;
    }

    public void clearCart() {
        itemList.clear();
        System.out.println("Keranjang belanja dibersihkan.");
    }

    // Getters and Setters
    public String getCartId() { return cartId; }
    public void setCartId(String cartId) { this.cartId = cartId; }
    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }
    public List<OrderItem> getItemList() { return itemList; }
    public void setItemList(List<OrderItem> itemList) { this.itemList = itemList; }
}
