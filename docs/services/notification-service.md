# Service: Notification Service

**Technology**: Spring Boot (Java)  
**Role**: Kafka consumer and notification dispatcher. Listens to domain events, sends emails via SendGrid and push notifications via Firebase FCM, and exposes a gRPC server for preference management.

---

## Responsibilities

- Expose a gRPC server for notification preferences and FCM token registration
- Consume `user.registered`, `exam.completed`, and `payment.confirmed` from Kafka
- Send transactional emails via SendGrid
- Send push notifications via Firebase FCM
- Respect per-user opt-out preferences
- Persist notification logs for delivery tracking

---

## Internal Architecture

```
src/main/java/pl/Viatora/notification/
├── NotificationApplication.java
├── config/
│   ├── KafkaConsumerConfig.java
│   ├── SendGridConfig.java
│   ├── FirebaseConfig.java
│   └── GrpcConfig.java
├── grpc/
│   └── NotificationGrpcService.java   # gRPC server — NotificationService.*
├── consumer/
│   ├── UserEventConsumer.java         # @KafkaListener: user.registered
│   ├── ExamEventConsumer.java         # @KafkaListener: exam.completed
│   └── PaymentEventConsumer.java      # @KafkaListener: payment.confirmed
├── service/
│   ├── EmailService.java
│   ├── PushService.java
│   ├── TemplateService.java           # Thymeleaf rendering
│   └── PreferenceService.java
├── repository/
│   ├── NotificationLogRepository.java
│   └── NotificationPreferenceRepository.java
├── entity/
│   ├── NotificationLog.java
│   └── NotificationPreference.java
└── scheduler/
    └── StreakReminderScheduler.java   # Daily push at 19:00 Warsaw
```

---

## Database Schema (PostgreSQL)

### Table: `notification_preferences`

| Column                   | Type         | Constraints      | Description                   |
| ------------------------ | ------------ | ---------------- | ----------------------------- |
| `id`                     | UUID         | PK               |                               |
| `user_id`                | UUID         | UNIQUE, NOT NULL | One row per user              |
| `email`                  | VARCHAR(255) | NOT NULL         | Copied from `user.registered` |
| `display_name`           | VARCHAR(255) | NOT NULL         | For personalisation           |
| `fcm_token`              | TEXT         | NULL             | Firebase device token         |
| `email_enabled`          | BOOLEAN      | DEFAULT true     | Master email toggle           |
| `push_enabled`           | BOOLEAN      | DEFAULT true     | Master push toggle            |
| `notify_exam_result`     | BOOLEAN      | DEFAULT true     |                               |
| `notify_payment`         | BOOLEAN      | DEFAULT true     |                               |
| `notify_streak_reminder` | BOOLEAN      | DEFAULT true     |                               |
| `updated_at`             | TIMESTAMPTZ  | DEFAULT now()    |                               |

### Table: `notification_logs`

| Column                | Type         | Constraints       | Description                                                                                  |
| --------------------- | ------------ | ----------------- | -------------------------------------------------------------------------------------------- |
| `id`                  | UUID         | PK                |                                                                                              |
| `user_id`             | UUID         | NOT NULL, INDEXED |                                                                                              |
| `type`                | VARCHAR(64)  | NOT NULL          | `welcome_email` / `exam_result_email` / `exam_result_push` / `payment_email` / `streak_push` |
| `channel`             | VARCHAR(8)   | NOT NULL          | `email` / `push`                                                                             |
| `status`              | VARCHAR(16)  | NOT NULL          | `sent` / `failed` / `skipped`                                                                |
| `provider_message_id` | VARCHAR(128) | NULL              | SendGrid or FCM message ID                                                                   |
| `error_message`       | TEXT         | NULL              |                                                                                              |
| `triggered_by`        | VARCHAR(64)  | NULL              | Kafka topic                                                                                  |
| `created_at`          | TIMESTAMPTZ  | DEFAULT now()     |                                                                                              |

```sql
CREATE INDEX idx_notif_log_user_id ON notification_logs(user_id);
CREATE INDEX idx_notif_pref_user_id ON notification_preferences(user_id);
```

---

## gRPC Interface (server)

**Proto**: `notification.proto` — port `50056`

