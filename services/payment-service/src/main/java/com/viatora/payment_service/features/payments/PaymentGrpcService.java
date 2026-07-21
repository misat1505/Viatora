package com.viatora.payment_service.features.payments;

import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.viatora.payment_service.features.payments.events.SubscriptionPurchasedEvent;
import com.viatora.payment_service.features.payments.persistance.entities.Category;
import com.viatora.payment_service.features.payments.persistance.entities.Order;
import com.viatora.payment_service.features.payments.persistance.entities.OrderStatus;
import com.viatora.payment_service.features.payments.persistance.entities.Subscription;
import com.viatora.payment_service.features.payments.persistance.repositories.CategoryRepository;
import com.viatora.payment_service.features.payments.persistance.repositories.OrderRepository;
import com.viatora.payment_service.features.payments.persistance.repositories.SubscriptionRepository;
import com.viatora.payment_service.features.payments.utils.StripeConfig;
import com.viatora.payment_service.features.payments.utils.SubscriptionMapper;
import com.viatora.payment_service.kafka.KafkaProducer;
import io.grpc.stub.StreamObserver;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import pl.Viatora.grpc.payment.CreateCheckoutRequest;
import pl.Viatora.grpc.payment.CreateCheckoutResponse;
import pl.Viatora.grpc.payment.GetAllAvailablePlansRequest;
import pl.Viatora.grpc.payment.GetAllAvailablePlansResponse;
import pl.Viatora.grpc.payment.GetUserSubscriptionsRequest;
import pl.Viatora.grpc.payment.GetUserSubscriptionsResponse;
import pl.Viatora.grpc.payment.HandleStripeWebhookRequest;
import pl.Viatora.grpc.payment.HandleStripeWebhookResponse;
import pl.Viatora.grpc.payment.PaymentServiceGrpc;
import pl.Viatora.grpc.payment.Plan;

@GrpcService
@RequiredArgsConstructor
public class PaymentGrpcService extends PaymentServiceGrpc.PaymentServiceImplBase {

    private final CategoryRepository categoryRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final OrderRepository orderRepository;
    private final SubscriptionMapper subscriptionMapper;
    private final StripeConfig stripeConfig;
    private final KafkaProducer kafkaProducer;

    @Override
    public void createCheckout(
        CreateCheckoutRequest request,
        StreamObserver<CreateCheckoutResponse> responseObserver
    ) {
        try {
            Category category = categoryRepository
                .findByName(request.getCategory())
                .orElseThrow(() -> new RuntimeException("Category not found"));

            int price = switch (request.getMonths()) {
                case 1 -> category.getPrice1Month();
                case 3 -> category.getPrice3Months();
                case 6 -> category.getPrice6Months();
                default -> throw new RuntimeException("Invalid months");
            };

            Order order = new Order();
            order.setCategory(category);
            order.setUser_id(request.getUserId());
            order.setDurationMonths(request.getMonths());
            order.setPrice(price);
            order.setStatus(OrderStatus.PENDING);

            order = orderRepository.save(order);

            SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomerEmail(request.getUserEmail())
                .setSuccessUrl("http://localhost:3000/payment/success")
                .setCancelUrl("http://localhost:3000/payment/cancel")
                .addLineItem(
                    SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(
                            SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(category.getCurrency().toLowerCase())
                                .setUnitAmount((long) price)
                                .setProductData(
                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName(
                                            "Dostęp do kursu kategorii " +
                                                category.getName() +
                                                " na okres " +
                                                request.getMonths() +
                                                " miesięcy"
                                        )
                                        .build()
                                )
                                .build()
                        )
                        .build()
                )
                .putMetadata("order_id", order.getId().toString())
                .build();

            Session session = Session.create(params);

            CreateCheckoutResponse response = CreateCheckoutResponse.newBuilder()
                .setCheckoutUrl(session.getUrl())
                .setSessionId(session.getId())
                .build();

            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void handleStripeWebhook(
        HandleStripeWebhookRequest request,
        StreamObserver<HandleStripeWebhookResponse> responseObserver
    ) {
        try {
            String payload = new String(request.getPayload().toByteArray(), StandardCharsets.UTF_8);

            Event event = Webhook.constructEvent(
                payload,
                request.getStripeSignature(),
                stripeConfig.getWebhookSecret()
            );

            if (event.getType().equals("checkout.session.completed")) {
                Session session = (Session) event.getData().getObject();

                String orderId = session.getMetadata().get("order_id");

                Order order = orderRepository
                    .findById(Long.valueOf(orderId))
                    .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

                order.setStatus(OrderStatus.PAID);
                order.setPaymentProviderId(session.getId());

                orderRepository.save(order);

                Subscription subscription = this.subscriptionRepository
                    .findByUserIdAndCategory(order.getUser_id(), order.getCategory())
                    .orElse(null);

                LocalDate today = LocalDate.now();

                boolean firstPurchase = subscription == null;

                if (subscription == null) {
                    subscription = new Subscription();

                    subscription.setUserId(order.getUser_id());
                    subscription.setCategory(order.getCategory());
                    subscription.setOrder(order);

                    subscription.setStartsAt(today);
                    subscription.setExpiresAt(today.plusMonths(order.getDurationMonths()));
                } else {
                    LocalDate currentExpiry = subscription.getExpiresAt();

                    LocalDate startFrom = currentExpiry.isAfter(today) ? currentExpiry : today;

                    subscription.setExpiresAt(startFrom.plusMonths(order.getDurationMonths()));

                    subscription.setOrder(order);
                }

                this.subscriptionRepository.save(subscription);

                SubscriptionPurchasedEvent kafkaEvent = new SubscriptionPurchasedEvent(
                    subscription.getUserId(),
                    order.getId(),
                    subscription.getId(),
                    subscription.getCategory().getName(),
                    order.getDurationMonths(),
                    order.getPrice(),
                    order.getCategory().getCurrency(),
                    firstPurchase,
                    subscription.getStartsAt(),
                    subscription.getExpiresAt()
                );

                kafkaProducer.send("subscription.purchased", kafkaEvent);
            }

            responseObserver.onNext(
                HandleStripeWebhookResponse.newBuilder().setSuccess(true).build()
            );
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(e);
        }
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
