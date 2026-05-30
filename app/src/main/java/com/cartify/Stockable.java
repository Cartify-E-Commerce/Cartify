/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package com.cartify;

/**
 *
 * @author HP
 */
public interface Stockable {
    void tambahStok(int jumlah);
    void kurangiStok(int jumlah);
    int cekStok();   
}
