package com.viatora.payment_service.features.payments.utils;

import static org.junit.jupiter.api.Assertions.*;

import com.viatora.payment_service.features.payments.persistance.entities.Category;
import com.viatora.payment_service.features.payments.persistance.entities.Subscription;
import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class SubscriptionMapperTest {

    private final SubscriptionMapper mapper = new SubscriptionMapper();

    @Test
    void shouldMapSubscriptionToGrpc() {
        Category category = new Category();
        category.setId(1L);
        category.setName("JAVA");
        category.setPrice1Month(100);
        category.setPrice3Months(250);
        category.setPrice6Months(400);
        category.setCurrency("PLN");

        Subscription subscription = new Subscription();
        subscription.setId(10L);
        subscription.setUserId("user-123");
        subscription.setCategory(category);
        subscription.setStartsAt(LocalDate.of(2026, 1, 1));
        subscription.setExpiresAt(LocalDate.of(2026, 7, 1));

        var result = mapper.toGrpc(subscription);

        assertEquals(10, result.getId());
        assertEquals("user-123", result.getUserId());

        assertEquals("2026-01-01", result.getStartsAt());

        assertEquals("2026-07-01", result.getExpiresAt());

        assertEquals(1, result.getCategory().getId());

        assertEquals("JAVA", result.getCategory().getCategory());

        assertEquals(100, result.getCategory().getPrice1Month());

        assertEquals("PLN", result.getCategory().getCurrency());
    }
}
