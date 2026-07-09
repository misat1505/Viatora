package com.viatora.payment_service.features.payments.persistance.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "price_1_month", nullable = false)
    private Integer price1Month;

    @Column(name = "price_3_months", nullable = false)
    private Integer price3Months;

    @Column(name = "price_6_months", nullable = false)
    private Integer price6Months;

    @Column(nullable = false)
    private String currency;
}
