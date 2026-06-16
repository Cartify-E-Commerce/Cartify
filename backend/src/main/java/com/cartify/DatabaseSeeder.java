package com.cartify;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;
import org.mindrot.jbcrypt.BCrypt;
import java.util.Date;
import java.util.Calendar;

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
        System.out.println("=== Memulai Seeding Data Awal... ===");
        reviewRepository.deleteAll();
        notificationRepository.deleteAll();
        transactionRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();

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
            System.out.println("- Buyers berhasil seeded (budi@buyer.com, rina@buyer.com)");

            // 4. Seed Products
            // Electronic Products for Quantum Tech Store (8 products)
            productRepository.save(new ElectronicProduct("P-elec1", "Laptop Lenovo LOQ 15", "Laptop gaming berspesifikasi tinggi dengan performa handal Intel Core i5 dan kartu grafis RTX 4050 untuk produktivitas dan gaming harian.", 12499000.0, 10, seller1, "Lenovo", 24));
            productRepository.save(new ElectronicProduct("P-elec2", "Keyboard Mechanical Keychron K2 V2", "Keyboard mechanical wireless 75% compact dengan Gateron Brown switches and RGB backlight yang sangat nyaman untuk mengetik.", 1450000.0, 15, seller1, "Keychron", 12));
            productRepository.save(new ElectronicProduct("P-elec3", "Mouse Wireless Logitech MX Master 3S", "Mouse ergonomis premium dengan sensor 8K DPI dan scroll wheel elektromagnetik MagSpeed yang sangat presisi.", 1699000.0, 20, seller1, "Logitech", 12));
            productRepository.save(new ElectronicProduct("P-elec4", "Monitor Gaming LG UltraGear 27 Inch", "Monitor gaming IPS 27 inci resolusi QHD (2560x1440) dengan refresh rate 165Hz dan response time 1ms.", 4850000.0, 8, seller1, "LG", 36));
            productRepository.save(new ElectronicProduct("P-elec5", "Headphone ANC Sony WH-1000XM5", "Headphone wireless dengan noise cancelling terbaik di kelasnya, daya tahan baterai hingga 30 jam dan kualitas audio resolusi tinggi.", 5299000.0, 12, seller1, "Sony", 12));
            productRepository.save(new ElectronicProduct("P-elec6", "Smartphone POCO F9", "Smartphone gaming berspesifikasi gahar dengan chipset kencang, baterai awet, dan sistem pendingin khusus game.", 4599000.0, 12, seller1, "POCO", 12));
            productRepository.save(new ElectronicProduct("P-elec7", "Smartwatch Apple Watch Series 8 GPS", "Jam tangan pintar dengan sensor suhu tubuh untuk pelacakan kesehatan wanita, deteksi tabrakan, dan pelacakan tidur tingkat lanjut.", 6499000.0, 10, seller1, "Apple", 12));
            productRepository.save(new ElectronicProduct("P-elec8", "Web Camera Logitech Brio 500 HDR", "Webcam resolusi Full HD 1080p dengan koreksi cahaya otomatis HDR, mikrofon peredam bising, dan penutup privasi fisik.", 1899000.0, 15, seller1, "Logitech", 12));

            // Fashion Products for Glow & Wear Apparel (8 products)
            productRepository.save(new FashionProduct("P-fash1", "Kaos Cotton Combed 30s Premium", "Kaos polos basic unisex dengan bahan 100% serat katun combed 30s yang dingin, lembut, dan menyerap keringat dengan sempurna.", 59000.0, 150, seller2, "M", "100% Cotton", "Hitam Solid"));
            productRepository.save(new FashionProduct("P-fash2", "Jaket Denim Klasik Vintage Indigo", "Jaket denim premium berbahan tebal dengan warna washed indigo klasik, cocok dipadukan untuk gaya kasual sehari-hari.", 299000.0, 25, seller2, "L", "Denim Premium", "Washed Indigo"));
            productRepository.save(new FashionProduct("P-fash3", "Hoodie Fleece Minimalis Grey", "Hoodie pullover kasual dengan bahan fleece katun tebal namun berpori udara baik, dilengkapi saku kanguru di depan.", 249000.0, 40, seller2, "XL", "Cotton Fleece", "Abu Misty"));
            productRepository.save(new FashionProduct("P-fash4", "Celana Chino Slim Fit Beige", "Celana chino panjang pria potongan slim-fit berbahan katun twill stretch premium yang lentur dan sangat nyaman digunakan.", 189000.0, 50, seller2, "32", "Cotton Twill Stretch", "Beige"));
            productRepository.save(new FashionProduct("P-fash5", "Dress Casual Summer Floral", "Dress wanita motif bunga-bunga elegan bernuansa musim panas dengan bahan rayon premium yang sangat adem dan flowy.", 159000.0, 30, seller2, "S", "Rayon Premium", "Kuning Floral"));
            productRepository.save(new FashionProduct("P-fash6", "Sneakers Canvas Sporty White", "Sepatu sneakers kanvas bertali klasik berwarna putih bersih dengan sol karet tebal anti-slip untuk kenyamanan jalan jauh.", 219000.0, 35, seller2, "42", "Canvas & Rubber", "Putih Bersih"));
            productRepository.save(new FashionProduct("P-fash7", "Topi Baseball Canvas Forest Green", "Topi baseball bergaya kasual dengan strap logam yang dapat diatur ukurannya, berbahan katun kanvas bertekstur.", 79000.0, 60, seller2, "All Size", "Cotton Canvas", "Hijau Botol"));
            productRepository.save(new FashionProduct("P-fash8", "Kemeja Flanel Kotak-Kotak Red-Black", "Kemeja flanel lengan panjang motif kotak-kotak klasik dengan bahan katun flanel berbulu halus yang tebal dan hangat.", 199000.0, 45, seller2, "L", "Katun Flanel", "Merah Hitam"));

            // Food Products for Delish Foods & Snacks (8 products)
            Calendar cal = Calendar.getInstance();
            cal.add(Calendar.MONTH, 6);
            Date exp = cal.getTime();
            productRepository.save(new FoodProduct("P-food1", "Kripik Singkong Balado Khas Minang", "Keripik singkong gurih dan renyah dibalut bumbu balado pedas manis buatan tangan asli Minangkabau.", 18500.0, 100, seller3, exp, 250.0));
            productRepository.save(new FoodProduct("P-food2", "Roti Gandum Artisan Sourdough", "Roti gandum sourdough sehat buatan dapur pembuat roti kami, difermentasi alami 24 jam tanpa bahan pengawet.", 38000.0, 15, seller3, exp, 450.0));
            productRepository.save(new FoodProduct("P-food3", "Cokelat Truffle Dark Cocoa 70%", "Permen cokelat premium truffle dengan kandungan 70% kakao gelap yang meleleh lembut di mulut dengan rasa bittersweet yang pas.", 45000.0, 50, seller3, exp, 150.0));
            productRepository.save(new FoodProduct("P-food4", "Kopi Bubuk Arabica Gayo Premium", "Kopi arabika dataran tinggi Gayo Aceh, dipanggang dengan profil medium roast dengan cita rasa buah dan keasaman seimbang.", 75000.0, 30, seller3, exp, 200.0));
            productRepository.save(new FoodProduct("P-food5", "Cookies Choco Chip Oatmeal", "Kue kering renyah terbuat dari oatmeal gandum sehat bertabur butiran cokelat manis yang dipanggang segar setiap hari.", 28000.0, 40, seller3, exp, 200.0));
            productRepository.save(new FoodProduct("P-food6", "Madu Hutan Murni Organik Sumbawa", "Madu hutan mentah murni 100% organik hasil panen petani lokal hutan Sumbawa, kaya akan nutrisi dan vitamin alami.", 99000.0, 25, seller3, exp, 350.0));
            productRepository.save(new FoodProduct("P-food7", "Selai Kacang Creamy Peanut Butter", "Selai kacang tanah panggang lembut bertekstur sangat halus dengan rasa gurih manis natural yang tinggi protein.", 34000.0, 35, seller3, exp, 300.0));
            productRepository.save(new FoodProduct("P-food8", "Teh Hijau Matcha Jepang Uji Ureshino", "Matcha bubuk murni kualitas seremonial yang diimpor langsung dari perkebunan teh bersejarah Uji di Kyoto Jepang.", 120000.0, 20, seller3, exp, 80.0));

            System.out.println("- Produk dummy berhasil seeded");
            System.out.println("=== Seeding Data Selesai dengan Sukses! ===");
    }
}
