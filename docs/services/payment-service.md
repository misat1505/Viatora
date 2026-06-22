# Service: Payment Service

**Technology**: Spring Boot (Java)  
**Role**: Manages subscriptions via Stripe. Exposes a gRPC server, processes Stripe webhooks, and publishes payment events to Kafka.

---

## Responsibilities

- Expose a gRPC server — all calls from API Gateway and Exam Engine
- Create Stripe Checkout sessions for subscription purchase
- Handle Stripe Webhooks to confirm/revoke subscriptions
- Persist subscription records and payment audit log in PostgreSQL
- Publish `payment.confirmed` to Kafka on successful payment

---

## Internal Architecture

```
src/main/java/pl/Viatora/payment/
├── PaymentApplication.java
├── config/
│   ├── StripeConfig.java
│   ├── KafkaConfig.java
│   └── GrpcConfig.java
├── grpc/
│   └── PaymentGrpcService.java        # gRPC server — PaymentService.*
├── webhook/
│   └── StripeWebhookController.java   # POST /stripe/webhook — Stripe only, not user-facing
├── service/
│   ├── CheckoutService.java
│   ├── SubscriptionService.java
│   └── WebhookHandlerService.java
├── kafka/
│   └── PaymentEventProducer.java
├── repository/
│   ├── SubscriptionRepository.java
│   └── PaymentEventRepository.java
└── entity/
    ├── Subscription.java
    └── PaymentEvent.java
```

> **Note on the Stripe webhook**: Stripe sends HTTP POST callbacks to confirm payments.
> This is an external system callback (not internal service communication), so a minimal HTTP listener
> on an internal port is acceptable here. It is not exposed via the API Gateway.

---

## Database Schema (PostgreSQL)

### Table: `subscriptions`

| Column                   | Type        | Constraints      | Description                                    |
| ------------------------ | ----------- | ---------------- | ---------------------------------------------- |
| `id`                     | UUID        | PK               | Internal ID                                    |
| `user_id`                | UUID        | UNIQUE, NOT NULL | One subscription per user                      |
| `stripe_customer_id`     | VARCHAR(64) | NOT NULL         | `cus_...`                                      |
| `stripe_subscription_id` | VARCHAR(64) | NULL, INDEXED    | `sub_...`                                      |
| `plan`                   | VARCHAR(32) | NOT NULL         | `monthly` / `quarterly` / `annual`             |
| `status`                 | ENUM        | NOT NULL         | `active` / `expired` / `cancelled` / `pending` |
| `current_period_start`   | TIMESTAMPTZ | NULL             |                                                |
| `current_period_end`     | TIMESTAMPTZ | NULL             | Access valid until                             |
| `cancelled_at`           | TIMESTAMPTZ | NULL             |                                                |
| `created_at`             | TIMESTAMPTZ | DEFAULT now()    |                                                |
| `updated_at`             | TIMESTAMPTZ | DEFAULT now()    |                                                |

### Table: `payment_events`

| Column            | Type        | Constraints       | Description                        |
| ----------------- | ----------- | ----------------- | ---------------------------------- |
| `id`              | UUID        | PK                |                                    |
| `user_id`         | UUID        | NOT NULL, INDEXED |                                    |
| `stripe_event_id` | VARCHAR(64) | UNIQUE, NOT NULL  | Idempotency key                    |
| `event_type`      | VARCHAR(64) | NOT NULL          | e.g. `checkout.session.completed`  |
| `amount_cents`    | INT         | NULL              |                                    |
| `currency`        | CHAR(3)     | NULL              | `PLN`                              |
| `status`          | VARCHAR(16) | NOT NULL          | `processed` / `failed` / `skipped` |
| `raw_payload`     | TEXT        | NULL              | Full Stripe JSON for audit         |
| `processed_at`    | TIMESTAMPTZ | DEFAULT now()     |                                    |

