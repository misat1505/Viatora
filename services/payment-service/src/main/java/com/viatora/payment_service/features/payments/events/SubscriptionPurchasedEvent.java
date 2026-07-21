package com.viatora.payment_service.features.payments.events;

import java.time.LocalDate;

public record SubscriptionPurchasedEvent(
    String userId,
    Long orderId,
    Long subscriptionId,
    String category,
    Integer months,
    Integer price,
    String currency,
    boolean firstPurchase,
    LocalDate startsAt,
    LocalDate expiresAt
) {}
