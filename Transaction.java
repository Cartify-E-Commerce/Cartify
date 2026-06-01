import java.time.LocalDateTime;

public class Transaction implements Payable {

    private String transactionId;
    private Cart cart;
    private LocalDateTime transactionDate;
    private double shippingCost;

    public Transaction(
            String transactionId,
            Cart cart,
            double shippingCost) {

        this.transactionId = transactionId;
        this.cart = cart;
        this.shippingCost = shippingCost;
        this.transactionDate = LocalDateTime.now();
    }

    public String getTransactionId() {
        return transactionId;
    }

    public Cart getCart() {
        return cart;
    }

    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }

    public double getShippingCost() {
        return shippingCost;
    }

    @Override
    public double calculateTotal() {
        return cart.calculateTotal() + shippingCost;
    }
}