```sql
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_payment_events_user_id ON payment_events(user_id);
CREATE UNIQUE INDEX idx_payment_events_stripe_event ON payment_events(stripe_event_id);
```

---

## gRPC Interface (server)

**Proto**: `payment.proto` — port `50053`

```protobuf
service PaymentService {
  // Called by API Gateway guard before every /exam/* request
  rpc CheckSubscription  (CheckSubscriptionRequest)  returns (CheckSubscriptionResponse);

  // Called by API Gateway to create Stripe checkout session
  rpc CreateCheckout     (CreateCheckoutRequest)     returns (CreateCheckoutResponse);

  // Called by API Gateway for subscription management
  rpc GetSubscription    (GetSubscriptionRequest)    returns (GetSubscriptionResponse);
  rpc CancelSubscription (CancelSubscriptionRequest) returns (CancelSubscriptionResponse);
}
```

Full message definitions: see [`payment.proto`](../communication/grpc/payment.proto)

---

## Stripe Webhook Flow

```
Stripe → POST /stripe/webhook (internal port, not via Gateway)
  1. Verify Stripe-Signature header
  2. Deduplicate via stripe_event_id in payment_events table
  3. Dispatch by event type:

  checkout.session.completed  → status = active, publish payment.confirmed
  customer.subscription.updated → update period dates, status
  customer.subscription.deleted → status = cancelled
  invoice.payment_failed        → status = expired
```

---

## Communication

### Inbound

| Source      | Protocol            | Methods                                                                        |
| ----------- | ------------------- | ------------------------------------------------------------------------------ |
| API Gateway | gRPC                | `CheckSubscription`, `CreateCheckout`, `GetSubscription`, `CancelSubscription` |
| Exam Engine | gRPC                | `CheckSubscription`                                                            |
| Stripe      | HTTP POST (webhook) | Payment events — internal port only                                            |

### Outbound

| Target     | Protocol | Purpose                               |
| ---------- | -------- | ------------------------------------- |
| Stripe API | HTTPS    | Create sessions, manage subscriptions |
| Kafka      | Producer | `payment.confirmed`                   |

---

## Kafka Events

### Published: `payment.confirmed`

```json
{
  "event": "payment.confirmed",
  "userId": "uuid",
  "plan": "monthly",
  "expiresAt": "2024-02-15T10:30:00Z",
  "amountCents": 2900,
  "currency": "PLN",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## Subscription Plans

| Plan        | Duration | Price   |
| ----------- | -------- | ------- |
| `monthly`   | 30 days  | 29 PLN  |
| `quarterly` | 90 days  | 69 PLN  |
| `annual`    | 365 days | 199 PLN |

---

## Environment Variables

```env
GRPC_PORT=50053
WEBHOOK_HTTP_PORT=4003    # Internal only — not exposed via Gateway

SPRING_DATASOURCE_URL=jdbc:postgresql://payment-db:5432/paymentdb
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=pass

KAFKA_BOOTSTRAP_SERVERS=kafka:9092

STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...
STRIPE_PRICE_ID_QUARTERLY=price_...
STRIPE_PRICE_ID_ANNUAL=price_...
STRIPE_SUCCESS_URL=https://Viatora.pl/payment/success
STRIPE_CANCEL_URL=https://Viatora.pl/payment/cancel
```

---

## Key Dependencies (`build.gradle`)

```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
implementation 'org.springframework.kafka:spring-kafka'
implementation 'net.devh:grpc-server-spring-boot-starter:3.0.0'
implementation 'com.stripe:stripe-java:25.0.0'
runtimeOnly 'org.postgresql:postgresql'
implementation 'org.flywaydb:flyway-core'
```

---

## Notes

- `payment_events.stripe_event_id` uniqueness constraint is the idempotency guarantee — duplicate Stripe deliveries silently skip.
- Never store raw card data — all PCI-sensitive data lives in Stripe.
- Webhook endpoint must respond `200 OK` within 5 seconds. If processing is slow, acknowledge immediately and process asynchronously.
