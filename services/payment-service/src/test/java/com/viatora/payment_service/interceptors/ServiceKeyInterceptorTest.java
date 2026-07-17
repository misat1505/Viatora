package com.viatora.payment_service.interceptors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.grpc.Metadata;
import io.grpc.ServerCall;
import io.grpc.ServerCallHandler;
import io.grpc.Status;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class ServiceKeyInterceptorTest {

    private static final String EXPECTED_KEY = "super-secret-key";
    private static final Metadata.Key<String> SERVICE_KEY_HEADER = Metadata.Key.of(
        "x-service-key",
        Metadata.ASCII_STRING_MARSHALLER
    );

    private ServiceKeyInterceptor interceptor;

    @Mock
    private ServerCall<Object, Object> call;

    @Mock
    private ServerCallHandler<Object, Object> next;

    @Mock
    private ServerCall.Listener<Object> nextListener;

    @BeforeEach
    void setUp() {
        interceptor = new ServiceKeyInterceptor();
        ReflectionTestUtils.setField(interceptor, "expectedServiceKey", EXPECTED_KEY);
    }

    @Test
    void shouldCallNextHandlerWhenServiceKeyIsValid() {
        Metadata headers = new Metadata();
        headers.put(SERVICE_KEY_HEADER, EXPECTED_KEY);

        when(next.startCall(call, headers)).thenReturn(nextListener);

        ServerCall.Listener<Object> result = interceptor.interceptCall(call, headers, next);

        assertThat(result).isSameAs(nextListener);
        verify(next).startCall(call, headers);
        verify(call, never()).close(any(), any());
    }

    @Test
    void shouldRejectCallWhenServiceKeyIsMissing() {
        Metadata headers = new Metadata();

        ServerCall.Listener<Object> result = interceptor.interceptCall(call, headers, next);

        ArgumentCaptor<Status> statusCaptor = ArgumentCaptor.forClass(Status.class);
        verify(call).close(statusCaptor.capture(), any(Metadata.class));

        assertThat(statusCaptor.getValue().getCode()).isEqualTo(Status.Code.UNAUTHENTICATED);
        assertThat(result).isNotNull();
        verify(next, never()).startCall(any(), any());
    }

    @Test
    void shouldRejectCallWhenServiceKeyIsInvalid() {
        Metadata headers = new Metadata();
        headers.put(SERVICE_KEY_HEADER, "wrong-key");

        ServerCall.Listener<Object> result = interceptor.interceptCall(call, headers, next);

        ArgumentCaptor<Status> statusCaptor = ArgumentCaptor.forClass(Status.class);
        verify(call).close(statusCaptor.capture(), any(Metadata.class));

        assertThat(statusCaptor.getValue().getCode()).isEqualTo(Status.Code.UNAUTHENTICATED);
        assertThat(result).isNotNull();
        verify(next, never()).startCall(any(), any());
    }

    @Test
    void shouldRejectCallWhenServiceKeyIsEmptyString() {
        Metadata headers = new Metadata();
        headers.put(SERVICE_KEY_HEADER, "");

        interceptor.interceptCall(call, headers, next);

        verify(call).close(
            argThat(status -> status.getCode() == Status.Code.UNAUTHENTICATED),
            any(Metadata.class)
        );
        verify(next, never()).startCall(any(), any());
    }
}
