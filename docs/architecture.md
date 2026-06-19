## Service Breakdown

### 1. API Gateway — NestJS
The single entry point for all client traffic. Handles JWT validation (tokens issued by the Auth Service), rate limiting per IP and per user, and routes requests to downstream services via HTTP or gRPC. Also enforces subscription checks — if a user hasn't paid, requests to the Exam Engine are rejected here. Uses a Redis connection for caching rate limit counters and session tokens.

---

### 2. Auth Service — FastAPI
Manages user identity. Integrates with Google OAuth 2.0 for social login and issues its own JWT access + refresh tokens. Stores users in its own PostgreSQL instance. On successful registration, publishes a `user.registered` event to Kafka so other services can react (e.g. Notifications sends a welcome email). Communicates with the API Gateway via gRPC for token introspection (fast, typed, low latency).

**Key endpoints**: `POST /auth/google`, `POST /auth/refresh`, `GET /auth/me`

---

### 3. Exam Engine — NestJS
The core domain service. Serves exam sessions — randomly selects questions from the Content Service (via gRPC), tracks user answers, calculates scores, and persists results in its own PostgreSQL database. When an exam finishes, it publishes an `exam.completed` event to Kafka (consumed by Statistics and Notifications). Enforces access control by verifying subscription status against the Payment Service via gRPC before starting a session.

Redis is used here to store active in-progress exam sessions (TTL-based, no DB writes mid-session).

**Key flows**: `POST /exam/start` → gRPC call to Content → Redis session → `POST /exam/submit` → Kafka publish

---

### 4. Content Service — NestJS
The question bank. Fetches questions, images, and video links from Sanity CMS (a headless CMS well-suited for rich media like road sign images and instructional clips). Exposes a gRPC interface consumed by the Exam Engine for question retrieval. Caches heavily in Redis since the question bank changes infrequently — cache invalidation triggers on Sanity webhook events.

**Data model**: Question (text, category, difficulty), MediaAsset (image/video URL from Sanity), Answer options.

---

### 5. Payment Service — Spring Boot
Handles subscription purchases via Stripe. Spring Boot is a natural fit here — robust transaction management, mature Stripe Java SDK, and easy Webhook handling. On successful payment, publishes `payment.confirmed` to Kafka, which unlocks access for the user. The Exam Engine and API Gateway consume this event to update subscription status. Stores payment records and subscription validity in its own PostgreSQL database.

**Key flows**: `POST /payment/checkout` → Stripe session → Stripe Webhook → Kafka → unlock access

---

### 6. Statistics Service — FastAPI
Consumes `exam.completed` Kafka events and persists structured time-series data into TimescaleDB (PostgreSQL extension optimised for time-series). Provides the user-facing history and analytics endpoints — pass rate over time, average score per category, weak spots, streak tracking. FastAPI is ideal here for its speed with async I/O when aggregating large datasets. Redis caches pre-computed user dashboards with a short TTL.

**Example metrics**: score per session, category accuracy %, time-per-question, monthly trend.

---

### 7. Notification Service — Spring Boot
A Kafka consumer. Listens to `user.registered`, `exam.completed`, and `payment.confirmed` topics and dispatches emails via SendGrid and push notifications via Firebase FCM. Spring Boot's `@KafkaListener` and scheduling features make this straightforward. Has its own lightweight PostgreSQL for notification logs and preferences (e.g. user opted out of email).

---

## Communication Summary

See [Communication Summary](./communication.md).

---

## Tech Rationale

See [Tech Rationale](./tech-rationale.md).
