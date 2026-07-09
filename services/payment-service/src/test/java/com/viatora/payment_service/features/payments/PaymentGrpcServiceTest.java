package com.viatora.payment_service.features.payments;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.viatora.payment_service.features.payments.persistance.entities.Category;
import com.viatora.payment_service.features.payments.persistance.entities.Subscription;
import com.viatora.payment_service.features.payments.persistance.repositories.CategoryRepository;
import com.viatora.payment_service.features.payments.persistance.repositories.OrderRepository;
import com.viatora.payment_service.features.payments.persistance.repositories.SubscriptionRepository;
import com.viatora.payment_service.features.payments.utils.StripeConfig;
import com.viatora.payment_service.features.payments.utils.SubscriptionMapper;
import io.grpc.stub.StreamObserver;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import pl.Viatora.grpc.payment.GetAllAvailablePlansRequest;
import pl.Viatora.grpc.payment.GetAllAvailablePlansResponse;
import pl.Viatora.grpc.payment.GetUserSubscriptionsRequest;
import pl.Viatora.grpc.payment.GetUserSubscriptionsResponse;

class PaymentGrpcServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private SubscriptionMapper subscriptionMapper;

    @Mock
    private StripeConfig stripeConfig;

    private PaymentGrpcService service;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        service = new PaymentGrpcService(
            categoryRepository,
            subscriptionRepository,
            orderRepository,
            subscriptionMapper,
            stripeConfig
        );
    }

    @Test
    void shouldReturnAllAvailablePlans() {
        Category category = new Category();

        category.setId(1L);
        category.setName("JAVA");
        category.setPrice1Month(100);
        category.setPrice3Months(250);
        category.setPrice6Months(400);
        category.setCurrency("PLN");

        when(categoryRepository.findAll()).thenReturn(List.of(category));

        StreamObserver<GetAllAvailablePlansResponse> observer = mock(StreamObserver.class);

        service.getAllAvailablePlans(GetAllAvailablePlansRequest.newBuilder().build(), observer);

        ArgumentCaptor<GetAllAvailablePlansResponse> captor = ArgumentCaptor.forClass(
            GetAllAvailablePlansResponse.class
        );

        verify(observer).onNext(captor.capture());
        verify(observer).onCompleted();

        GetAllAvailablePlansResponse response = captor.getValue();

        assertEquals(1, response.getPlansCount());
        assertEquals("JAVA", response.getPlans(0).getCategory());
        assertEquals(100, response.getPlans(0).getPrice1Month());
        assertEquals("PLN", response.getPlans(0).getCurrency());
    }

    @Test
    void shouldReturnUserSubscriptions() {
        Subscription subscription = new Subscription();

        when(subscriptionRepository.findAllByUserId("abc")).thenReturn(List.of(subscription));

        var grpcSubscription = pl.Viatora.grpc.payment.Subscription.newBuilder()
            .setUserId("abc")
            .build();

        when(subscriptionMapper.toGrpc(subscription)).thenReturn(grpcSubscription);

        StreamObserver<GetUserSubscriptionsResponse> observer = mock(StreamObserver.class);

        service.getUserSubscriptions(
            GetUserSubscriptionsRequest.newBuilder().setUserId("abc").build(),
            observer
        );

        ArgumentCaptor<GetUserSubscriptionsResponse> captor = ArgumentCaptor.forClass(
            GetUserSubscriptionsResponse.class
        );

        verify(observer).onNext(captor.capture());
        verify(observer).onCompleted();

        GetUserSubscriptionsResponse response = captor.getValue();

        assertEquals(1, response.getSubscriptionsCount());
        assertEquals("abc", response.getSubscriptions(0).getUserId());
    }

    @Test
    void shouldReturnEmptySubscriptionsWhenUserHasNone() {
        when(subscriptionRepository.findAllByUserId("abc")).thenReturn(List.of());

        StreamObserver<GetUserSubscriptionsResponse> observer = mock(StreamObserver.class);

        service.getUserSubscriptions(
            GetUserSubscriptionsRequest.newBuilder().setUserId("abc").build(),
            observer
        );

        ArgumentCaptor<GetUserSubscriptionsResponse> captor = ArgumentCaptor.forClass(
            GetUserSubscriptionsResponse.class
        );

        verify(observer).onNext(captor.capture());
        verify(observer).onCompleted();

        assertEquals(0, captor.getValue().getSubscriptionsCount());
    }

    @Test
    void shouldFailWhenCategoryDoesNotExist() {
        StreamObserver observer = mock(StreamObserver.class);

        service.createCheckout(null, observer);

        verify(observer).onError(any(Exception.class));
    }
}
