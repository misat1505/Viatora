package com.viatora.payment_service.interceptors;

import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.ServerInterceptor;
import io.grpc.Status;
import net.devh.boot.grpc.server.interceptor.GrpcGlobalServerInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@GrpcGlobalServerInterceptor
public class ServiceKeyInterceptor implements ServerInterceptor {

    private static final Metadata.Key<String> SERVICE_KEY_HEADER = Metadata.Key.of(
        "x-service-key",
        Metadata.ASCII_STRING_MARSHALLER
    );

    @Value("${service.key}")
    private String expectedServiceKey;

    @Override
    public <ReqT, RespT> ServerCall.Listener<ReqT> interceptCall(
        ServerCall<ReqT, RespT> call,
        Metadata headers,
        ServerCallHandler<ReqT, RespT> next
    ) {
        String serviceKey = headers.get(SERVICE_KEY_HEADER);

        if (serviceKey == null || !serviceKey.equals(expectedServiceKey)) {
            call.close(
                Status.UNAUTHENTICATED.withDescription("Invalid or missing service key"),
                new Metadata()
            );
            return new ServerCall.Listener<>() {};
        }

        return next.startCall(call, headers);
    }
}
