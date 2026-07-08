package com.viatora.payment_service.features.payments;

import com.viatora.payment_service.features.payments.persistance.entities.Category;
import com.viatora.payment_service.features.payments.persistance.repositories.CategoryRepository;
import com.viatora.payment_service.features.payments.persistance.repositories.SubscriptionRepository;
import com.viatora.payment_service.features.payments.utils.SubscriptionMapper;
import io.grpc.stub.StreamObserver;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import pl.Viatora.grpc.payment.*;

@GrpcService
@RequiredArgsConstructor
public class PaymentGrpcService extends PaymentServiceGrpc.PaymentServiceImplBase {

    private final CategoryRepository categoryRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionMapper subscriptionMapper;

    @Override
    public void createCheckout(
        CreateCheckoutRequest request,
        StreamObserver<CreateCheckoutResponse> responseObserver
    ) {
        System.out.println(request.getUserId());
        System.out.println(request.getPlan());
        this.categoryRepository.findAll().forEach(category -> {
            System.out.println(category.toString());
        });

        // TODO: właściwa logika tworzenia checkoutu (np. integracja ze Stripe)
        CreateCheckoutResponse response = CreateCheckoutResponse.newBuilder()
            .setCheckoutUrl("https://checkout.stripe.com/c/pay/cs_")
            .setSessionId("cs_")
            .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getAllAvailablePlans(
        GetAllAvailablePlansRequest request,
        StreamObserver<GetAllAvailablePlansResponse> responseObserver
    ) {
        List<Plan> plans = categoryRepository
            .findAll()
            .stream()
            .map(category ->
                Plan.newBuilder()
                    .setId(category.getId().intValue())
                    .setCategory(category.getName())
                    .setPrice1Month(category.getPrice1Month())
                    .setPrice3Months(category.getPrice3Months())
                    .setPrice6Months(category.getPrice6Months())
                    .setCurrency(category.getCurrency())
                    .build()
            )
            .toList();

        GetAllAvailablePlansResponse response = GetAllAvailablePlansResponse.newBuilder()
            .addAllPlans(plans)
            .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }

    @Override
    public void getUserSubscriptions(
        GetUserSubscriptionsRequest request,
        StreamObserver<GetUserSubscriptionsResponse> responseObserver
    ) {
        List<com.viatora.payment_service.features.payments.persistance.entities.Subscription> subscriptions =
            subscriptionRepository.findAllByUserId(request.getUserId());

        List<pl.Viatora.grpc.payment.Subscription> grpcSubscriptions = subscriptions
            .stream()
            .map(subscriptionMapper::toGrpc)
            .toList();

        GetUserSubscriptionsResponse response = GetUserSubscriptionsResponse.newBuilder()
            .addAllSubscriptions(grpcSubscriptions)
            .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
