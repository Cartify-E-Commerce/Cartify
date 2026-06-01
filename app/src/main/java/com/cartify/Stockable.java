package com.cartify;

public interface Stockable {
    void addStock(int qty);
    void reduceStock(int qty);
    int getStock();
}
