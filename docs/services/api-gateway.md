# Service: API Gateway

**Technology**: NestJS (TypeScript)  
**Role**: Single entry point for all client traffic. Handles auth enforcement, rate limiting, and routing to downstream services exclusively via gRPC.

---

## Responsibilities

- Accept HTTPS requests from Web / Mobile clients — the **only** service exposed to the public internet
- Validate JWT access tokens on every request via gRPC call to Auth Service
- Enforce rate limiting per IP and per authenticated user
- Route all business requests to downstream services via gRPC (no internal HTTP)
- Gate access to the Exam Engine based on active subscription (gRPC call to Payment Service)
- Cache token validation results and rate limit counters in Redis

---

## Internal Architecture

```
src/
├── main.ts
├── app.module.ts
├── common/
│   ├── guards/
│   │   ├── jwt-auth.guard.ts          # Calls AuthService.ValidateToken via gRPC
│   │   └── subscription.guard.ts      # Calls PaymentService.CheckSubscription via gRPC
│   ├── interceptors/
│   │   └── logging.interceptor.ts
│   └── filters/
│       └── grpc-exception.filter.ts   # Maps gRPC status codes to HTTP responses
├── modules/
│   ├── auth/
│   │   └── auth.module.ts             # gRPC client + controller for /auth/*
│   ├── exam/
│   │   └── exam.module.ts             # gRPC client + controller for /exam/*
│   ├── payment/
│   │   └── payment.module.ts          # gRPC client + controller for /payment/*
│   ├── content/
│   │   └── content.module.ts          # gRPC client + controller for /content/*
│   └── stats/
│       └── stats.module.ts            # gRPC client + controller for /stats/*
├── grpc/
│   ├── clients.module.ts              # Registers all gRPC client packages
│   └── proto-paths.ts                 # Centralised .proto file paths
└── redis/
    └── redis.module.ts
```

---

## Communication

### Inbound

| Source               | Protocol   | Description                                       |
| -------------------- | ---------- | ------------------------------------------------- |
| Web / Mobile clients | HTTPS REST | All user-facing requests — the only HTTP boundary |

### Outbound — all internal communication is gRPC only

| Target               | gRPC Method                             | Trigger                             |
| -------------------- | --------------------------------------- | ----------------------------------- |
| Auth Service         | `AuthService.ValidateToken`             | Every authenticated request         |
| Auth Service         | `AuthService.InitiateOAuth`             | `GET /auth/google`                  |
| Auth Service         | `AuthService.HandleOAuthCallback`       | `GET /auth/google/callback`         |
| Auth Service         | `AuthService.RefreshToken`              | `POST /auth/refresh`                |
| Auth Service         | `AuthService.Logout`                    | `POST /auth/logout`                 |
| Auth Service         | `AuthService.GetMe`                     | `GET /auth/me`                      |
| Exam Engine          | `ExamService.StartSession`              | `POST /exams/start`                 |
| Exam Engine          | `ExamService.GetSession`                | `GET /exams/sessions/:id`           |
| Exam Engine          | `ExamService.SubmitAnswer`              | `POST /exams/sessions/:id/answer`   |
| Exam Engine          | `ExamService.FinishSession`             | `POST /exams/sessions/:id/submit`   |
| Exam Engine          | `ExamService.ListResults`               | `GET /exams/results`                |
| Exam Engine          | `ExamService.GetResult`                 | `GET /exams/results/:id`            |
| Payment Service      | `PaymentService.CreateCheckout`         | `POST /payments/checkout`           |
| Payment Service      | `PaymentService.GetSubscription`        | `GET /payments/subscription`        |
| Payment Service      | `PaymentService.CancelSubscription`     | `DELETE /payments/subscription`     |
| Payment Service      | `PaymentService.CheckSubscription`      | Guard: before every `/exams/*` call |
| Statistics Service   | `StatsService.GetSummary`               | `GET /stats/summary`                |
| Statistics Service   | `StatsService.GetAnalytics`             | `GET /stats/analytics`              |
| Statistics Service   | `StatsService.GetHistory`               | `GET /stats/history`                |
| Notification Service | `NotificationService.GetPreferences`    | `GET /notifications/preferences`    |
| Notification Service | `NotificationService.UpdatePreferences` | `PUT /notifications/preferences`    |
| Notification Service | `NotificationService.RegisterFcmToken`  | `POST /notifications/fcm-token`     |

