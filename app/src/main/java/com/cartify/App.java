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
        
        System.out.println("\n\n=== TESTING MODUL MANAJEMEN PRODUK ===");
        
        // 1. Inisialisasi ProductManager
        ProductManager manager = new ProductManager();

        // 2. Memasukkan Data Awal (Dummy Data)
        Elektronik hp = new Elektronik("E01", "Poco X7 Pro", 4500000, 4.8, 10, 12);
        Makanan roti = new Makanan("M01", "Sari Roti Coklat", 15000, 4.5, 50, "2026-06-05");
        Pakaian kaos = new Pakaian("P01", "Kaos Polos Hitam", 50000, 4.7, 100, "L");

        System.out.println("[1] Menambahkan Produk ke Katalog...");
        manager.tambahProduk(hp);
        manager.tambahProduk(roti);
        manager.tambahProduk(kaos);

        // 3. Menampilkan produk ke terminal
        System.out.println("\n[2] Katalog Produk Saat Ini:");
        manager.lihatSemuaProduk();

        System.out.println("\n=== TESTING KESELURUHAN SELESAI ===");
    }
}