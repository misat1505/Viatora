package com.viatora.payment_service.features.payments.persistance.repositories;

import com.viatora.payment_service.features.payments.persistance.entities.Subscription;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findAllByUserId(String userId);
}
