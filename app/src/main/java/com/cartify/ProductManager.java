/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.cartify;
import java.util.ArrayList;
/**
 *
 * @author HP
 */

public class ProductManager {
    // Menggunakan ArrayList untuk menyimpan semua produk
    private ArrayList<Product> daftarProduk;

    public ProductManager() {
        daftarProduk = new ArrayList<>();
    }

    // CREATE: Menambah produk
    public void tambahProduk(Product produkBaru) {
        daftarProduk.add(produkBaru);
        System.out.println("Produk " + produkBaru.namaProduk + " berhasil ditambahkan.");
    }

    // READ: Menampilkan semua produk
    public void lihatSemuaProduk() {
        for (Product p : daftarProduk) {
            System.out.println(p.id + " | " + p.namaProduk + " | Rp" + p.harga + " | Stok: " + p.cekStok());
        }
    }
    
    public void updateHargaProduk(String idTarget, double hargaBaru) {
        for (Product p : daftarProduk) {
            // Mencari produk yang ID-nya sama dengan idTarget
            if (p.getId().equals(idTarget)) {
                p.setHarga(hargaBaru); // Menggunakan setter untuk mengubah harga
                System.out.println("Harga produk " + p.getNamaProduk() + " berhasil diupdate menjadi Rp" + hargaBaru);
                return; // Menghentikan pencarian setelah produk ditemukan
            }
        }
        System.out.println("Gagal update: Produk dengan ID " + idTarget + " tidak ditemukan.");
    }
    
    public void hapusProduk(String idTarget) {
        for (int i = 0; i < daftarProduk.size(); i++) {
            if (daftarProduk.get(i).getId().equals(idTarget)) {
                System.out.println("Produk " + daftarProduk.get(i).getNamaProduk() + " berhasil dihapus dari katalog.");
                daftarProduk.remove(i); // Menghapus data dari list
                return;
            }
        }
        System.out.println("Gagal hapus: Produk dengan ID " + idTarget + " tidak ditemukan.");
    }
    
    public void filterBerdasarkanKategori(String kategoriTarget) {
        System.out.println("\n--- Hasil Pencarian Kategori: " + kategoriTarget + " ---");
        boolean ditemukan = false;
        
        for (Product p : daftarProduk) {
            // ignoreCase agar tidak peduli huruf besar/kecil (misal: "makanan" = "Makanan")
            if (p.getKategori().equalsIgnoreCase(kategoriTarget)) {
                System.out.println(p.getId() + " | " + p.getNamaProduk() + " | Rp" + p.getHarga());
                ditemukan = true;
            }
        }
        
        if (!ditemukan) {
            System.out.println("Tidak ada produk di kategori " + kategoriTarget);
        }
    }
}
