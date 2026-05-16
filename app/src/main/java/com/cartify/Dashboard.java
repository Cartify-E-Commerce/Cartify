package com.cartify;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Dashboard implements Observer {
    private User user;
    private List<Notification> notificationList;

    public Dashboard(User user) {
        this.user = user;
        this.notificationList = new ArrayList<>();
    }

    public Map<String, Object> getSummary() {
        // Mengembalikan summary dalam bentuk Map sesuai Class Diagram
        Map<String, Object> summary = new HashMap<>();
        summary.put("Total Notifikasi", notificationList.size());
        summary.put("Status", "Aktif");
        return summary;
    }

    public List<Notification> getNotifications() {
        return notificationList;
    }

    public void refresh() {
        System.out.println("Dashboard sedang di-refresh...");
    }

    // Implementasi dari Observer Pattern untuk menerima update status
    @Override
    public void update(String statusMessage) {
        Notification newNotif = new Notification(
            "NOTIF-" + System.currentTimeMillis(),
            this.user,
            statusMessage
        );
        notificationList.add(newNotif);
        newNotif.send();
    }
}