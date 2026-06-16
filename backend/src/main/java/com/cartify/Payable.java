package com.cartify;

public interface Payable {
    void pay(double amount);
    String getPaymentStatus();
}
