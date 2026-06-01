package com.cartify;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class SellerController {

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

    @GetMapping("/seller/dashboard")
    public String dashboard(HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return "redirect:/login";
        }

        // Reload seller from DB to get the most updated data
        Seller seller = (Seller) userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (seller == null) {
            return "redirect:/logout";
        }
        session.setAttribute("user", seller);

        // Fetch products belonging to this seller
        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getSeller() != null && p.getSeller().getUserId().equals(seller.getUserId()))
                .collect(Collectors.toList());

        // Fetch all transactions in the system (incoming orders)
        List<Transaction> incomingOrders = transactionRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        // Fetch reviews for products belonging to this seller
        List<Review> reviews = reviewRepository.findAll().stream()
                .filter(r -> r.getProduct() != null && r.getProduct().getSeller() != null && r.getProduct().getSeller().getUserId().equals(seller.getUserId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        // Calculations
        int pesananMasuk = incomingOrders.size();
        int totalProducts = products.size();

        // Get unread notifications count for seller
        long unreadNotifications = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient() != null && n.getRecipient().getUserId().equals(seller.getUserId()) && !n.isRead())
                .count();

        model.addAttribute("user", seller);
        model.addAttribute("products", products);
        model.addAttribute("incomingOrders", incomingOrders);
        model.addAttribute("reviews", reviews);
        model.addAttribute("pesananMasuk", pesananMasuk);
        model.addAttribute("totalProducts", totalProducts);
        model.addAttribute("unreadNotifications", unreadNotifications);

        return "seller-dashboard";
    }

    @PostMapping("/product/add")
    public String addProduct(
            @RequestParam("id") String id,
            @RequestParam("nama") String name,
            @RequestParam("kategori") String category,
            @RequestParam("harga") double price,
            @RequestParam("stok") int stock,
            @RequestParam("description") String description,
            @RequestParam(value = "brand", required = false) String brand,
            @RequestParam(value = "warrantyMonths", required = false) Integer warrantyMonths,
            @RequestParam(value = "expiryDate", required = false) String expiryDate,
            @RequestParam(value = "weightGram", required = false) Double weightGram,
            @RequestParam(value = "size", required = false) String size,
            @RequestParam(value = "material", required = false) String material,
            @RequestParam(value = "color", required = false) String color,
            HttpSession session
    ) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return "redirect:/login";
        }

        Seller seller = (Seller) userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (seller == null) {
            return "redirect:/logout";
        }

        Product newProduct;
        if (category.equalsIgnoreCase("Elektronik")) {
            int warranty = warrantyMonths != null ? warrantyMonths : 12;
            String bName = (brand != null && !brand.trim().isEmpty()) ? brand : "Generic";
            newProduct = new ElectronicProduct(id, name, description, price, stock, seller, bName, warranty);
        } else if (category.equalsIgnoreCase("Makanan")) {
            Date expiry = new Date(System.currentTimeMillis() + 864000000L); // 10 days default
            try {
                if (expiryDate != null && !expiryDate.trim().isEmpty()) {
                    expiry = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(expiryDate);
                }
            } catch (Exception e) {}
            double weight = weightGram != null ? weightGram : 100.0;
            newProduct = new FoodProduct(id, name, description, price, stock, seller, expiry, weight);
        } else {
            // Fashion (Pakaian)
            String pSize = (size != null && !size.trim().isEmpty()) ? size : "M";
            String pMat = (material != null && !material.trim().isEmpty()) ? material : "Cotton";
            String pCol = (color != null && !color.trim().isEmpty()) ? color : "Hitam";
            newProduct = new FashionProduct(id, name, description, price, stock, seller, pSize, pMat, pCol);
        }

        productRepository.save(newProduct);
        
        // Also save updated seller list if needed, although product references it
        seller.addProduct(newProduct);
        userRepository.save(seller);

        return "redirect:/seller/dashboard";
    }

    @PostMapping("/product/delete")
    public String deleteProduct(@RequestParam("id") String id, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return "redirect:/login";
        }

        Seller seller = (Seller) userRepository.findById(loggedInUser.getUserId()).orElse(null);
        Product product = productRepository.findById(id).orElse(null);

        if (seller != null && product != null) {
            seller.removeProduct(id);
            productRepository.delete(product);
            userRepository.save(seller);
        }

        return "redirect:/seller/dashboard";
    }

    @PostMapping("/orders/update")
    public String updateOrderStatus(
            @RequestParam("transactionId") String transactionId,
            @RequestParam("status") String status,
            HttpSession session
    ) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return "redirect:/login";
        }

        Transaction t = transactionRepository.findById(transactionId).orElse(null);
        if (t != null) {
            // Instantiate the Dashboard observer for the buyer
            Dashboard buyerDashboard = new Dashboard(t.getBuyer());
            
            // Register the observer
            t.registerObserver(buyerDashboard);

            // Update status (this will trigger notifyObservers -> buyerDashboard.update)
            TransactionStatus newStatus = TransactionStatus.valueOf(status.toUpperCase());
            t.updateStatus(newStatus);
            transactionRepository.save(t);

            // Save the newly generated notifications from the Observer
            for (Notification notif : buyerDashboard.getNotifications()) {
                notificationRepository.save(notif);
            }
        }

        return "redirect:/seller/dashboard";
    }

    @PostMapping("/review/reply")
    public String replyReview(
            @RequestParam("reviewId") String reviewId,
            @RequestParam("replyText") String replyText,
            HttpSession session
    ) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return "redirect:/login";
        }

        Review r = reviewRepository.findById(reviewId).orElse(null);
        if (r != null) {
            r.setReply(replyText);
            reviewRepository.save(r);

            // Notify buyer
            Notification notif = new Notification(
                "NOTIF-" + System.currentTimeMillis(),
                r.getBuyer(),
                "Penjual telah membalas ulasan Anda untuk produk " + r.getProduct().getName() + ": \"" + replyText + "\""
            );
            notificationRepository.save(notif);
        }

        return "redirect:/seller/dashboard";
    }
}
