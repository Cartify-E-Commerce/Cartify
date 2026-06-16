package com.cartify;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.*;
import java.util.stream.Collectors;

@Controller
public class MainController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @GetMapping("/")
    public String landing(HttpSession session, Model model) {
        User loggedInUser = (User) session.getAttribute("user");
        model.addAttribute("user", loggedInUser);
        return "landing";
    }

    @GetMapping("/index")
    public String index(
            @RequestParam(value = "kategori", required = false) String kategori,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sortBy", required = false) String sortBy,
            HttpSession session,
            Model model
    ) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser != null) {
            // Reload user from DB to get fresh state
            loggedInUser = userRepository.findById(loggedInUser.getUserId()).orElse(null);
            session.setAttribute("user", loggedInUser);
        }
        
        List<Product> products = productRepository.findAll();
        
        // Dynamic in-memory filtering based on polymorphic getCategory()
        if (kategori != null && !kategori.trim().isEmpty()) {
            products = products.stream()
                .filter(p -> p.getCategory().equalsIgnoreCase(kategori))
                .collect(Collectors.toList());
        }
        if (search != null && !search.trim().isEmpty()) {
            String q = search.toLowerCase();
            products = products.stream()
                .filter(p -> p.getName().toLowerCase().contains(q))
                .collect(Collectors.toList());
        }

        // Apply Sorting
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            if (sortBy.equalsIgnoreCase("price_asc")) {
                products.sort(Comparator.comparingDouble(Product::getPrice));
            } else if (sortBy.equalsIgnoreCase("price_desc")) {
                products.sort((a, b) -> Double.compare(b.getPrice(), a.getPrice()));
            } else if (sortBy.equalsIgnoreCase("rating_desc")) {
                products.sort((a, b) -> Double.compare(b.getAverageRating(), a.getAverageRating()));
            } else if (sortBy.equalsIgnoreCase("newest")) {
                products.sort((a, b) -> b.getProductId().compareTo(a.getProductId()));
            }
        }

        int cartCount = 0;
        int unreadNotifications = 0;

        if (loggedInUser != null) {
            User buyer = loggedInUser;
            if (buyer.getCart() != null && buyer.getCart().getItemList() != null) {
                cartCount = buyer.getCart().getItemList().stream().mapToInt(OrderItem::getQuantity).sum();
            }
            
            // Get unread notifications
            List<Notification> notifs = notificationRepository.findAll();
            for (Notification n : notifs) {
                if (n.getRecipient() != null && n.getRecipient().getUserId().equals(buyer.getUserId()) && !n.isRead()) {
                    unreadNotifications++;
                }
            }
        }

        model.addAttribute("user", loggedInUser);
        model.addAttribute("products", products);
        model.addAttribute("cartCount", cartCount);
        model.addAttribute("unreadNotifications", unreadNotifications);
        model.addAttribute("selectedCategory", kategori);
        model.addAttribute("searchKeyword", search);
        model.addAttribute("selectedSort", sortBy);

        return "index";
    }

    @CrossOrigin(origins = "${cartify.cors.allowed-origin}", allowCredentials = "true")
    @GetMapping("/api/products/detail")
    @ResponseBody
    public Map<String, Object> productDetail(@RequestParam("productId") String productId) {
        Product targetProduct = productRepository.findById(productId).orElse(null);
        if (targetProduct == null) {
            Map<String, Object> err = new HashMap<>();
            err.put("status", "error");
            err.put("message", "Product not found");
            return err;
        }

        RatingCalculator calc = new RatingCalculator(5);
        double avg = calc.calculate(targetProduct.getAllReviews());
        int totalRev = calc.getTotalReviews();
        Map<Integer, Integer> dist = calc.getRatingDistribution();

        Map<String, Object> response = new HashMap<>();
        response.put("id", targetProduct.getProductId());
        response.put("nama", targetProduct.getName());
        response.put("kategori", targetProduct.getCategory());
        response.put("harga", targetProduct.getPrice());
        response.put("stok", targetProduct.getStock());
        response.put("deskripsi", targetProduct.getDescription());
        response.put("imageUrl", targetProduct.getImageUrl());
        response.put("averageRating", avg);
        response.put("totalReviews", totalRev);
        response.put("distribution", dist);

        if (targetProduct.getSeller() != null) {
            Map<String, Object> sMap = new HashMap<>();
            sMap.put("userId", targetProduct.getSeller().getUserId());
            sMap.put("shopName", targetProduct.getSeller().getShopName());
            response.put("seller", sMap);
        }

        Map<String, String> specs = new LinkedHashMap<>();
        if (targetProduct instanceof ElectronicProduct) {
            specs.put("Brand", ((ElectronicProduct) targetProduct).getBrand());
            specs.put("Garansi", ((ElectronicProduct) targetProduct).getWarrantyInfo());
        } else if (targetProduct instanceof FoodProduct) {
            specs.put("Expired", ((FoodProduct) targetProduct).getExpiryDate().toString());
            specs.put("ExpiredStatus", ((FoodProduct) targetProduct).isExpired() ? "EXPIRED" : "AMAN");
            specs.put("Berat", ((FoodProduct) targetProduct).getWeightGram() + " gram");
        } else if (targetProduct instanceof FashionProduct) {
            specs.put("Ukuran", ((FashionProduct) targetProduct).getSize());
            specs.put("Bahan", ((FashionProduct) targetProduct).getMaterial());
            specs.put("Warna", ((FashionProduct) targetProduct).getColor());
            specs.put("UkuranTersedia", "S, M, L, XL, XXL");
        }
        response.put("spesifikasi", specs);

        List<Map<String, Object>> reviews = new ArrayList<>();
        for (Review r : targetProduct.getAllReviews()) {
            Map<String, Object> revMap = new HashMap<>();
            revMap.put("namaBuyer", r.getBuyer().getName());
            revMap.put("rating", r.getRating());
            revMap.put("komentar", r.getComment());
            revMap.put("balasan", r.getReply());
            revMap.put("tanggal", r.getCreatedAt().toString());
            reviews.add(revMap);
        }
        response.put("reviews", reviews);

        return response;
    }

    @GetMapping("/login")
    public String loginPage(HttpSession session, Model model) {
        if (session.getAttribute("user") != null) {
            return "redirect:/index";
        }
        return "login";
    }

    @PostMapping("/login")
    public String login(
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            HttpSession session,
            Model model
    ) {
        Optional<User> optUser = userRepository.findByEmail(email.trim().toLowerCase());
        if (optUser.isPresent() && optUser.get().getPassword().equals(password)) {
            User user = optUser.get();
            user.login();
            session.setAttribute("user", user);
            if (user instanceof Seller) {
                return "redirect:/seller/dashboard";
            } else {
                return "redirect:/index";
            }
        }
        model.addAttribute("error", "Email atau password salah!");
        return "login";
    }

    @PostMapping("/register")
    public String register(
            @RequestParam("role") String role,
            @RequestParam("name") String name,
            @RequestParam("email") String email,
            @RequestParam("password") String password,
            @RequestParam("address") String address,
            @RequestParam(value = "shopName", required = false) String shopName,
            Model model
    ) {
        if (userRepository.findByEmail(email.trim().toLowerCase()).isPresent()) {
            model.addAttribute("errorReg", "Email ini sudah terdaftar!");
            model.addAttribute("activeTab", "register");
            return "login";
        }

        String id = "U-" + System.currentTimeMillis();
        User newUser;
        if (role.equalsIgnoreCase("Seller")) {
            String actualShopName = (shopName == null || shopName.trim().isEmpty()) ? "Toko " + name : shopName;
            newUser = new Seller(id, name, email.trim().toLowerCase(), password, address, actualShopName);
        } else {
            newUser = new Buyer(id, name, email.trim().toLowerCase(), password, address);
        }

        userRepository.save(newUser);
        model.addAttribute("successReg", "Pendaftaran Akun Berhasil! Silakan Masuk.");
        model.addAttribute("activeTab", "login");
        return "login";
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            user.logout();
        }
        session.invalidate();
        return "redirect:/";
    }
}
