package com.cartify;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import jakarta.servlet.http.HttpSession;
import java.util.*;
import java.util.stream.Collectors;
import org.mindrot.jbcrypt.BCrypt;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${cartify.cors.allowed-origin}", allowCredentials = "true")
public class ApiController {

    @Value("${google.client.id}")
    private String googleClientId;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    // Helper to format User details safely
    private Map<String, Object> formatUser(User user) {
        if (user == null) return null;
        Map<String, Object> uMap = new HashMap<>();
        uMap.put("userId", user.getUserId());
        uMap.put("name", user.getName());
        uMap.put("email", user.getEmail());
        uMap.put("address", user.getAddress());
        uMap.put("role", user.getRole());
        uMap.put("profilePhoto", user.getProfilePhoto());
        if (user instanceof Seller) {
            uMap.put("shopName", ((Seller) user).getShopName());
            uMap.put("shopCategory", ((Seller) user).getShopCategory());
            uMap.put("revenue", ((Seller) user).getTotalRevenue());
        }
        return uMap;
    }

    // Helper to format Product safely
    private Map<String, Object> formatProduct(Product p) {
        if (p == null) return null;
        Map<String, Object> pMap = new HashMap<>();
        pMap.put("productId", p.getProductId());
        pMap.put("name", p.getName());
        pMap.put("category", p.getCategory());
        pMap.put("price", p.getPrice());
        pMap.put("stock", p.getStock());
        pMap.put("description", p.getDescription());
        pMap.put("averageRating", p.getAverageRating());
        
        if (p.getSeller() != null) {
            Map<String, Object> sMap = new HashMap<>();
            sMap.put("userId", p.getSeller().getUserId());
            sMap.put("shopName", p.getSeller().getShopName());
            pMap.put("seller", sMap);
        }
        return pMap;
    }

    // Helper to format Notification safely
    private Map<String, Object> formatNotification(Notification n) {
        if (n == null) return null;
        Map<String, Object> nMap = new HashMap<>();
        nMap.put("notificationId", n.getNotificationId());
        nMap.put("message", n.getMessage());
        nMap.put("read", n.isRead());
        nMap.put("createdAt", n.getCreatedAt());
        return nMap;
    }

    // Helper to format Transaction safely
    private Map<String, Object> formatTransaction(Transaction t) {
        if (t == null) return null;
        Map<String, Object> tMap = new HashMap<>();
        tMap.put("transactionId", t.getTransactionId());
        tMap.put("status", t.getStatus().toString());
        tMap.put("totalAmount", t.getTotalAmount());
        tMap.put("createdAt", t.getCreatedAt());
        tMap.put("paymentStatus", t.getPaymentStatus());
        tMap.put("shippingAddress", t.getShippingAddress());
        tMap.put("courier", t.getCourier());
        tMap.put("shippingCost", t.getShippingCost());
        tMap.put("discount", t.getDiscount());
        tMap.put("paymentMethod", t.getPaymentMethod());

        List<Map<String, Object>> items = new ArrayList<>();
        for (OrderItem item : t.getItemList()) {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("quantity", item.getQuantity());
            itemMap.put("product", formatProduct(item.getProduct()));
            items.add(itemMap);
        }
        tMap.put("itemList", items);
        return tMap;
    }

    // Helper to format Review safely
    private Map<String, Object> formatReview(Review r) {
        if (r == null) return null;
        Map<String, Object> rMap = new HashMap<>();
        rMap.put("reviewId", r.getReviewId());
        rMap.put("rating", r.getRating());
        rMap.put("comment", r.getComment());
        rMap.put("reply", r.getReply());
        rMap.put("transactionId", r.getTransactionId());
        rMap.put("createdAt", r.getCreatedAt());
        if (r.getBuyer() != null) {
            rMap.put("buyerName", r.getBuyer().getName());
        }
        if (r.getProduct() != null) {
            rMap.put("productId", r.getProduct().getProductId());
            rMap.put("productName", r.getProduct().getName());
        }
        return rMap;
    }

