package com.viatora.payment_service.features.payments;

import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import pl.Viatora.grpc.payment.CheckSubscriptionRequest;
import pl.Viatora.grpc.payment.CheckSubscriptionResponse;
import pl.Viatora.grpc.payment.PaymentServiceGrpc;

@GrpcService
public class PaymentGrpcService extends PaymentServiceGrpc.PaymentServiceImplBase {

    @Override
    public void checkSubscription(
        CheckSubscriptionRequest request,
        StreamObserver<CheckSubscriptionResponse> responseObserver) {

        CheckSubscriptionResponse response =
            CheckSubscriptionResponse.newBuilder()
                .setActive(false)
                .setStatus("none")
                .build();

        responseObserver.onNext(response);
        responseObserver.onCompleted();
    }
}
