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
        uMap.put("addresses", user.getAddresses());
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
        pMap.put("imageUrl", p.getImageUrl());
        pMap.put("averageRating", p.getAverageRating());

        if (p instanceof ElectronicProduct) {
            pMap.put("brand", ((ElectronicProduct) p).getBrand());
            pMap.put("warrantyMonths", ((ElectronicProduct) p).getWarrantyMonths());
        } else if (p instanceof FoodProduct) {
            pMap.put("expiryDate", ((FoodProduct) p).getExpiryDate() != null ? new java.text.SimpleDateFormat("yyyy-MM-dd").format(((FoodProduct) p).getExpiryDate()) : null);
            pMap.put("weightGram", ((FoodProduct) p).getWeightGram());
        } else if (p instanceof FashionProduct) {
            pMap.put("size", ((FashionProduct) p).getSize());
            pMap.put("material", ((FashionProduct) p).getMaterial());
            pMap.put("color", ((FashionProduct) p).getColor());
        }
        
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

    private boolean isEmailValid(String email) {
        if (email == null || email.trim().isEmpty()) {
            return false;
        }
        email = email.trim().toLowerCase();
        if (!email.matches("^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$")) {
            return false;
        }

        String[] parts = email.split("@");
        if (parts.length != 2) {
            return false;
        }
        String domain = parts[1];

        // Allowed / official domains list
        List<String> officialDomains = Arrays.asList(
            "gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "live.com",
            "telkomuniversity.ac.id", "student.telkomuniversity.ac.id"
        );

        if (officialDomains.contains(domain)) {
            return true;
        }

        // Otherwise, check MX records for authenticity
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            javax.naming.directory.DirContext ictx = new javax.naming.directory.InitialDirContext(env);
            javax.naming.directory.Attributes attrs = ictx.getAttributes(domain, new String[] { "MX" });
            javax.naming.directory.Attribute attr = attrs.get("MX");
            return attr != null && attr.size() > 0;
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 8 || password.length() > 32) {
            return false;
        }
        boolean hasUpper = false;
        boolean hasLower = false;
        boolean hasDigit = false;
        boolean hasSpecial = false;
        String specialChars = "@$!%*?&_\\-+=*#/.";
        for (char c : password.toCharArray()) {
            if (Character.isUpperCase(c)) hasUpper = true;
            else if (Character.isLowerCase(c)) hasLower = true;
            else if (Character.isDigit(c)) hasDigit = true;
            else if (specialChars.indexOf(c) >= 0) hasSpecial = true;
        }
        return hasUpper && hasLower && hasDigit && hasSpecial;
    }

    private boolean isSafeString(String value, int maxLength) {
        if (value == null) return true;
        if (value.length() > maxLength) return false;
        String lower = value.toLowerCase();
        if (lower.contains("<") || lower.contains(">") || lower.contains("javascript:") || 
            lower.contains("onclick") || lower.contains("onerror") || lower.contains("onload") ||
            lower.contains("<script") || lower.contains("</script")) {
            return false;
        }
        return true;
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

        name = name.trim();
        email = email.trim().toLowerCase();
        password = password.trim();

        if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama lengkap, email, dan password tidak boleh kosong!"));
        }

        if (name.length() < 2 || name.length() > 50) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama lengkap harus terdiri dari 2 hingga 50 karakter!"));
        }

        if (!name.matches("^[a-zA-Z\\s'.,]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama lengkap hanya boleh mengandung huruf, spasi, titik, koma, dan petik tunggal!"));
        }

        if (!isEmailValid(email)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Format email tidak valid atau domain email tidak terdaftar/palsu!"));
        }

        if (!isPasswordStrong(password)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Password tidak cukup kuat! Password harus memiliki panjang 8-32 karakter dan mengandung setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter spesial (@$!%*?&_\\-+=*#/. )!"));
        }

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email ini sudah terdaftar!"));
        }

        String id = "U-" + System.currentTimeMillis();
        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
        String actualAddress = address == null ? "" : address.trim();

        if (!isSafeString(actualAddress, 200)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Alamat maksimal 200 karakter dan tidak boleh mengandung karakter HTML/JS berbahaya!"));
        }

        User newUser = new Buyer(id, name, email, hashedPassword, actualAddress);

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
            } else {
                name = name.trim();
            }

            if (name.length() < 2 || name.length() > 50 || !name.matches("^[a-zA-Z\\s'.,]+$")) {
                name = name.replaceAll("[^a-zA-Z\\s'.,]", "");
                name = name.trim();
                if (name.length() < 2) {
                    name = "Google User";
                }
                if (name.length() > 50) {
                    name = name.substring(0, 50);
                }
            }

            if (!isEmailValid(email)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Email Google Anda tidak valid atau domain email tidak terdaftar/palsu!"));
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
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, Object> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Belum masuk"));
        }

        User user = userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("message", "User tidak ditemukan"));
        }

        String name = (String) payload.get("name");
        String address = (String) payload.get("address");
        String profilePhoto = (String) payload.get("profilePhoto");
        String email = (String) payload.get("email");
        String password = (String) payload.get("password");

        if (name != null) {
            name = name.trim();
            if (name.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Nama lengkap tidak boleh kosong!"));
            }
            if (name.length() < 2 || name.length() > 50) {
                return ResponseEntity.badRequest().body(Map.of("message", "Nama lengkap harus terdiri dari 2 hingga 50 karakter!"));
            }
            if (!name.matches("^[a-zA-Z\\s'.,]+$")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Nama lengkap hanya boleh mengandung huruf, spasi, titik, koma, dan petik tunggal!"));
            }
            user.setName(name);
        }

        if (email != null) {
            email = email.trim().toLowerCase();
            if (!email.equals(user.getEmail().toLowerCase())) {
                if (email.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Email tidak boleh kosong!"));
                }
                if (!isEmailValid(email)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Format email tidak valid atau domain email tidak terdaftar/palsu!"));
                }
                if (userRepository.findByEmail(email).isPresent()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Email ini sudah terdaftar oleh pengguna lain!"));
                }
                user.setEmail(email);
            }
        }

        if (password != null) {
            password = password.trim();
            if (!password.isEmpty()) {
                if (!isPasswordStrong(password)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Password tidak cukup kuat! Password harus memiliki panjang 8-32 karakter dan mengandung setidaknya satu huruf besar, satu huruf kecil, satu angka, dan satu karakter spesial (@$!%*?&_\\-+=*#/. )!"));
                }
                user.setPassword(BCrypt.hashpw(password, BCrypt.gensalt()));
            }
        }

        if (payload.containsKey("addresses")) {
            List<?> rawAddresses = (List<?>) payload.get("addresses");
            if (rawAddresses != null) {
                List<String> cleanAddresses = new ArrayList<>();
                for (Object obj : rawAddresses) {
                    if (obj instanceof String) {
                        String addr = ((String) obj).trim();
                        if (addr.isEmpty()) continue;
                        if (!isSafeString(addr, 200)) {
                            return ResponseEntity.badRequest().body(Map.of("message", "Alamat maksimal 200 karakter dan tidak boleh mengandung karakter HTML/JS berbahaya!"));
                        }
                        cleanAddresses.add(addr);
                    }
                }
                user.setAddresses(cleanAddresses);
                if (!cleanAddresses.isEmpty()) {
                    user.setAddress(cleanAddresses.get(0));
                } else {
                    user.setAddress("");
                }
            }
        } else if (address != null) {
            address = address.trim();
            if (!isSafeString(address, 200)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Alamat maksimal 200 karakter dan tidak boleh mengandung karakter HTML/JS berbahaya!"));
            }
            user.setAddress(address);
            if (user.getAddresses().isEmpty()) {
                user.getAddresses().add(address);
            } else {
                user.getAddresses().set(0, address);
            }
        }

        if (profilePhoto != null) {
            profilePhoto = profilePhoto.trim();
            if (!profilePhoto.isEmpty()) {
                boolean isUrl = profilePhoto.startsWith("http://") || profilePhoto.startsWith("https://");
                boolean isBase64 = profilePhoto.startsWith("data:image/");
                if (!isUrl && !isBase64) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Foto profil harus berupa URL HTTP/HTTPS atau format data image base64 yang valid!"));
                }
                if (isUrl && profilePhoto.length() > 500) {
                    return ResponseEntity.badRequest().body(Map.of("message", "URL Foto profil maksimal 500 karakter!"));
                }
                if (isBase64 && profilePhoto.length() > 5 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Ukuran foto profil base64 terlalu besar (maksimal 5MB)!"));
                }
            }
            user.setProfilePhoto(profilePhoto);
        }

        if (user instanceof Seller) {
            String shopName = (String) payload.get("shopName");
            if (shopName != null) {
                shopName = shopName.trim();
                if (shopName.isEmpty()) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Nama toko tidak boleh kosong!"));
                }
                if (shopName.length() < 3 || shopName.length() > 50) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Nama toko harus terdiri dari 3 hingga 50 karakter!"));
                }
                if (!shopName.matches("^[a-zA-Z0-9\\s'.,&-]+$")) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Nama toko mengandung karakter tidak valid!"));
                }
                ((Seller) user).setShopName(shopName);
            }
        }

        userRepository.saveAndFlush(user);
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

        shopName = shopName.trim();
        shopCategory = shopCategory.trim();

        if (shopName.length() < 3 || shopName.length() > 50) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama toko harus terdiri dari 3 hingga 50 karakter!"));
        }
        if (!shopName.matches("^[a-zA-Z0-9\\s'.,&-]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama toko mengandung karakter tidak valid!"));
        }
        if (shopCategory.length() < 3 || shopCategory.length() > 50) {
            return ResponseEntity.badRequest().body(Map.of("message", "Kategori toko harus terdiri dari 3 hingga 50 karakter!"));
        }
        if (!shopCategory.matches("^[a-zA-Z\\s&-]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Kategori toko hanya boleh mengandung huruf, spasi, ampersand (&) dan strip (-)!"));
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
        
        // Calculate shop statistics
        double totalRatingSum = 0;
        int ratingCount = 0;
        if (s.getProductList() != null && !s.getProductList().isEmpty()) {
            for (Product p : s.getProductList()) {
                if (p.getAllReviews() != null && !p.getAllReviews().isEmpty()) {
                    for (Review r : p.getAllReviews()) {
                        totalRatingSum += r.getRating();
                        ratingCount++;
                    }
                }
            }
        }
        double shopAverageRating = ratingCount > 0 ? (double) Math.round((totalRatingSum / ratingCount) * 10) / 10 : 5.0;

        int totalSold = 0;
        List<Transaction> allTransactions = transactionRepository.findAll();
        if (allTransactions != null) {
            for (Transaction tx : allTransactions) {
                if ("PAID".equals(tx.getPaymentStatus()) || tx.getStatus() == TransactionStatus.DELIVERED || tx.getStatus() == TransactionStatus.PROCESSING) {
                    if (tx.getItemList() != null) {
                        for (OrderItem item : tx.getItemList()) {
                            if (item.getProduct() != null && item.getProduct().getSeller() != null && item.getProduct().getSeller().getUserId().equals(shopId)) {
                                totalSold += item.getQuantity();
                            }
                        }
                    }
                }
            }
        }
        int totalSoldOffset = Math.abs(shopId.hashCode() % 150) + 25;
        int finalTotalSold = totalSold + totalSoldOffset;

        String joinedAt = "Juni 2025";
        if (shopId.contains("seller1")) {
            joinedAt = "Desember 2024";
        } else if (shopId.contains("seller2")) {
            joinedAt = "Maret 2025";
        } else if (shopId.contains("seller3")) {
            joinedAt = "Januari 2025";
        }

        sMap.put("averageRating", shopAverageRating);
        sMap.put("totalSold", finalTotalSold);
        sMap.put("joinedAt", joinedAt);

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
            if (payload.get("shippingAddress") != null) shippingAddress = payload.get("shippingAddress").toString().trim();
            if (payload.get("courier") != null) courier = payload.get("courier").toString().trim();
            try {
                if (payload.get("shippingCost") != null) shippingCost = Double.parseDouble(payload.get("shippingCost").toString());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Biaya pengiriman tidak valid!"));
            }
            try {
                if (payload.get("discount") != null) discount = Double.parseDouble(payload.get("discount").toString());
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Diskon tidak valid!"));
            }
            if (payload.get("paymentMethod") != null) paymentMethod = payload.get("paymentMethod").toString().trim();
        }

        if (shippingAddress.isEmpty() || !isSafeString(shippingAddress, 200)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Alamat pengiriman tidak valid!"));
        }

        List<String> allowedCouriers = Arrays.asList("JNE Regular", "J&T Express", "Pos Indonesia", "Sicepat Reguler");
        if (!allowedCouriers.contains(courier)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Kurir pengiriman tidak valid!"));
        }

        if (shippingCost < 0.0 || shippingCost > 1000000.0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Biaya pengiriman di luar batas wajar!"));
        }

        if (discount < 0.0 || discount > 500000.0) {
            return ResponseEntity.badRequest().body(Map.of("message", "Diskon di luar batas wajar!"));
        }

        List<String> allowedPayments = Arrays.asList("GoPay", "OVO", "Dana", "Transfer Bank");
        if (!allowedPayments.contains(paymentMethod)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Metode pembayaran tidak valid!"));
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
        double amount;
        try {
            amount = Double.parseDouble(payload.get("amount").toString());
            if (amount <= 0.0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Jumlah pembayaran harus lebih besar dari 0!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Jumlah pembayaran tidak valid!"));
        }

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
        String description = (String) payload.get("description");

        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "ID Produk wajib diisi!"));
        }
        id = id.trim();
        if (!id.matches("^[a-zA-Z0-9-]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "ID Produk hanya boleh berisi huruf, angka, dan strip (-)!"));
        }

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama produk wajib diisi!"));
        }
        name = name.trim();
        if (name.length() > 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama produk maksimal 100 karakter!"));
        }
        if (!name.matches("^[a-zA-Z0-9\\s'.,&\\(\\)/#-]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama produk mengandung karakter tidak valid!"));
        }

        if (category == null || category.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Kategori produk wajib diisi!"));
        }
        category = category.trim();
        if (!category.equalsIgnoreCase("Elektronik") && 
            !category.equalsIgnoreCase("Makanan") && 
            !category.equalsIgnoreCase("Pakaian") && 
            !category.equalsIgnoreCase("Fashion")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Kategori produk tidak valid! Harus berupa Elektronik, Makanan, atau Pakaian/Fashion."));
        }

        double price;
        try {
            price = Double.parseDouble(payload.get("harga").toString());
            if (price <= 0 || price > 999999999.0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Harga produk harus antara Rp1 dan Rp999.999.999!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Harga produk tidak valid!"));
        }

        int stock;
        try {
            stock = Integer.parseInt(payload.get("stok").toString());
            if (stock < 0 || stock > 1000000) {
                return ResponseEntity.badRequest().body(Map.of("message", "Stok produk harus antara 0 dan 1.000.000!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Stok produk tidak valid!"));
        }

        if (description != null) {
            description = description.trim();
            if (!isSafeString(description, 1000)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Deskripsi produk mengandung karakter tidak aman!"));
            }
        }

        Product newProduct;
        if (category.equalsIgnoreCase("Elektronik")) {
            String brand = payload.get("brand") != null ? ((String) payload.get("brand")).trim() : "Generic";
            if (!isSafeString(brand, 50)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Brand elektronik mengandung karakter tidak aman!"));
            }
            int warrantyMonths;
            try {
                warrantyMonths = payload.get("warrantyMonths") != null ? Integer.parseInt(payload.get("warrantyMonths").toString()) : 12;
                if (warrantyMonths < 0 || warrantyMonths > 120) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Garansi produk harus antara 0 dan 120 bulan!"));
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Masa garansi tidak valid!"));
            }
            newProduct = new ElectronicProduct(id, name, description, price, stock, seller, brand, warrantyMonths);
        } else if (category.equalsIgnoreCase("Makanan")) {
            Date expiry = null;
            if (payload.get("expiryDate") != null) {
                String expStr = ((String) payload.get("expiryDate")).trim();
                try {
                    expiry = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(expStr);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Format tanggal kadaluarsa tidak valid (gunakan YYYY-MM-DD)!"));
                }
            }
            if (expiry == null || expiry.before(new Date())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Tanggal kadaluarsa harus di masa depan!"));
            }
            double weightGram;
            try {
                weightGram = payload.get("weightGram") != null ? Double.parseDouble(payload.get("weightGram").toString()) : 100.0;
                if (weightGram <= 0 || weightGram > 100000.0) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Berat produk harus antara 0.1 gram dan 100.000 gram!"));
                }
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Berat produk tidak valid!"));
            }
            newProduct = new FoodProduct(id, name, description, price, stock, seller, expiry, weightGram);
        } else {
            String size = payload.get("size") != null ? ((String) payload.get("size")).trim() : "M";
            if (size.length() > 10 || !size.matches("^[a-zA-Z0-9-]+$")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Ukuran pakaian tidak valid!"));
            }
            String material = payload.get("material") != null ? ((String) payload.get("material")).trim() : "Cotton";
            if (!isSafeString(material, 50)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Bahan pakaian mengandung karakter tidak aman!"));
            }
            String color = payload.get("color") != null ? ((String) payload.get("color")).trim() : "Hitam";
            if (!isSafeString(color, 50)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Warna pakaian mengandung karakter tidak aman!"));
            }
            newProduct = new FashionProduct(id, name, description, price, stock, seller, size, material, color);
        }

        String imageUrl = payload.get("imageUrl") != null ? ((String) payload.get("imageUrl")).trim() : null;
        newProduct.setImageUrl(imageUrl);

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

    @PostMapping("/product/edit")
    public ResponseEntity<?> editProduct(@RequestBody Map<String, Object> payload, HttpSession session) {
        User loggedInUser = (User) session.getAttribute("user");
        if (loggedInUser == null || !(loggedInUser instanceof Seller)) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }

        Seller seller = (Seller) userRepository.findById(loggedInUser.getUserId()).orElse(null);
        if (seller == null) return ResponseEntity.status(404).body(Map.of("message", "Seller tidak ditemukan"));

        String id = (String) payload.get("id");
        if (id == null || id.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "ID Produk wajib diisi!"));
        }
        id = id.trim();

        Product product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.status(404).body(Map.of("message", "Produk tidak ditemukan!"));
        }

        if (product.getSeller() == null || !product.getSeller().getUserId().equals(seller.getUserId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Anda tidak memiliki hak untuk mengedit produk ini!"));
        }

        String name = (String) payload.get("nama");
        String description = (String) payload.get("description");
        String imageUrl = payload.get("imageUrl") != null ? ((String) payload.get("imageUrl")).trim() : null;

        if (name == null || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama produk wajib diisi!"));
        }
        name = name.trim();
        if (name.length() > 100) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama produk maksimal 100 karakter!"));
        }
        if (!name.matches("^[a-zA-Z0-9\\s'.,&\\(\\)/#-]+$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Nama produk mengandung karakter tidak valid!"));
        }

        double price;
        try {
            price = Double.parseDouble(payload.get("harga").toString());
            if (price <= 0 || price > 999999999.0) {
                return ResponseEntity.badRequest().body(Map.of("message", "Harga produk harus antara Rp1 dan Rp999.999.999!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Harga produk tidak valid!"));
        }

        int stock;
        try {
            stock = Integer.parseInt(payload.get("stok").toString());
            if (stock < 0 || stock > 1000000) {
                return ResponseEntity.badRequest().body(Map.of("message", "Stok produk harus antara 0 dan 1.000.000!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Stok produk tidak valid!"));
        }

        if (description != null) {
            description = description.trim();
            if (!isSafeString(description, 1000)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Deskripsi produk mengandung karakter tidak aman!"));
            }
        }

        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);
        product.setImageUrl(imageUrl);

        if (product instanceof ElectronicProduct) {
            ElectronicProduct ep = (ElectronicProduct) product;
            String brand = payload.get("brand") != null ? ((String) payload.get("brand")).trim() : ep.getBrand();
            if (!isSafeString(brand, 50)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Brand elektronik mengandung karakter tidak aman!"));
            }
            ep.setBrand(brand);
            if (payload.get("warrantyMonths") != null) {
                try {
                    int warrantyMonths = Integer.parseInt(payload.get("warrantyMonths").toString());
                    if (warrantyMonths < 0 || warrantyMonths > 120) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Garansi produk harus antara 0 dan 120 bulan!"));
                    }
                    ep.setWarrantyMonths(warrantyMonths);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Masa garansi tidak valid!"));
                }
            }
        } else if (product instanceof FoodProduct) {
            FoodProduct fp = (FoodProduct) product;
            if (payload.get("expiryDate") != null) {
                String expStr = ((String) payload.get("expiryDate")).trim();
                try {
                    Date expiry = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(expStr);
                    fp.setExpiryDate(expiry);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Format tanggal kadaluarsa tidak valid (gunakan YYYY-MM-DD)!"));
                }
            }
            if (payload.get("weightGram") != null) {
                try {
                    double weightGram = Double.parseDouble(payload.get("weightGram").toString());
                    if (weightGram <= 0 || weightGram > 100000.0) {
                        return ResponseEntity.badRequest().body(Map.of("message", "Berat produk harus antara 0.1 gram dan 100.000 gram!"));
                    }
                    fp.setWeightGram(weightGram);
                } catch (Exception e) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Berat produk tidak valid!"));
                }
            }
        } else if (product instanceof FashionProduct) {
            FashionProduct fsp = (FashionProduct) product;
            if (payload.get("size") != null) {
                String size = ((String) payload.get("size")).trim();
                if (size.length() > 10 || !size.matches("^[a-zA-Z0-9-]+$")) {
                     return ResponseEntity.badRequest().body(Map.of("message", "Ukuran pakaian tidak valid!"));
                }
                fsp.setSize(size);
            }
            if (payload.get("material") != null) {
                String material = ((String) payload.get("material")).trim();
                if (!isSafeString(material, 50)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Bahan pakaian mengandung karakter tidak aman!"));
                }
                fsp.setMaterial(material);
            }
            if (payload.get("color") != null) {
                String color = ((String) payload.get("color")).trim();
                if (!isSafeString(color, 50)) {
                    return ResponseEntity.badRequest().body(Map.of("message", "Warna pakaian mengandung karakter tidak aman!"));
                }
                fsp.setColor(color);
            }
        }

        productRepository.save(product);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Produk berhasil diperbarui"));
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

        if (replyText == null || replyText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Balasan ulasan tidak boleh kosong!"));
        }
        replyText = replyText.trim();
        if (!isSafeString(replyText, 500)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Balasan ulasan maksimal 500 karakter dan tidak boleh mengandung karakter HTML/JS berbahaya!"));
        }

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
        int rating;
        try {
            rating = Integer.parseInt(payload.get("rating").toString());
            if (rating < 1 || rating > 5) {
                return ResponseEntity.badRequest().body(Map.of("message", "Rating harus bernilai 1 hingga 5!"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Rating tidak valid!"));
        }

        String comment = (String) payload.get("comment");
        if (comment != null) {
            comment = comment.trim();
            if (!isSafeString(comment, 500)) {
                return ResponseEntity.badRequest().body(Map.of("message", "Ulasan maksimal 500 karakter dan tidak boleh mengandung karakter HTML/JS berbahaya!"));
            }
        }

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
