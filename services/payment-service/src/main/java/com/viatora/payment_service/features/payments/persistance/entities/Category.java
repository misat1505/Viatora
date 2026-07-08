package com.viatora.payment_service.features.payments.persistance.entities;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "categories")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "price_1_month", nullable = false)
    private BigDecimal price1Month;

    @Column(name = "price_3_months", nullable = false)
    private BigDecimal price3Months;

    @Column(name = "price_6_months", nullable = false)
    private BigDecimal price6Months;

    protected Category() {}

    public Category(
        String name,
        BigDecimal price1Month,
        BigDecimal price3Months,
        BigDecimal price6Months
    ) {
        this.name = name;
        this.price1Month = price1Month;
        this.price3Months = price3Months;
        this.price6Months = price6Months;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPrice1Month() {
        return price1Month;
    }

    public BigDecimal getPrice3Months() {
        return price3Months;
    }

    public BigDecimal getPrice6Months() {
        return price6Months;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setPrice1Month(BigDecimal price1Month) {
        this.price1Month = price1Month;
    }

    public void setPrice3Months(BigDecimal price3Months) {
        this.price3Months = price3Months;
    }

    public void setPrice6Months(BigDecimal price6Months) {
        this.price6Months = price6Months;
    }
}
