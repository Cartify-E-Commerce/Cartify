/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.cartify;

/**
 *
 * @author HP
 */
public class Elektronik extends Product {
    private int masaGaransiBulan;

    // Constructor khusus untuk Elektronik
    public Elektronik(String id, String namaProduk, double harga, double rating, int stokAwal, int masaGaransiBulan) {
        // Memanggil constructor dari class induk (Product) menggunakan super()
        super(id, namaProduk, harga, "Elektronik", rating, stokAwal);
        this.masaGaransiBulan = masaGaransiBulan;
    }

    public int getMasaGaransiBulan() {
        return masaGaransiBulan;
    }
}
