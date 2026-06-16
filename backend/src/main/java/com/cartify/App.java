package com.cartify;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import java.util.Date;
import java.util.ArrayList;

@SpringBootApplication
public class App {
    public static void main(String[] args) {
        SpringApplication.run(App.class, args);
    }

    @Bean
    public CommandLineRunner initData(
            UserRepository userRepository,
            ProductRepository productRepository,
            ReviewRepository reviewRepository,
            NotificationRepository notificationRepository
    ) {
        return args -> {
            if (userRepository.findByEmail("admin@cartify.com").isEmpty()) {
                System.out.println("=== SEEDING DEFAULT ADMIN USER ===");
                Admin defaultAdmin = new Admin("A01", "Super Admin", "admin@cartify.com", "admin123", "Kantor Pusat Cartify", 1);
                userRepository.save(defaultAdmin);
            }
            if (userRepository.count() <= 1) {
                System.out.println("=== INITIALIZING DATABASE WITH SEED DATA ===");
                
                Seller dummySeller = new Seller("S01", "Toko Ryan", "seller@cartify.com", "secret123", "Bandung", "Toko Ryan");
                Buyer defaultBuyer = new Buyer("U01", "Ryan Maulana Bagus Putra", "ryanmaulana@student.telkomuniversity.ac.id", "buyer123", "Bandung");
                
                userRepository.save(dummySeller);
                userRepository.save(defaultBuyer);

                ElectronicProduct hp = new ElectronicProduct("E01", "Lenovo LOQ 15IRX9", "Laptop gaming berspesifikasi tinggi dengan Intel Core i7 dan RTX 4060", 14500000, 12, dummySeller, "Lenovo", 12);
                FoodProduct roti = new FoodProduct("M01", "Sari Roti Coklat", "Roti manis isi coklat yang lezat dan bergizi", 15000, 50, dummySeller, new Date(System.currentTimeMillis() + 864000000L), 75.0);
                FashionProduct kaos = new FashionProduct("P01", "Kaos Polos Hitam", "Kaos katun adem berkualitas tinggi dengan bahan combed 30s", 50000, 100, dummySeller, "L", "Cotton Combed 30s", "Hitam");
                ElectronicProduct kb = new ElectronicProduct("E02", "Keyboard VortexSeries", "Keyboard mechanical 75% hot-swappable dengan switch Gateron Yellow", 850000, 15, dummySeller, "VortexSeries", 6);
                FashionProduct jacket = new FashionProduct("P02", "Jaket Denim Blue", "Jaket denim tebal berkualitas tinggi dengan jahitan kuat", 250000, 30, dummySeller, "XL", "Denim", "Biru");

                productRepository.save(hp);
                productRepository.save(roti);
                productRepository.save(kaos);
                productRepository.save(kb);
                productRepository.save(jacket);

                Review rev1 = new Review("R01", defaultBuyer, hp, 5, "Laptop kencang dan sangat dingin! Mantap dosen pembimbing!", new Date());
                Review rev2 = new Review("R02", defaultBuyer, hp, 4, "Performa luar biasa untuk harganya. Sangat direkomendasikan.", new Date());
                reviewRepository.save(rev1);
                reviewRepository.save(rev2);

                Notification notif1 = new Notification("NOTIF-1", defaultBuyer, "Selamat datang di Cartify! Akun Buyer default Anda telah aktif.");
                Notification notif2 = new Notification("NOTIF-2", defaultBuyer, "Temukan promo gadget menarik di halaman utama!");
                notificationRepository.save(notif1);
                notificationRepository.save(notif2);

                System.out.println("=== SEED DATA SUCCESSFULLY INITIALIZED ===");
            }
        };
    }
}