package com.cartify;

public class App {
    public static void main(String[] args) {
        System.out.println("=== TESTING MODUL DASHBOARD & NOTIFIKASI ===");

        // 1. Inisialisasi User (Kita pakai anonymous class karena class User saat ini abstract)
        User testUser = new User("Ryan") {};

        // 2. Inisialisasi Dashboard untuk user tersebut
        Dashboard dashboard = new Dashboard(testUser);

        // 3. Cek summary sebelum ada notifikasi masuk
        System.out.println("\n[1] Summary Awal:");
        System.out.println(dashboard.getSummary());

        // 4. Simulasi Observer Pattern: Dashboard menerima update status pesanan
        System.out.println("\n[2] Simulasi Sistem Menerima Update...");
        dashboard.update("Pesanan #INV-1001 sedang diproses oleh Seller.");
        dashboard.update("Pesanan #INV-1001 telah dikirim via kurir.");

        // 5. Cek summary setelah ada notifikasi masuk
        System.out.println("\n[3] Summary Setelah Update:");
        System.out.println(dashboard.getSummary());

        // 6. Simulasi membaca notifikasi pertama
        System.out.println("\n[4] Simulasi User Membaca Notifikasi...");
        if (!dashboard.getNotifications().isEmpty()) {
            Notification notifPertama = dashboard.getNotifications().get(0);
            notifPertama.markAsRead();
        }
        
        System.out.println("\n=== TESTING SELESAI ===");
    }
}