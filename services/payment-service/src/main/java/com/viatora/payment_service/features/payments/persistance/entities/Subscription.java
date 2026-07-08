package com.viatora.payment_service.features.payments.persistance.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String user_id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToOne(optional = false)
    @JoinColumn(name = "order_id")
    private Order order;

    private LocalDate startsAt;

    private LocalDate expiresAt;
}
