package com.cartify;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.mindrot.jbcrypt.BCrypt;
import java.util.Date;
import java.util.Calendar;
import java.util.List;
import java.util.ArrayList;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            System.out.println("=== Database sudah terisi, skip seeding. ===");
            return;
        }
        System.out.println("=== Memulai Seeding Data Awal... ===");

            // 1. Seed Admin
            Admin admin = new Admin(
                "U-admin", 
                "Super Admin", 
                "admin@cartify.com", 
                BCrypt.hashpw("admin123", BCrypt.gensalt()), 
                "Gedung Rektorat Lt. 3", 
                1
            );
            userRepository.save(admin);
            System.out.println("- Admin berhasil seeded (admin@cartify.com)");

            // 2. Seed Sellers
            Seller seller1 = new Seller(
                "U-seller1", 
                "Adi Pratama", 
                "adi@seller.com", 
                BCrypt.hashpw("seller123", BCrypt.gensalt()), 
                "Bandung Cyber Mall Lantai 1 No 15", 
                "Quantum Tech Store"
            );
            seller1.setShopCategory("Elektronik");
            seller1.setProfilePhoto("https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=150&q=80");
            userRepository.save(seller1);

            Seller seller2 = new Seller(
                "U-seller2", 
                "Siti Rahma", 
                "siti@seller.com", 
                BCrypt.hashpw("seller123", BCrypt.gensalt()), 
                "Pasar Baru Bandung Blok B No 32", 
                "Glow & Wear Apparel"
            );
            seller2.setShopCategory("Pakaian");
            seller2.setProfilePhoto("https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=150&q=80");
            userRepository.save(seller2);

            Seller seller3 = new Seller(
                "U-seller3", 
                "Budi Santoso", 
                "budi@seller.com", 
                BCrypt.hashpw("seller123", BCrypt.gensalt()), 
                "Paris Van Java Mall Ground Floor No. 4A", 
                "Delish Foods & Snacks"
            );
            seller3.setShopCategory("Makanan");
            seller3.setProfilePhoto("https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=150&q=80");
            userRepository.save(seller3);

            System.out.println("- Sellers berhasil seeded (Quantum Tech, Glow & Wear, Delish)");

            // 3. Seed Buyers
            Buyer buyer1 = new Buyer(
                "U-buyer1", 
                "Budi Pratama", 
                "budi@buyer.com", 
                BCrypt.hashpw("buyer123", BCrypt.gensalt()), 
                "Jl. Telekomunikasi No. 1, Bojongsoang, Bandung"
            );
            userRepository.save(buyer1);

            Buyer buyer2 = new Buyer(
                "U-buyer2", 
                "Rina Lestari", 
                "rina@buyer.com", 
                BCrypt.hashpw("buyer123", BCrypt.gensalt()), 
                "Kosan Melati Indah Gg. PGA No. 12, Bojongsoang"
            );
            userRepository.save(buyer2);

            Buyer buyer3 = new Buyer(
                "U-buyer3", 
                "Dian Sastro", 
                "dian@buyer.com", 
                BCrypt.hashpw("buyer123", BCrypt.gensalt()), 
                "Jl. Dago No. 45, Bandung"
            );
            userRepository.save(buyer3);

            Buyer buyer4 = new Buyer(
                "U-buyer4", 
                "Eko Prasetyo", 
                "eko@buyer.com", 
                BCrypt.hashpw("buyer123", BCrypt.gensalt()), 
                "Jl. PGA No. 3, Bojongsoang"
            );
            userRepository.save(buyer4);

            Buyer buyer5 = new Buyer(
                "U-buyer5", 
                "Fitri Handayani", 
                "fitri@buyer.com", 
                BCrypt.hashpw("buyer123", BCrypt.gensalt()), 
                "Jl. Sukabirus No. 10, Bojongsoang"
            );
            userRepository.save(buyer5);

            Buyer buyer6 = new Buyer(
                "U-buyer6", 
                "Giri Wijaya", 
                "giri@buyer.com", 
                BCrypt.hashpw("buyer123", BCrypt.gensalt()), 
                "Jl. Sukapura No. 8, Dayeuhkolot"
            );
            userRepository.save(buyer6);

            System.out.println("- Buyers berhasil seeded (6 buyers)");

            // 4. Seed Products
            // Electronic Products for Quantum Tech Store (8 products)
            Product p1 = productRepository.save(new ElectronicProduct("P-elec1", "Laptop Lenovo LOQ 15", "Laptop gaming berspesifikasi tinggi dengan performa handal Intel Core i5 dan kartu grafis RTX 4050 untuk produktivitas dan gaming harian.", 12499000.0, 10, seller1, "Lenovo", 24));
            Product p2 = productRepository.save(new ElectronicProduct("P-elec2", "Keyboard Mechanical Keychron K2 V2", "Keyboard mechanical wireless 75% compact dengan Gateron Brown switches and RGB backlight yang sangat nyaman untuk mengetik.", 1450000.0, 15, seller1, "Keychron", 12));
            Product p3 = productRepository.save(new ElectronicProduct("P-elec3", "Mouse Wireless Logitech MX Master 3S", "Mouse ergonomis premium dengan sensor 8K DPI dan scroll wheel elektromagnetik MagSpeed yang sangat presisi.", 1699000.0, 20, seller1, "Logitech", 12));
            Product p4 = productRepository.save(new ElectronicProduct("P-elec4", "Monitor Gaming LG UltraGear 27 Inch", "Monitor gaming IPS 27 inci resolusi QHD (2560x1440) dengan refresh rate 165Hz dan response time 1ms.", 4850000.0, 8, seller1, "LG", 36));
            Product p5 = productRepository.save(new ElectronicProduct("P-elec5", "Headphone ANC Sony WH-1000XM5", "Headphone wireless dengan noise cancelling terbaik di kelasnya, daya tahan baterai hingga 30 jam dan kualitas audio resolusi tinggi.", 5299000.0, 12, seller1, "Sony", 12));
            Product p6 = productRepository.save(new ElectronicProduct("P-elec6", "Smartphone POCO F9", "Smartphone gaming berspesifikasi gahar dengan chipset kencang, baterai awet, dan sistem pendingin khusus game.", 4599000.0, 12, seller1, "POCO", 12));
            Product p7 = productRepository.save(new ElectronicProduct("P-elec7", "Smartwatch Apple Watch Series 8 GPS", "Jam tangan pintar dengan sensor suhu tubuh untuk pelacakan kesehatan wanita, deteksi tabrakan, dan pelacakan tidur tingkat lanjut.", 6499000.0, 10, seller1, "Apple", 12));
            Product p8 = productRepository.save(new ElectronicProduct("P-elec8", "Web Camera Logitech Brio 500 HDR", "Webcam resolusi Full HD 1080p dengan koreksi cahaya otomatis HDR, mikrofon peredam bising, dan penutup privasi fisik.", 1899000.0, 15, seller1, "Logitech", 12));

            // Fashion Products for Glow & Wear Apparel (8 products)
            Product p9 = productRepository.save(new FashionProduct("P-fash1", "Kaos Cotton Combed 30s Premium", "Kaos polos basic unisex dengan bahan 100% serat katun combed 30s yang dingin, lembut, dan menyerap keringat dengan sempurna.", 59000.0, 150, seller2, "M", "100% Cotton", "Hitam Solid"));
            Product p10 = productRepository.save(new FashionProduct("P-fash2", "Jaket Denim Klasik Vintage Indigo", "Jaket denim premium berbahan tebal dengan warna washed indigo klasik, cocok dipadukan untuk gaya kasual sehari-hari.", 299000.0, 25, seller2, "L", "Denim Premium", "Washed Indigo"));
            Product p11 = productRepository.save(new FashionProduct("P-fash3", "Hoodie Fleece Minimalis Grey", "Hoodie pullover kasual dengan bahan fleece katun tebal namun berpori udara baik, dilengkapi saku kanguru di depan.", 249000.0, 40, seller2, "XL", "Cotton Fleece", "Abu Misty"));
            Product p12 = productRepository.save(new FashionProduct("P-fash4", "Celana Chino Slim Fit Beige", "Celana chino panjang pria potongan slim-fit berbahan katun twill stretch premium yang lentur dan sangat nyaman digunakan.", 189000.0, 50, seller2, "32", "Cotton Twill Stretch", "Beige"));
            Product p13 = productRepository.save(new FashionProduct("P-fash5", "Dress Casual Summer Floral", "Dress wanita motif bunga-bunga elegan bernuansa musim panas dengan bahan rayon premium yang sangat adem dan flowy.", 159000.0, 30, seller2, "S", "Rayon Premium", "Kuning Floral"));
            Product p14 = productRepository.save(new FashionProduct("P-fash6", "Sneakers Canvas Sporty White", "Sepatu sneakers kanvas bertali klasik berwarna putih bersih dengan sol karet tebal anti-slip untuk kenyamanan jalan jauh.", 219000.0, 35, seller2, "42", "Canvas & Rubber", "Putih Bersih"));
            Product p15 = productRepository.save(new FashionProduct("P-fash7", "Topi Baseball Canvas Forest Green", "Topi baseball bergaya kasual dengan strap logam yang dapat diatur ukurannya, berbahan katun kanvas bertekstur.", 79000.0, 60, seller2, "All Size", "Cotton Canvas", "Hijau Botol"));
            Product p16 = productRepository.save(new FashionProduct("P-fash8", "Kemeja Flanel Kotak-Kotak Red-Black", "Kemeja flanel lengan panjang motif kotak-kotak klasik dengan bahan katun flanel berbulu halus yang tebal dan hangat.", 199000.0, 45, seller2, "L", "Katun Flanel", "Merah Hitam"));

            // Food Products for Delish Foods & Snacks (8 products)
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, 6);
            Date exp = cal.getTime();
            Product p17 = productRepository.save(new FoodProduct("P-food1", "Kripik Singkong Balado Khas Minang", "Keripik singkong gurih dan renyah dibalut bumbu balado pedas manis buatan tangan asli Minangkabau.", 18500.0, 100, seller3, exp, 250.0));
            Product p18 = productRepository.save(new FoodProduct("P-food2", "Roti Gandum Artisan Sourdough", "Roti gandum sourdough sehat buatan dapur pembuat roti kami, difermentasi alami 24 jam tanpa bahan pengawet.", 38000.0, 15, seller3, exp, 450.0));
            Product p19 = productRepository.save(new FoodProduct("P-food3", "Cokelat Truffle Dark Cocoa 70%", "Permen cokelat premium truffle dengan kandungan 70% kakao gelap yang meleleh lembut di mulut dengan rasa bittersweet yang pas.", 45000.0, 50, seller3, exp, 150.0));
            Product p20 = productRepository.save(new FoodProduct("P-food4", "Kopi Bubuk Arabica Gayo Premium", "Kopi arabika dataran tinggi Gayo Aceh, dipanggang dengan profil medium roast dengan cita rasa buah dan keasaman seimbang.", 75000.0, 30, seller3, exp, 200.0));
            Product p21 = productRepository.save(new FoodProduct("P-food5", "Cookies Choco Chip Oatmeal", "Kue kering renyah terbuat dari oatmeal gandum sehat bertabur butiran cokelat manis yang dipanggang segar setiap hari.", 28000.0, 40, seller3, exp, 200.0));
            Product p22 = productRepository.save(new FoodProduct("P-food6", "Madu Hutan Murni Organik Sumbawa", "Madu hutan mentah murni 100% organik hasil panen petani lokal hutan Sumbawa, kaya akan nutrisi dan vitamin alami.", 99000.0, 25, seller3, exp, 350.0));
            Product p23 = productRepository.save(new FoodProduct("P-food7", "Selai Kacang Creamy Peanut Butter", "Selai kacang tanah panggang lembut bertekstur sangat halus dengan rasa gurih manis natural yang tinggi protein.", 34000.0, 35, seller3, exp, 300.0));
            Product p24 = productRepository.save(new FoodProduct("P-food8", "Teh Hijau Matcha Jepang Uji Ureshino", "Matcha bubuk murni kualitas seremonial yang diimpor langsung dari perkebunan teh bersejarah Uji di Kyoto Jepang.", 120000.0, 20, seller3, exp, 80.0));

            System.out.println("- Produk dummy berhasil seeded");

            // 5. Seed Reviews (4-6 per product)
            Buyer[] buyersList = { buyer1, buyer2, buyer3, buyer4, buyer5, buyer6 };
            Product[] productsList = { p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24 };

            String[][] elecReviews = {
                {"5", "Sangat memuaskan, kualitas material premium dan performa luar biasa!"},
                {"4", "Pengiriman cepat, produk berfungsi dengan baik, build quality solid."},
                {"5", "Barang asli 100% original, garansi resmi aktif. Recommended seller!"},
                {"4", "Kabelnya agak pendek tapi secara keseluruhan performa mantap."},
                {"5", "Sesuai deskripsi, respon penjual cepat. Sangat berguna untuk kebutuhan sehari-hari."},
                {"5", "Bagus sekali, tidak ada kendala sejauh ini. Terima kasih!"}
            };

            String[][] fashReviews = {
                {"5", "Bahan adem sekali, jahitan rapi dan pas banget di badan."},
                {"4", "Warna sesuai foto, ukuran agak ngepas tapi masih nyaman dipakai."},
                {"5", "Sangat stylish dan kekinian, cocok buat outfit harian."},
                {"4", "Kainnya tebal dan tidak mudah luntur saat dicuci pertama kali."},
                {"5", "Pembelian kedua, selalu puas belanja di toko ini. Sukses terus!"},
                {"5", "Desain minimalis tapi kelihatan mewah. Suka banget!"}
            };

            String[][] foodReviews = {
                {"5", "Rasa sangat enak dan otentik! Pengemasan aman pakai bubble wrap."},
                {"4", "Makanan segar dan tanggal kadaluarsa masih sangat lama. Mantap!"},
                {"5", "Cocok banget buat cemilan sore hari, porsinya juga pas."},
                {"4", "Agak sedikit manis buat saya, tapi rasanya tetap juara."},
                {"5", "Teksturnya pas banget, kualitas bahan premium terasa di setiap gigitan."},
                {"5", "Langganan terus di sini, rasanya tidak pernah mengecewakan."}
            };

            int reviewCounter = 1;
            for (Product p : productsList) {
                // Determine category review texts
                String[][] categoryReviews = fashReviews;
                if (p instanceof ElectronicProduct) {
                    categoryReviews = elecReviews;
                } else if (p instanceof FoodProduct) {
                    categoryReviews = foodReviews;
                }

                // Seed 4-6 reviews (alternating count per product)
                int reviewsToSeed = 4 + (reviewCounter % 3); // 4, 5, or 6
                for (int i = 0; i < reviewsToSeed; i++) {
                    Buyer b = buyersList[i % buyersList.length];
                    int rating = Integer.parseInt(categoryReviews[i][0]);
                    String comment = categoryReviews[i][1];
                    String rId = "REV-SEED-" + reviewCounter + "-" + i;
                    
                    Review rev = new Review(rId, b, p, rating, comment, new Date());
                    reviewRepository.save(rev);
                    p.addReview(rev);
                }
                productRepository.save(p);
                reviewCounter++;
            }

            System.out.println("- Ulasan & Rating dummy (4-6 per produk) berhasil seeded");

            // 6. Seed Transactions (12 per seller to simulate sold products)
            for (Seller seller : new Seller[]{seller1, seller2, seller3}) {
                // Get products of this seller
                List<Product> sellerProducts = new ArrayList<>();
                for (Product p : productsList) {
                    if (p.getSeller().getUserId().equals(seller.getUserId())) {
                        sellerProducts.add(p);
                    }
                }
                
                // Create 12 transactions for this seller
                for (int tIdx = 0; tIdx < 12; tIdx++) {
                    Buyer buyer = buyersList[tIdx % buyersList.length];
                    
                    // Pick 1-2 products
                    List<OrderItem> items = new ArrayList<>();
                    Product p1_choice = sellerProducts.get((tIdx * 3) % sellerProducts.size());
                    items.add(new OrderItem(p1_choice, 1 + (tIdx % 3))); // qty 1, 2, or 3
                    
                    if (tIdx % 2 == 0) {
                        Product p2_choice = sellerProducts.get((tIdx * 7 + 1) % sellerProducts.size());
                        if (!p2_choice.getProductId().equals(p1_choice.getProductId())) {
                            items.add(new OrderItem(p2_choice, 1));
                        }
                    }
                    
                    // Calculate total
                    double total = 0;
                    for (OrderItem item : items) {
                        total += item.calculateSubtotal();
                    }
                    
                    String txId = "TX-SEED-" + seller.getUserId() + "-" + tIdx;
                    Transaction tx = new Transaction(txId, buyer, items, TransactionStatus.DELIVERED, total, new Date());
                    tx.setShippingAddress(buyer.getAddress());
                    tx.setCourier("J&T Express");
                    tx.setShippingCost(15000.0);
                    tx.setDiscount(0.0);
                    tx.setPaymentMethod("GoPay");
                    tx.pay(total); // sets status to PROCESSING and paymentStatus to PAID
                    tx.setStatus(TransactionStatus.DELIVERED); // set to DELIVERED
                    
                    transactionRepository.save(tx);
                }
            }
            System.out.println("- Transaksi dummy (12 per seller) berhasil seeded");
            System.out.println("=== Seeding Data Selesai dengan Sukses! ===");
    }
}
