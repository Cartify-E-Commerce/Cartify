package com.cartify;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "transactions")
public class Transaction implements Payable, Subject {
    @Id
    protected String transactionId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "buyer_id")
    protected Buyer buyer;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "transaction_id")
    protected List<OrderItem> itemList = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    protected TransactionStatus status;
    protected double totalAmount;
    protected Date createdAt;
    private String paymentStatus;

    @Transient
    private List<Observer> observers = new ArrayList<>();

    public Transaction() {}

    public Transaction(String transactionId, Buyer buyer, List<OrderItem> itemList, TransactionStatus status, double totalAmount, Date createdAt) {
        this.transactionId = transactionId;
        this.buyer = buyer;
        this.itemList = itemList;
        this.status = status;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt;
        this.paymentStatus = "UNPAID";
    }

    @Override
    public void registerObserver(Observer o) {
        if (observers == null) {
            observers = new ArrayList<>();
        }
        observers.add(o);
    }

    @Override
    public void removeObserver(Observer o) {
        if (observers != null) {
            observers.remove(o);
        }
    }

    @Override
    public void notifyObservers(String statusMessage) {
        if (observers == null) {
            observers = new ArrayList<>();
        }
        for (Observer o : observers) {
            o.update(statusMessage);
        }
    }

    @Override
    public void pay(double amount) {
        if (amount >= totalAmount) {
            this.paymentStatus = "PAID";
            this.status = TransactionStatus.PROCESSING;
            System.out.println("Pembayaran untuk transaksi " + transactionId + " BERHASIL sebesar Rp" + amount);
        } else {
            System.out.println("Pembayaran GAGAL: Jumlah pembayaran Rp" + amount + " kurang dari Rp" + totalAmount);
        }
    }

    @Override
    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void updateStatus(TransactionStatus s) {
        this.status = s;
        System.out.println("Status transaksi " + transactionId + " diperbarui menjadi: " + s);
        notifyObservers("Status pesanan Anda #" + transactionId + " telah diupdate oleh Seller menjadi: " + s);
    }

    // Getters and Setters
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public Buyer getBuyer() { return buyer; }
    public void setBuyer(Buyer buyer) { this.buyer = buyer; }
    public List<OrderItem> getItemList() { return itemList; }
    public void setItemList(List<OrderItem> itemList) { this.itemList = itemList; }
    public TransactionStatus getStatus() { return status; }
    public void setStatus(TransactionStatus status) { this.status = status; }
    public double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(double totalAmount) { this.totalAmount = totalAmount; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
}