---

## gRPC Client Configuration (NestJS)

```typescript
// grpc/clients.module.ts
ClientsModule.register([
  {
    name: 'AUTH_PACKAGE',
    transport: Transport.GRPC,
    options: {
      package: 'ExamPro.auth',
      protoPath: join(__dirname, 'proto/auth.proto'),
      url: process.env.AUTH_SERVICE_GRPC_URL,
    },
  },
  {
    name: 'EXAM_PACKAGE',
    transport: Transport.GRPC,
    options: {
      package: 'ExamPro.exam',
      protoPath: join(__dirname, 'proto/exam.proto'),
      url: process.env.EXAM_SERVICE_GRPC_URL,
    },
  },
  // ... payment, stats, notification
]);
```

---

## gRPC → HTTP Status Code Mapping

The gateway translates gRPC status codes to HTTP responses for clients:

| gRPC Status          | HTTP Status | Use case                    |
| -------------------- | ----------- | --------------------------- |
| `OK`                 | 200 / 201   | Success                     |
| `NOT_FOUND`          | 404         | Resource missing            |
| `UNAUTHENTICATED`    | 401         | Invalid / expired token     |
| `PERMISSION_DENIED`  | 403         | No subscription / forbidden |
| `ALREADY_EXISTS`     | 409         | Conflict                    |
| `INVALID_ARGUMENT`   | 400         | Bad request payload         |
| `RESOURCE_EXHAUSTED` | 429         | Rate limit hit              |
| `INTERNAL`           | 500         | Unexpected error            |

---

## Rate Limiting

Implemented with `@nestjs/throttler` backed by Redis.

| Tier                 | Limit                  |
| -------------------- | ---------------------- |
| Unauthenticated      | 30 req / min per IP    |
| Authenticated (free) | 60 req / min per user  |
| Authenticated (paid) | 300 req / min per user |

---

## Redis Usage

| Key pattern         | Value            | TTL   | Purpose                          |
| ------------------- | ---------------- | ----- | -------------------------------- |
| `rl:ip:{ip}`        | request count    | 60s   | IP rate limiting                 |
| `rl:user:{userId}`  | request count    | 60s   | Per-user rate limiting           |
| `token:cache:{jti}` | JSON user claims | 5 min | Avoid gRPC call on every request |

---

## Environment Variables

```env
PORT=3000
REDIS_URL=redis://redis:6379

AUTH_SERVICE_GRPC_URL=auth-service:50051
EXAM_SERVICE_GRPC_URL=exam-service:50052
PAYMENT_SERVICE_GRPC_URL=payment-service:50053
CONTENT_SERVICE_GRPC_URL=content-service:50054
STATS_SERVICE_GRPC_URL=stats-service:50055
NOTIFICATION_SERVICE_GRPC_URL=notification-service:50056

THROTTLE_TTL=60
THROTTLE_LIMIT_UNAUTH=30
THROTTLE_LIMIT_AUTH=60
THROTTLE_LIMIT_PAID=300
```

---

## Key Dependencies

```json
{
  "@nestjs/microservices": "^10",
  "@grpc/grpc-js": "^1.9",
  "@grpc/proto-loader": "^0.7",
  "@nestjs/throttler": "^5",
  "ioredis": "^5"
}
```

---

## Notes

- The Gateway contains **zero business logic** — it translates HTTP ↔ gRPC and enforces cross-cutting concerns only.
- All downstream services must be unreachable from outside the Docker/K8s network — only the Gateway's port is exposed.
- Sanity webhooks and Stripe webhooks bypass the Gateway and hit their respective services directly on internal ports (not user-facing traffic).
