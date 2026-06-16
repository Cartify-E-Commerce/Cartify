package com.cartify;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class BuyerController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/buyer/dashboard")
    public String dashboard(HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        // Reload buyer from DB to get the most updated data
        User buyer = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (buyer == null) {
            return "redirect:/logout";
        }
        session.setAttribute("user", buyer);

        // Fetch notifications for this buyer
        List<Notification> notifications = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient() != null && n.getRecipient().getUserId().equals(buyer.getUserId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        // Fetch transactions for this buyer
        List<Transaction> orders = transactionRepository.findAll().stream()
                .filter(t -> t.getBuyer() != null && t.getBuyer().getUserId().equals(buyer.getUserId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        // Fetch reviewed keys (transactionId_productId) for this buyer
        Set<String> reviewedKeys = reviewRepository.findAll().stream()
                .filter(r -> r.getBuyer() != null && r.getBuyer().getUserId().equals(buyer.getUserId()) && r.getTransactionId() != null)
                .map(r -> r.getTransactionId() + "_" + r.getProduct().getProductId())
                .collect(Collectors.toSet());

        // Fetch reviews written by this buyer
        List<Review> myReviews = reviewRepository.findAll().stream()
                .filter(r -> r.getBuyer() != null && r.getBuyer().getUserId().equals(buyer.getUserId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        model.addAttribute("user", buyer);
        model.addAttribute("notifications", notifications);
        model.addAttribute("orders", orders);
        model.addAttribute("reviewedKeys", reviewedKeys);
        model.addAttribute("myReviews", myReviews);

        return "buyer-dashboard";
    }

    @PostMapping("/cart/add")
    public String addToCart(@RequestParam("productId") String productId, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        User buyer = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);

        if (buyer != null && product != null) {
            buyer.addToCart(product);
            userRepository.save(buyer);
            session.setAttribute("user", buyer);
        }

        return "redirect:/index";
    }

    @PostMapping("/cart/remove")
    public String removeFromCart(@RequestParam("productId") String productId, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        User buyer = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (buyer != null) {
            buyer.removeFromCart(productId);
            userRepository.save(buyer);
            session.setAttribute("user", buyer);
        }

        return "redirect:/index";
    }

    @PostMapping("/cart/checkout")
    public String checkout(@RequestParam(value = "shippingAddress", required = false) String shippingAddress, HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        User buyer = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (buyer == null || buyer.getCart().getItemList().isEmpty()) {
            return "redirect:/index";
        }

        String finalAddress = (shippingAddress != null && !shippingAddress.trim().isEmpty()) ? shippingAddress.trim() : buyer.getAddress();
        // Run Checkout (Initial status is PENDING & UNPAID)
        Transaction t = buyer.checkout(finalAddress, "JNE Regular", 15000.0, 0.0, "GoPay");
        if (t != null) {
            // Cascade save will persist the transaction through buyer.orderHistory
            // transactionRepository.save(t);

            // Create notification for order placement
            Notification notif = new Notification(
                "NOTIF-" + System.currentTimeMillis(),
                buyer,
                "Pesanan baru #" + t.getTransactionId() + " telah dibuat. Harap segera selesaikan pembayaran!"
            );
            notificationRepository.save(notif);

            // Save updated buyer state
            userRepository.save(buyer);
            session.setAttribute("user", buyer);

            // Redirect to payment invoice page
            return "redirect:/payment?transactionId=" + t.getTransactionId();
        }

        return "redirect:/index";
    }

    @GetMapping("/payment")
    public String showPaymentPage(@RequestParam("transactionId") String transactionId, HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        Transaction transaction = transactionRepository.findById(transactionId).orElse(null);
        if (transaction == null || !transaction.getBuyer().getUserId().equals(loggedInUser.getUserId())) {
            return "redirect:/buyer/dashboard";
        }

        model.addAttribute("user", loggedInUser);
        model.addAttribute("transaction", transaction);
        return "payment";
    }

    @PostMapping("/payment/process")
    public String processPayment(
            @RequestParam("transactionId") String transactionId,
            @RequestParam("amount") double amount,
            HttpSession session,
            Model model
    ) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        Transaction t = transactionRepository.findById(transactionId).orElse(null);
        if (t == null) {
            return "redirect:/buyer/dashboard";
        }

        // Call the business logic for payment validation
        t.pay(amount);
        transactionRepository.save(t);

        if (t.getPaymentStatus().equals("PAID")) {
            // 1. Reduce product stock
            for (OrderItem item : t.getItemList()) {
                Product product = item.getProduct();
                if (product != null) {
                    product.reduceStock(item.getQuantity());
                    productRepository.save(product);
                }
            }

            // 2. Distribute revenue to the respective sellers
            for (OrderItem item : t.getItemList()) {
                Seller seller = item.getProduct().getSeller();
                if (seller != null) {
                    Seller dbSeller = (Seller) userRepository.findById(seller.getUserId()).orElse(null);
                    if (dbSeller != null) {
                        dbSeller.addRevenue(item.calculateSubtotal());
                        userRepository.save(dbSeller);
                    }
                }
            }

            // 3. Create success notification
            Notification notif = new Notification(
                "NOTIF-" + System.currentTimeMillis(),
                t.getBuyer(),
                "Pembayaran transaksi #" + t.getTransactionId() + " BERHASIL. Pesanan Anda sedang diproses oleh penjual!"
            );
            notificationRepository.save(notif);

            return "redirect:/buyer/dashboard?success=true";
        } else {
            // Payment failed (insufficient amount)
            return "redirect:/payment?transactionId=" + t.getTransactionId() + "&error=true";
        }
    }

    @PostMapping("/orders/cancel")
    public String cancelOrder(@RequestParam("transactionId") String transactionId, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        Transaction t = transactionRepository.findById(transactionId).orElse(null);
        if (t != null && t.getBuyer().getUserId().equals(loggedInUser.getUserId()) && t.getStatus() == TransactionStatus.PENDING) {
            // Instantiate and register Dashboard observer
            Dashboard buyerDashboard = new Dashboard(t.getBuyer());
            t.registerObserver(buyerDashboard);

            // Update status (triggers notifyObservers -> buyerDashboard.update)
            t.updateStatus(TransactionStatus.CANCELLED);
            transactionRepository.save(t);

            // Persist the generated notifications from the Observer
            for (Notification notif : buyerDashboard.getNotifications()) {
                notificationRepository.save(notif);
            }
        }

        return "redirect:/buyer/dashboard";
    }

    @PostMapping("/orders/complete")
    public String completeOrder(@RequestParam("transactionId") String transactionId, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        Transaction t = transactionRepository.findById(transactionId).orElse(null);
        if (t != null && t.getBuyer().getUserId().equals(loggedInUser.getUserId()) && t.getStatus() == TransactionStatus.SHIPPED) {
            // Instantiate and register Dashboard observer
            Dashboard buyerDashboard = new Dashboard(t.getBuyer());
            t.registerObserver(buyerDashboard);

            // Update status (triggers notifyObservers -> buyerDashboard.update)
            t.updateStatus(TransactionStatus.DELIVERED);
            transactionRepository.save(t);

            // Persist the generated notifications from the Observer
            for (Notification notif : buyerDashboard.getNotifications()) {
                notificationRepository.save(notif);
            }
        }

        return "redirect:/buyer/dashboard";
    }

    @GetMapping("/review/write")
    public String showReviewForm(
            @RequestParam("productId") String productId,
            @RequestParam("transactionId") String transactionId,
            HttpSession session,
            Model model
    ) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) {
            return "redirect:/buyer/dashboard";
        }

        model.addAttribute("user", loggedInUser);
        model.addAttribute("product", product);
        model.addAttribute("transactionId", transactionId);
        return "review-write";
    }

    @PostMapping("/review/add")
    public String addReview(
            @RequestParam("productId") String productId,
            @RequestParam("transactionId") String transactionId,
            @RequestParam("rating") int rating,
            @RequestParam("comment") String comment,
            HttpSession session
    ) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        User buyer = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);

        if (buyer != null && product != null) {
            // Restrict review to 1x per transaction/product
            boolean alreadyReviewed = reviewRepository.findAll().stream()
                .anyMatch(r -> r.getTransactionId() != null 
                            && r.getTransactionId().equals(transactionId) 
                            && r.getProduct().getProductId().equals(productId));

            if (!alreadyReviewed) {
                Review review = new Review("REV-" + System.currentTimeMillis(), buyer, product, rating, comment, transactionId, new Date());
                reviewRepository.save(review);

                product.addReview(review);
                productRepository.save(product);

                // Send notification to Seller
                Seller seller = product.getSeller();
                if (seller != null) {
                    Notification notif = new Notification(
                        "NOTIF-" + System.currentTimeMillis(),
                        seller,
                        "Toko Anda menerima ulasan baru (" + rating + " Bintang) untuk produk " + product.getName() + " dari " + buyer.getName()
                    );
                    notificationRepository.save(notif);
                }
            }
        }

        return "redirect:/buyer/dashboard";
    }

    @PostMapping("/notifications/read")
    public String markRead(
            @RequestParam(value = "notificationId", required = false) String notificationId,
            HttpSession session
    ) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return "redirect:/login";
        }

        List<Notification> notifs = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient() != null && n.getRecipient().getUserId().equals(loggedInUser.getUserId()))
                .collect(Collectors.toList());

        for (Notification n : notifs) {
            if (notificationId == null || n.getNotificationId().equals(notificationId)) {
                n.markAsRead();
                notificationRepository.save(n);
            }
        }

        return "redirect:/buyer/dashboard";
    }
}
