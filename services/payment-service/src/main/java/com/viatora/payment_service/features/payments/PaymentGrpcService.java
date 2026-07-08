package com.viatora.payment_service.features.payments;

import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import pl.Viatora.grpc.payment.CreateCheckoutRequest;
import pl.Viatora.grpc.payment.CreateCheckoutResponse;
import pl.Viatora.grpc.payment.PaymentServiceGrpc;

@GrpcService
public class PaymentGrpcService extends PaymentServiceGrpc.PaymentServiceImplBase {

    @Override
    public void createCheckout(
        CreateCheckoutRequest request,
        StreamObserver<CreateCheckoutResponse> responseObserver
    ) {
        System.out.println(request.getUserId());
        System.out.println(request.getPlan());

        // TODO: właściwa logika tworzenia checkoutu (np. integracja ze Stripe)
        CreateCheckoutResponse response = CreateCheckoutResponse.newBuilder()
            .setCheckoutUrl("https://checkout.stripe.com/c/pay/cs_")
            .setSessionId("cs_")
            .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