```protobuf
service NotificationService {
  rpc GetPreferences     (GetPreferencesRequest)     returns (GetPreferencesResponse);
  rpc UpdatePreferences  (UpdatePreferencesRequest)  returns (UpdatePreferencesResponse);
  rpc RegisterFcmToken   (RegisterFcmTokenRequest)   returns (RegisterFcmTokenResponse);
  rpc GetNotificationHistory (GetNotificationHistoryRequest) returns (GetNotificationHistoryResponse);
}
```

Full message definitions: see [`notification.proto`](../communication/grpc/notification.proto)

---

## Communication

### Inbound

| Source      | Protocol | Methods / Topics                                         |
| ----------- | -------- | -------------------------------------------------------- |
| API Gateway | gRPC     | All `NotificationService.*` methods                      |
| Kafka       | Consumer | `user.registered`, `exam.completed`, `payment.confirmed` |

### Outbound

| Target       | Protocol | Purpose             |
| ------------ | -------- | ------------------- |
| SendGrid API | HTTPS    | Transactional email |
| Firebase FCM | HTTPS    | Mobile push         |

---

## Kafka Consumers

```java
@KafkaListener(topics = "user.registered", groupId = "notification-service")
public void onUserRegistered(UserRegisteredEvent e) {
    preferenceService.createDefaults(e);
    emailService.sendWelcome(e.getEmail(), e.getDisplayName());
}

@KafkaListener(topics = "exam.completed", groupId = "notification-service")
public void onExamCompleted(ExamCompletedEvent e) {
    var prefs = preferenceService.get(e.getUserId());
    if (prefs.isEmailEnabled() && prefs.isNotifyExamResult())
        emailService.sendExamResult(prefs.getEmail(), e);
    if (prefs.isPushEnabled() && prefs.isNotifyExamResult() && prefs.getFcmToken() != null)
        pushService.sendExamResult(prefs.getFcmToken(), e);
}

@KafkaListener(topics = "payment.confirmed", groupId = "notification-service")
public void onPaymentConfirmed(PaymentConfirmedEvent e) {
    var prefs = preferenceService.get(e.getUserId());
    if (prefs.isEmailEnabled() && prefs.isNotifyPayment())
        emailService.sendPaymentReceipt(prefs.getEmail(), e);
}
```

Failed events after retries go to Dead Letter Topic: `notification.DLT`.

---

## Email Templates (Thymeleaf)

| Template               | Trigger             | Subject                            |
| ---------------------- | ------------------- | ---------------------------------- |
| `welcome.html`         | `user.registered`   | Witaj w Viatora!                   |
| `exam-result.html`     | `exam.completed`    | Twój wynik: {score}%               |
| `payment-receipt.html` | `payment.confirmed` | Potwierdzenie zakupu — plan {plan} |

---

## Push Notification Payloads

### Exam result

```json
{
  "notification": { "title": "Wynik egzaminu", "body": "Zdobyłeś 87% — Zaliczone! 🎉" },
  "data": { "type": "exam_result", "sessionId": "uuid", "score": "87.5", "passed": "true" }
}
```

### Daily streak reminder (19:00 Warsaw)

```json
{
  "notification": {
    "title": "Nie przerywaj passy!",
    "body": "Masz 5-dniową passę. Zrób jeden egzamin próbny."
  },
  "data": { "type": "streak_reminder", "currentStreak": "5" }
}
```

---

## Environment Variables

```env
GRPC_PORT=50056

SPRING_DATASOURCE_URL=jdbc:postgresql://notification-db:5432/notificationdb
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=pass

KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_GROUP_ID=notification-service

SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@viatora.pl
SENDGRID_FROM_NAME=Viatora

FIREBASE_CREDENTIALS_PATH=/secrets/firebase-service-account.json
FIREBASE_PROJECT_ID=viatora
```

---

## Key Dependencies (`build.gradle`)

```groovy
implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
implementation 'org.springframework.boot:spring-boot-starter-thymeleaf'
implementation 'org.springframework.kafka:spring-kafka'
implementation 'net.devh:grpc-server-spring-boot-starter:3.0.0'
implementation 'com.sendgrid:sendgrid-java:4.10.2'
implementation 'com.google.firebase:firebase-admin:9.2.0'
runtimeOnly 'org.postgresql:postgresql'
implementation 'org.flywaydb:flyway-core'
```

---

## Notes

- This service is fire-and-forget — failures here never propagate to Gateway or Exam Engine.
- FCM tokens expire and change; clients should refresh on app launch.
- Streak reminder scheduler queries only users with `notify_streak_reminder = true` and a non-null `fcm_token`.
