package com.cartify;

import java.util.ArrayList;

public class ProductManager {
    private ArrayList<Product> daftarProduk;

    public ProductManager() {
        daftarProduk = new ArrayList<>();
    }

    public void tambahProduk(Product produkBaru) {
        daftarProduk.add(produkBaru);
        System.out.println("Produk " + produkBaru.getName() + " berhasil ditambahkan.");
    }

    public void lihatSemuaProduk() {
        for (Product p : daftarProduk) {
            System.out.println(p.getProductId() + " | " + p.getName() + " | Rp" + p.getPrice() + " | Stok: " + p.getStock());
        }
    }
    
    public void updateHargaProduk(String idTarget, double hargaBaru) {
        for (Product p : daftarProduk) {
            if (p.getProductId().equals(idTarget)) {
                p.setPrice(hargaBaru);
                System.out.println("Harga produk " + p.getName() + " berhasil diupdate menjadi Rp" + hargaBaru);
                return;
            }
        }
        System.out.println("Gagal update: Produk dengan ID " + idTarget + " tidak ditemukan.");
    }
    
    public void hapusProduk(String idTarget) {
        for (int i = 0; i < daftarProduk.size(); i++) {
            if (daftarProduk.get(i).getProductId().equals(idTarget)) {
                System.out.println("Produk " + daftarProduk.get(i).getName() + " berhasil dihapus dari katalog.");
                daftarProduk.remove(i);
                return;
            }
        }
        System.out.println("Gagal hapus: Produk dengan ID " + idTarget + " tidak ditemukan.");
    }
    
    public void filterBerdasarkanKategori(String kategoriTarget) {
        System.out.println("\n--- Hasil Pencarian Kategori: " + kategoriTarget + " ---");
        boolean ditemukan = false;
        
        for (Product p : daftarProduk) {
            if (p.getCategory().equalsIgnoreCase(kategoriTarget)) {
                System.out.println(p.getProductId() + " | " + p.getName() + " | Rp" + p.getPrice());
                ditemukan = true;
            }
        }
        
        if (!ditemukan) {
            System.out.println("Tidak ada produk di kategori " + kategoriTarget);
        }
    }

    public ArrayList<Product> getDaftarProduk() {
        return daftarProduk;
    }
}
