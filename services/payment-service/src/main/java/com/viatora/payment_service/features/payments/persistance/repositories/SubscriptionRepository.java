package com.viatora.payment_service.features.payments.persistance.repositories;

import com.viatora.payment_service.features.payments.persistance.entities.Category;
import com.viatora.payment_service.features.payments.persistance.entities.Subscription;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findAllByUserId(String userId);
    Optional<Subscription> findByUserIdAndCategory(String userId, Category category);
}