    // AUTH API
    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, HttpSession session) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email dan password wajib diisi!"));
        }

        Optional<User> optUser = userRepository.findByEmail(email.trim().toLowerCase());
        if (optUser.isPresent() && (optUser.get().getPassword().equals(password) || BCrypt.checkpw(password, optUser.get().getPassword()))) {
            User user = optUser.get();
            user.login();
            session.setAttribute("user", user);
            return ResponseEntity.ok(Map.of("status", "success", "user", formatUser(user)));
        }
        return ResponseEntity.status(401).body(Map.of("message", "Email atau password salah!"));
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> payload) {
        String name = payload.get("name");
        String email = payload.get("email");
        String password = payload.get("password");
        String address = payload.get("address");

        if (name == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama lengkap, email, dan password wajib diisi!"));
        }

        if (userRepository.findByEmail(email.trim().toLowerCase()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email ini sudah terdaftar!"));
        }

        String id = "U-" + System.currentTimeMillis();
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        String actualAddress = address == null ? "" : address;
        User newUser = new Buyer(id, name, email.trim().toLowerCase(), hashedPassword, actualAddress);

        userRepository.save(newUser);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Pendaftaran akun berhasil!"));
    }

    @PostMapping("/auth/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> payload, HttpSession session) {
        String idToken = payload.get("idToken");
        if (idToken == null || idToken.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "ID Token tidak boleh kosong!"));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String verificationUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            Map<String, Object> response = restTemplate.getForObject(verificationUrl, Map.class);

            if (response == null || response.containsKey("error")) {
                return ResponseEntity.status(401).body(Map.of("message", "Token Google tidak valid!"));
            }

            // Verify audience
            String aud = (String) response.get("aud");
            if (aud == null || !aud.equals(googleClientId)) {
                return ResponseEntity.status(401).body(Map.of("message", "Client ID tidak cocok!"));
            }

            String email = ((String) response.get("email")).trim().toLowerCase();

            Optional<User> optUser = userRepository.findByEmail(email);
            if (!optUser.isPresent()) {
                return ResponseEntity.status(404).body(Map.of("message", "Akun Google Anda belum terdaftar. Silakan pilih tab 'Daftar Akun' untuk mendaftar terlebih dahulu."));
            }

            User user = optUser.get();
            user.login();
            session.setAttribute("user", user);
            return ResponseEntity.ok(Map.of("status", "success", "user", formatUser(user)));

        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Gagal memverifikasi login Google: " + e.getMessage()));
        }
    }

    @PostMapping("/auth/register/google")
    public ResponseEntity<?> registerWithGoogle(@RequestBody Map<String, String> payload) {
        String idToken = payload.get("idToken");

        if (idToken == null || idToken.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Token Google wajib diisi!"));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();
            String verificationUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            Map<String, Object> response = restTemplate.getForObject(verificationUrl, Map.class);

            if (response == null || response.containsKey("error")) {
                return ResponseEntity.status(401).body(Map.of("message", "Token Google tidak valid!"));
            }

            // Verify audience
            String aud = (String) response.get("aud");
            if (aud == null || !aud.equals(googleClientId)) {
                return ResponseEntity.status(401).body(Map.of("message", "Client ID tidak cocok!"));
            }

            String email = ((String) response.get("email")).trim().toLowerCase();
            String name = (String) response.get("name");
            if (name == null || name.trim().isEmpty()) {
                name = "Google User";
            }

            if (userRepository.findByEmail(email).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email Google ini sudah terdaftar!"));
            }

            String id = "U-" + System.currentTimeMillis();
            String randomPassword = BCrypt.hashpw(UUID.randomUUID().toString(), BCrypt.gensalt());
            User newUser = new Buyer(id, name, email, randomPassword, "");

            userRepository.save(newUser);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Pendaftaran akun dengan Google berhasil!"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Gagal memverifikasi pendaftaran Google: " + e.getMessage()));
        }
    }


    @GetMapping("/auth/me")
    public ResponseEntity<?> me(HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Belum masuk"));
        }
        // Refresh state from DB
        User dbUser = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (dbUser == null) {
            session.invalidate();
            return ResponseEntity.status(401).body(Map.of("message", "User tidak ditemukan"));
        }
        session.setAttribute("user", dbUser);
        return ResponseEntity.ok(Map.of("user", formatUser(dbUser)));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout(HttpSession session) {
        User user = (User) session.getAttribute("user");
        if (user != null) {
            user.logout();
        }
        session.invalidate();
        return ResponseEntity.ok(Map.of("status", "success", "message", "Berhasil keluar"));
    }

    @PostMapping("/auth/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Belum masuk"));
        }

        User user = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User tidak ditemukan"));
        }

        String name = payload.get("name");
        String address = payload.get("address");
        String profilePhoto = payload.get("profilePhoto");

        if (name != null && !name.trim().isEmpty()) {
            user.setName(name);
        }
        if (address != null) {
            user.setAddress(address);
        }
        if (profilePhoto != null) {
            user.setProfilePhoto(profilePhoto);
        }

        if (user instanceof Seller) {
            String shopName = payload.get("shopName");
            if (shopName != null && !shopName.trim().isEmpty()) {
                ((Seller) user).setShopName(shopName);
            }
        }

        userRepository.save(user);
        session.setAttribute("user", user);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Profil berhasil diperbarui!", "user", formatUser(user)));
    }

    @PostMapping("/auth/become-seller")
    public ResponseEntity<?> becomeSeller(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Belum masuk"));
        }

        String shopName = payload.get("shopName");
        String shopCategory = payload.get("shopCategory");
        if (shopName == null || shopName.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama toko wajib diisi!"));
        }
        if (shopCategory == null || shopCategory.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Kategori toko wajib diisi!"));
        }

        userRepository.convertBuyerToSeller(loggedInUser.getUserId(), shopName, shopCategory);

        User refreshedUser = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        session.setAttribute("user", refreshedUser);

        return ResponseEntity.ok(Map.of(
            "status", "success",
            "message", "Selamat! Toko Anda '" + shopName + "' dengan kategori '" + shopCategory + "' berhasil diaktifkan.",
            "user", formatUser(refreshedUser)
        ));
    }



    // PRODUCTS API
    @GetMapping("/products")
    public ResponseEntity<?> getProducts(
            @RequestParam(value = "kategori", required = false) String kategori,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "sortBy", required = false) String sortBy
    ) {
        List<Product> products = productRepository.findAll();

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

        List<Map<String, Object>> formatted = products.stream().map(this::formatProduct).collect(Collectors.toList());
        return ResponseEntity.ok(formatted);
    }

    // SHOPS API
    @GetMapping("/shops")
    public ResponseEntity<?> getShops(@RequestParam(value = "category", required = false) String category) {
        List<User> users = userRepository.findAll();
        List<Map<String, Object>> sellers = users.stream()
                .filter(u -> u instanceof Seller)
                .map(u -> (Seller) u)
                .filter(s -> category == null || category.trim().isEmpty() || (s.getShopCategory() != null && s.getShopCategory().equalsIgnoreCase(category)))
                .map(s -> {
                    Map<String, Object> sMap = new HashMap<>();
                    sMap.put("userId", s.getUserId());
                    sMap.put("name", s.getName());
                    sMap.put("email", s.getEmail());
                    sMap.put("address", s.getAddress());
                    sMap.put("profilePhoto", s.getProfilePhoto());
                    sMap.put("shopName", s.getShopName());
                    sMap.put("shopCategory", s.getShopCategory());
                    
                    List<Map<String, Object>> pList = new ArrayList<>();
                    if (s.getProductList() != null) {
                        for (Product p : s.getProductList()) {
                            Map<String, Object> pMap = new HashMap<>();
                            pMap.put("productId", p.getProductId());
                            pMap.put("name", p.getName());
                            pMap.put("category", p.getCategory());
                            pMap.put("price", p.getPrice());
                            pMap.put("stock", p.getStock());
                            pMap.put("description", p.getDescription());
                            pMap.put("averageRating", p.getAverageRating());
                            pList.add(pMap);
                        }
                    }
                    sMap.put("products", pList);
                    return sMap;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(sellers);
    }

    @GetMapping("/shops/{shopId}")
    public ResponseEntity<?> getShopDetail(@PathVariable("shopId") String shopId) {
        User user = userRepository.findById(shopId).orElse(null);
        if (user == null || !(user instanceof Seller)) {
            return ResponseEntity.status(404).body(Map.of("message", "Toko tidak ditemukan"));
        }
        Seller s = (Seller) user;
        Map<String, Object> sMap = new HashMap<>();
        sMap.put("userId", s.getUserId());
        sMap.put("name", s.getName());
        sMap.put("email", s.getEmail());
        sMap.put("address", s.getAddress());
        sMap.put("profilePhoto", s.getProfilePhoto());
        sMap.put("shopName", s.getShopName());
        sMap.put("shopCategory", s.getShopCategory());
        
        List<Map<String, Object>> pList = new ArrayList<>();
        if (s.getProductList() != null) {
            for (Product p : s.getProductList()) {
                Map<String, Object> pMap = new HashMap<>();
                pMap.put("productId", p.getProductId());
                pMap.put("name", p.getName());
                pMap.put("category", p.getCategory());
                pMap.put("price", p.getPrice());
                pMap.put("stock", p.getStock());
                pMap.put("description", p.getDescription());
                pMap.put("averageRating", p.getAverageRating());
                pList.add(pMap);
            }
        }
        sMap.put("products", pList);
        return ResponseEntity.ok(sMap);
    }

    // BUYER DASHBOARD API
    @GetMapping("/buyer/dashboard")
    public ResponseEntity<?> buyerDashboard(HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        User buyer = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (buyer == null) return ResponseEntity.status(404).body(Map.of("message", "User tidak ditemukan"));

        List<Notification> notifications = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient() != null && n.getRecipient().getUserId().equals(buyer.getUserId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        List<Transaction> orders = transactionRepository.findAll().stream()
                .filter(t -> t.getBuyer() != null && t.getBuyer().getUserId().equals(buyer.getUserId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        Set<String> reviewedKeys = reviewRepository.findAll().stream()
                .filter(r -> r.getBuyer() != null && r.getBuyer().getUserId().equals(buyer.getUserId()) && r.getTransactionId() != null)
                .map(r -> r.getTransactionId() + "_" + r.getProduct().getProductId())
                .collect(Collectors.toSet());

        List<Review> myReviews = reviewRepository.findAll().stream()
                .filter(r -> r.getBuyer() != null && r.getBuyer().getUserId().equals(buyer.getUserId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("user", formatUser(buyer));
        data.put("notifications", notifications.stream().map(this::formatNotification).collect(Collectors.toList()));
        data.put("orders", orders.stream().map(this::formatTransaction).collect(Collectors.toList()));
        data.put("reviewedKeys", reviewedKeys);
        data.put("myReviews", myReviews.stream().map(this::formatReview).collect(Collectors.toList()));

        // Include Cart count
        int cartCount = 0;
        if (buyer.getCart() != null && buyer.getCart().getItemList() != null) {
            cartCount = buyer.getCart().getItemList().stream().mapToInt(OrderItem::getQuantity).sum();
        }
        data.put("cartCount", cartCount);

        List<Map<String, Object>> cartItems = new ArrayList<>();
        if (buyer.getCart() != null && buyer.getCart().getItemList() != null) {
            for (OrderItem item : buyer.getCart().getItemList()) {
                Map<String, Object> ci = new HashMap<>();
                ci.put("quantity", item.getQuantity());
                ci.put("product", formatProduct(item.getProduct()));
                cartItems.add(ci);
            }
        }
        data.put("cartItems", cartItems);
        data.put("cartTotal", buyer.getCart() != null ? buyer.getCart().calculateTotal() : 0.0);

        return ResponseEntity.ok(data);
    }

    // CART ACTIONS
    @PostMapping("/cart/add")
    public ResponseEntity<?> addToCart(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String productId = payload.get("productId");
        User buyer = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);

        if (buyer != null && product != null) {
            buyer.addToCart(product);
            userRepository.save(buyer);
            session.setAttribute("user", buyer);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Berhasil menambahkan ke keranjang"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Buyer atau Produk tidak ditemukan"));
    }

    @PostMapping("/cart/remove")
    public ResponseEntity<?> removeFromCart(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String productId = payload.get("productId");
        User buyer = userRepository.findById(loggedInUser.getUserId()).orElse(null);

        if (buyer != null) {
            buyer.removeFromCart(productId);
            userRepository.save(buyer);
            session.setAttribute("user", buyer);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Berhasil menghapus dari keranjang"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Buyer tidak ditemukan"));
    }

    @PostMapping("/cart/checkout")
    public ResponseEntity<?> checkout(@RequestBody(required = false) Map<String, Object> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        User buyer = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (buyer == null || buyer.getCart().getItemList().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Keranjang Anda kosong!"));
        }

        String shippingAddress = buyer.getAddress();
        String courier = "JNE Regular";
        double shippingCost = 15000.0;
        double discount = 0.0;
        String paymentMethod = "GoPay";

        if (payload != null) {
            if (payload.get("shippingAddress") != null) shippingAddress = payload.get("shippingAddress").toString();
            if (payload.get("courier") != null) courier = payload.get("courier").toString();
            if (payload.get("shippingCost") != null) shippingCost = Double.parseDouble(payload.get("shippingCost").toString());
            if (payload.get("discount") != null) discount = Double.parseDouble(payload.get("discount").toString());
            if (payload.get("paymentMethod") != null) paymentMethod = payload.get("paymentMethod").toString();
        }

        Transaction t = buyer.checkout(shippingAddress, courier, shippingCost, discount, paymentMethod);
        if (t != null) {
            Notification notif = new Notification(
                    "NOTIF-" + System.currentTimeMillis(),
                    buyer,
                    "Pesanan baru #" + t.getTransactionId() + " telah dibuat. Harap segera selesaikan pembayaran!"
            );
            notificationRepository.save(notif);
            userRepository.save(buyer);
            session.setAttribute("user", buyer);
            return ResponseEntity.ok(Map.of("status", "success", "transactionId", t.getTransactionId()));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Checkout gagal"));
    }

    // TRANSACTION DETAIL
    @GetMapping("/payment")
    public ResponseEntity<?> showPayment(@RequestParam("transactionId") String transactionId, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        Transaction transaction = transactionRepository.findById(transactionId).orElse(null);
        if (transaction == null || !transaction.getBuyer().getUserId().equals(loggedInUser.getUserId())) {
            return ResponseEntity.status(404).body(Map.of("message", "Transaksi tidak ditemukan"));
        }

        return ResponseEntity.ok(formatTransaction(transaction));
    }

    // PROCESS PAYMENT
    @PostMapping("/payment/process")
    public ResponseEntity<?> processPayment(@RequestBody Map<String, Object> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String transactionId = (String) payload.get("transactionId");
        double amount = Double.parseDouble(payload.get("amount").toString());

        Transaction t = transactionRepository.findById(transactionId).orElse(null);
        if (t == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Transaksi tidak ditemukan"));
        }

        t.pay(amount);
        transactionRepository.save(t);

        if (t.getPaymentStatus().equals("PAID")) {
            // Reduce stock
            for (OrderItem item : t.getItemList()) {
                Product product = item.getProduct();
                if (product != null) {
                    product.reduceStock(item.getQuantity());
                    productRepository.save(product);
                }
            }

            // Add revenue to Seller
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

            Notification notif = new Notification(
                    "NOTIF-" + System.currentTimeMillis(),
                    t.getBuyer(),
                    "Pembayaran transaksi #" + t.getTransactionId() + " BERHASIL. Pesanan Anda sedang diproses oleh penjual!"
            );
            notificationRepository.save(notif);

            return ResponseEntity.ok(Map.of("status", "success", "message", "Pembayaran Berhasil!"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("message", "Jumlah pembayaran kurang!"));
        }
    }

    // BUYER ACTIONS
    @PostMapping("/orders/cancel")
    public ResponseEntity<?> cancelOrder(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String transactionId = payload.get("transactionId");
        Transaction t = transactionRepository.findById(transactionId).orElse(null);
        if (t != null && t.getBuyer().getUserId().equals(loggedInUser.getUserId()) && t.getStatus() == TransactionStatus.PENDING) {
            Dashboard buyerDashboard = new Dashboard(t.getBuyer());
            t.registerObserver(buyerDashboard);
            t.updateStatus(TransactionStatus.CANCELLED);
            transactionRepository.save(t);
            for (Notification notif : buyerDashboard.getNotifications()) {
                notificationRepository.save(notif);
            }
            return ResponseEntity.ok(Map.of("status", "success", "message", "Pesanan berhasil dibatalkan"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Gagal membatalkan pesanan"));
    }

    @PostMapping("/orders/complete")
    public ResponseEntity<?> completeOrder(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String transactionId = payload.get("transactionId");
        Transaction t = transactionRepository.findById(transactionId).orElse(null);
        if (t != null && t.getBuyer().getUserId().equals(loggedInUser.getUserId()) && t.getStatus() == TransactionStatus.SHIPPED) {
            Dashboard buyerDashboard = new Dashboard(t.getBuyer());
            t.registerObserver(buyerDashboard);
            t.updateStatus(TransactionStatus.DELIVERED);
            transactionRepository.save(t);
            for (Notification notif : buyerDashboard.getNotifications()) {
                notificationRepository.save(notif);
            }
            return ResponseEntity.ok(Map.of("status", "success", "message", "Pesanan berhasil diselesaikan"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Gagal menyelesaikan pesanan"));
    }

    // SELLER DASHBOARD API
    @GetMapping("/seller/dashboard")
    public ResponseEntity<?> sellerDashboard(HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        Seller seller = (Seller) userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (seller == null) return ResponseEntity.status(404).body(Map.of("message", "Seller tidak ditemukan"));

        List<Product> products = productRepository.findAll().stream()
                .filter(p -> p.getSeller() != null && p.getSeller().getUserId().equals(seller.getUserId()))
                .collect(Collectors.toList());

        List<Transaction> incomingOrders = transactionRepository.findAll().stream()
                .filter(t -> t.getItemList().stream().anyMatch(item -> item.getProduct().getSeller() != null && item.getProduct().getSeller().getUserId().equals(seller.getUserId())))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        List<Review> reviews = reviewRepository.findAll().stream()
                .filter(r -> r.getProduct() != null && r.getProduct().getSeller() != null && r.getProduct().getSeller().getUserId().equals(seller.getUserId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());

        long unreadNotifications = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient() != null && n.getRecipient().getUserId().equals(seller.getUserId()) && !n.isRead())
                .count();

        Map<String, Object> data = new HashMap<>();
        data.put("user", formatUser(seller));
        data.put("products", products.stream().map(this::formatProduct).collect(Collectors.toList()));
        data.put("incomingOrders", incomingOrders.stream().map(this::formatTransaction).collect(Collectors.toList()));
        data.put("reviews", reviews.stream().map(this::formatReview).collect(Collectors.toList()));
        data.put("pesananMasuk", incomingOrders.size());
        data.put("totalProducts", products.size());
        data.put("unreadNotifications", unreadNotifications);

        List<Notification> notifications = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient() != null && n.getRecipient().getUserId().equals(seller.getUserId()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
        data.put("notifications", notifications.stream().map(this::formatNotification).collect(Collectors.toList()));

        return ResponseEntity.ok(data);
    }

    // SELLER ACTIONS
    @PostMapping("/product/add")
    public ResponseEntity<?> addProduct(@RequestBody Map<String, Object> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        Seller seller = (Seller) userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (seller == null) return ResponseEntity.status(404).body(Map.of("message", "Seller tidak ditemukan"));

        String id = (String) payload.get("id");
        String name = (String) payload.get("nama");
        String category = (String) payload.get("kategori");
        double price = Double.parseDouble(payload.get("harga").toString());
        int stock = Integer.parseInt(payload.get("stok").toString());
        String description = (String) payload.get("description");

        Product newProduct;
        if (category.equalsIgnoreCase("Elektronik")) {
            String brand = payload.get("brand") != null ? (String) payload.get("brand") : "Generic";
            int warrantyMonths = payload.get("warrantyMonths") != null ? Integer.parseInt(payload.get("warrantyMonths").toString()) : 12;
            newProduct = new ElectronicProduct(id, name, description, price, stock, seller, brand, warrantyMonths);
        } else if (category.equalsIgnoreCase("Makanan")) {
            Date expiry = new Date(System.currentTimeMillis() + 864000000L);
            try {
                if (payload.get("expiryDate") != null) {
                    expiry = new java.text.SimpleDateFormat("yyyy-MM-dd").parse((String) payload.get("expiryDate"));
                }
            } catch (Exception e) {}
            double weightGram = payload.get("weightGram") != null ? Double.parseDouble(payload.get("weightGram").toString()) : 100.0;
            newProduct = new FoodProduct(id, name, description, price, stock, seller, expiry, weightGram);
        } else {
            String size = payload.get("size") != null ? (String) payload.get("size") : "M";
            String material = payload.get("material") != null ? (String) payload.get("material") : "Cotton";
            String color = payload.get("color") != null ? (String) payload.get("color") : "Hitam";
            newProduct = new FashionProduct(id, name, description, price, stock, seller, size, material, color);
        }

        productRepository.save(newProduct);
        seller.addProduct(newProduct);
        userRepository.save(seller);

        return ResponseEntity.ok(Map.of("status", "success", "message", "Produk berhasil ditambahkan"));
    }

    @PostMapping("/product/delete")
    public ResponseEntity<?> deleteProduct(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String id = payload.get("id");
        Seller seller = (Seller) userRepository.findById(loggedInUser.getUserId()).orElse(null);
        Product product = productRepository.findById(id).orElse(null);

        if (seller != null && product != null) {
            seller.removeProduct(id);
            productRepository.delete(product);
            userRepository.save(seller);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Produk berhasil dihapus"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Gagal menghapus produk"));
    }

    @PostMapping("/orders/update")
    public ResponseEntity<?> updateOrderStatus(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String transactionId = payload.get("transactionId");
        String status = payload.get("status");

        Transaction t = transactionRepository.findById(transactionId).orElse(null);
        if (t != null) {
            Dashboard buyerDashboard = new Dashboard(t.getBuyer());
            t.registerObserver(buyerDashboard);
            TransactionStatus newStatus = TransactionStatus.valueOf(status.toUpperCase());
            t.updateStatus(newStatus);
            transactionRepository.save(t);

            for (Notification notif : buyerDashboard.getNotifications()) {
                notificationRepository.save(notif);
            }
            return ResponseEntity.ok(Map.of("status", "success", "message", "Status pesanan diperbarui"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Transaksi tidak ditemukan"));
    }

    @PostMapping("/review/reply")
    public ResponseEntity<?> replyReview(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String reviewId = payload.get("reviewId");
        String replyText = payload.get("replyText");

        Review r = reviewRepository.findById(reviewId).orElse(null);
        if (r != null) {
            r.setReply(replyText);
            reviewRepository.save(r);

            Notification notif = new Notification(
                    "NOTIF-" + System.currentTimeMillis(),
                    r.getBuyer(),
                    "Penjual telah membalas ulasan Anda untuk produk " + r.getProduct().getName() + ": \"" + replyText + "\""
            );
            notificationRepository.save(notif);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Ulasan dibalas"));
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Ulasan tidak ditemukan"));
    }

    // REVIEWS & NOTIFICATIONS
    @PostMapping("/review/add")
    public ResponseEntity<?> addReview(@RequestBody Map<String, Object> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String productId = (String) payload.get("productId");
        String transactionId = (String) payload.get("transactionId");
        int rating = Integer.parseInt(payload.get("rating").toString());
        String comment = (String) payload.get("comment");

        User buyer = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        Product product = productRepository.findById(productId).orElse(null);

        if (buyer != null && product != null) {
            boolean alreadyReviewed = reviewRepository.findAll().stream()
                    .anyMatch(r -> r.getTransactionId() != null
                            && r.getTransactionId().equals(transactionId)
                            && r.getProduct().getProductId().equals(productId));

            if (!alreadyReviewed) {
                Review review = new Review("REV-" + System.currentTimeMillis(), buyer, product, rating, comment, transactionId, new Date());
                reviewRepository.save(review);

                product.addReview(review);
                productRepository.save(product);

                Seller seller = product.getSeller();
                if (seller != null) {
                    Notification notif = new Notification(
                            "NOTIF-" + System.currentTimeMillis(),
                            seller,
                            "Toko Anda menerima ulasan baru (" + rating + " Bintang) untuk produk " + product.getName() + " dari " + buyer.getName()
                    );
                    notificationRepository.save(notif);
                }
                return ResponseEntity.ok(Map.of("status", "success", "message", "Ulasan berhasil dikirim"));
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Anda sudah menulis ulasan untuk produk ini"));
            }
        }
        return ResponseEntity.badRequest().body(Map.of("message", "Gagal mengirim ulasan"));
    }

    @PostMapping("/notifications/read")
    public ResponseEntity<?> markRead(@RequestBody(required = false) Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String notificationId = (payload != null) ? payload.get("notificationId") : null;

        List<Notification> notifs = notificationRepository.findAll().stream()
                .filter(n -> n.getRecipient() != null && n.getRecipient().getUserId().equals(loggedInUser.getUserId()))
                .collect(Collectors.toList());

        for (Notification n : notifs) {
            if (notificationId == null || n.getNotificationId().equals(notificationId)) {
                n.markAsRead();
                notificationRepository.save(n);
            }
        }
        return ResponseEntity.ok(Map.of("status", "success", "message", "Notifikasi berhasil dibaca"));
    }

    // ADMIN DASHBOARD & ACTIONS API
    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> adminDashboard(HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Admin)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        List<User> allUsers = userRepository.findAll();
        List<Product> allProducts = productRepository.findAll();
        List<Transaction> allTransactions = transactionRepository.findAll();

        long buyersCount = allUsers.stream().filter(u -> u instanceof Buyer).count();
        long sellersCount = allUsers.stream().filter(u -> u instanceof Seller).count();
        double totalSystemRevenue = allTransactions.stream()
                .filter(t -> t.getPaymentStatus().equals("PAID"))
                .mapToDouble(t -> t.totalAmount)
                .sum();

        List<Map<String, Object>> formattedUsers = allUsers.stream()
                .map(this::formatUser)
                .collect(Collectors.toList());

        List<Map<String, Object>> formattedProducts = allProducts.stream()
                .map(this::formatProduct)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("totalBuyers", buyersCount);
        data.put("totalSellers", sellersCount);
        data.put("totalProducts", allProducts.size());
        data.put("totalTransactions", allTransactions.size());
        data.put("totalRevenue", totalSystemRevenue);
        data.put("users", formattedUsers);
        data.put("products", formattedProducts);

        return ResponseEntity.ok(data);
    }

    @PostMapping("/admin/users/block")
    public ResponseEntity<?> blockUser(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Admin)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String userId = payload.get("userId");
        User target = userRepository.findById(userId).orElse(null);
        if (target != null) {
            ((Admin) loggedInUser).blockUser(target); // Calls diagram method logging action
            return ResponseEntity.ok(Map.of("status", "success", "message", "User " + target.getName() + " berhasil diblokir (simulasi)"));
        }
        return ResponseEntity.status(404).body(Map.of("message", "User tidak ditemukan"));
    }

    @PostMapping("/admin/users/delete")
    public ResponseEntity<?> deleteUser(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Admin)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String userId = payload.get("userId");
        User target = userRepository.findById(userId).orElse(null);
        if (target != null) {
            userRepository.delete(target);
            return ResponseEntity.ok(Map.of("status", "success", "message", "User berhasil dihapus"));
        }
        return ResponseEntity.status(404).body(Map.of("message", "User tidak ditemukan"));
    }

    @PostMapping("/admin/product/delete")
    public ResponseEntity<?> deleteProductByAdmin(@RequestBody Map<String, String> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Admin)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        String productId = payload.get("productId");
        Product product = productRepository.findById(productId).orElse(null);
        if (product != null) {
            productRepository.delete(product);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Produk berhasil dihapus oleh Admin"));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Produk tidak ditemukan"));
    }
}
