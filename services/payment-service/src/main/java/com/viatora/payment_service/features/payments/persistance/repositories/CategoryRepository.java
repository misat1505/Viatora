package com.viatora.payment_service.features.payments.persistance.repositories;

import com.viatora.payment_service.features.payments.persistance.entities.Category;
import com.viatora.payment_service.features.payments.persistance.entities.Subscription;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
        List<Subscription> findAllByUserId(String userId);
    }
}
