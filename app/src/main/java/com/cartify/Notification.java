package com.cartify;

import java.util.Date;

public class Notification {
    private String notificationId;
    private User recipient;
    private String message;
    private boolean isRead;
    private Date createdAt;

    public Notification(String notificationId, User recipient, String message) {
        this.notificationId = notificationId;
        this.recipient = recipient;
        this.message = message;
        this.isRead = false;
        this.createdAt = new Date();
    }

    public void send() {
        // Simulasi pengiriman notifikasi
        System.out.println("Mengirim notifikasi : " + message);
    }

    public void markAsRead() {
        this.isRead = true;
        System.out.println("Notifikasi " + notificationId + " telah dibaca.");
    }
}