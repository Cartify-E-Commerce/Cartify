package com.cartify;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    private String notificationId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_id")
    private User recipient;
    private String message;
    private boolean isRead;
    private Date createdAt;

    public Notification() {}

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

    public String getNotificationId() {
        return notificationId;
    }

    public User getRecipient() {
        return recipient;
    }

    public String getMessage() {
        return message;
    }

    public boolean isRead() {
        return isRead;
    }

    public Date getCreatedAt() {
        return createdAt;
    }
}