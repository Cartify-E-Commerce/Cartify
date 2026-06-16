package com.cartify;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);

    @Modifying(clearAutomatically = true)
    @Transactional
    @Query(value = "UPDATE users SET user_role = 'Seller', shop_name = :shopName, shop_category = :shopCategory, total_revenue = 0.0 WHERE user_id = :userId", nativeQuery = true)
    void convertBuyerToSeller(@Param("userId") String userId, @Param("shopName") String shopName, @Param("shopCategory") String shopCategory);
}
