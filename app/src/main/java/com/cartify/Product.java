/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.cartify;

/**
 *
 * @author HP
 */
public class Product implements Stockable {
    protected String id;
    protected String namaProduk;
    protected double harga;
    protected String kategori;
    protected double rating;
    protected int stok;

    // Constructor
    public Product(String id, String namaProduk, double harga, String kategori, double rating, int stokAwal) {
        this.id = id;
        this.namaProduk = namaProduk;
        this.harga = harga;
        this.kategori = kategori;
        this.rating = rating;
        this.stok = stokAwal;
    }

    // Implementasi dari interface Stockable
    @Override
    public void tambahStok(int jumlah) {
        this.stok += jumlah;
    }

    @Override
    public void kurangiStok(int jumlah) {
        if (this.stok >= jumlah) {
            this.stok -= jumlah;
        } else {
            System.out.println("Stok tidak mencukupi!");
        }
    }

    @Override
    public int cekStok() {
        return this.stok;
    }  

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNamaProduk() {
        return namaProduk;
    }

    public void setNamaProduk(String namaProduk) {
        this.namaProduk = namaProduk;
    }

    public double getHarga() {
        return harga;
    }

    public void setHarga(double harga) {
        this.harga = harga;
    }

    public String getKategori() {
        return kategori;
    }

    public void setKategori(String kategori) {
        this.kategori = kategori;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getStok() {
        return stok;
    }

    public void setStok(int stok) {
        this.stok = stok;
    }
    
}
