package com.viatora.payment_service.features.payments.utils;

import com.viatora.payment_service.features.payments.persistance.entities.Category;
import com.viatora.payment_service.features.payments.persistance.entities.Subscription;
import org.springframework.stereotype.Component;
import pl.Viatora.grpc.payment.Plan;

@Component
public class SubscriptionMapper {

    public pl.Viatora.grpc.payment.Subscription toGrpc(Subscription subscription) {
        return pl.Viatora.grpc.payment.Subscription.newBuilder()
            .setId(subscription.getId().intValue())
            .setUserId(subscription.getUserId())
            .setCategory(toPlan(subscription.getCategory()))
            .setStartsAt(subscription.getStartsAt().toString())
            .setExpiresAt(subscription.getExpiresAt().toString())
            .build();
    }

    private Plan toPlan(Category category) {
        return Plan.newBuilder()
            .setId(category.getId().intValue())
            .setCategory(category.getName())
            .setPrice1Month(category.getPrice1Month())
            .setPrice3Months(category.getPrice3Months())
            .setPrice6Months(category.getPrice6Months())
            .setCurrency(category.getCurrency())
            .build();
    }
}
