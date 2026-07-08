package com.viatora.payment_service.features.payments.persistance.repositories;

import com.viatora.payment_service.features.payments.persistance.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {}
