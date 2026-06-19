# Communication Summary

## Overview

| Channel         | Purpose                                      | Usage                                                     |
| --------------- | -------------------------------------------- | --------------------------------------------------------- |
| **gRPC**        | Synchronous service-to-service communication | Low-latency internal calls (auth, content, exam, payment) |
| **Kafka**       | Asynchronous event-driven communication      | Decoupled domain events, eventual consistency             |
| **HTTP (REST)** | External API layer                           | Client → API Gateway communication                        |
| **Redis**       | In-memory cache & ephemeral state            | Sessions, rate limiting, caching, temporary exam state    |

---

## gRPC Communication (Internal Sync)

Used for **high-performance internal service calls** where immediate response is required.

| Caller      | Callee          | Purpose                          |
| ----------- | --------------- | -------------------------------- |
| Gateway     | Auth Service    | Token validation / introspection |
| Exam Engine | Content Service | Fetch questions / exam content   |
| Exam Engine | Payment Service | Subscription / access validation |
| Gateway     | Stats Service   | User analytics & dashboard data  |

---

## Kafka Events (Async / Event-Driven)

Used for **decoupled workflows and eventual consistency**.

| Event               | Producer        | Consumers           | Purpose                         |
| ------------------- | --------------- | ------------------- | ------------------------------- |
| `exam.completed`    | Exam Service    | Stats, Notification | Update stats, trigger summaries |
| `payment.confirmed` | Payment Service | Auth, Exam          | Unlock premium access           |
| `user.registered`   | Auth Service    | Stats, Notification | User onboarding flows           |

---

## REST API (External Layer)

- All client applications communicate exclusively through the **API Gateway**
- Gateway handles:
  - authentication
  - routing
  - rate limiting
  - request aggregation

---

## Redis Usage

Used for **fast ephemeral data and caching layer**:

- Active exam sessions (state + progress)
- Rate limiting counters (per user/IP)
- Cached question sets (performance optimization)
- Dashboard aggregates (precomputed stats)

---

## Protobuf Definitions

Suggested service contracts:

- [auth.proto](./grpc/auth.proto) → authentication, token validation
- [content.proto](./grpc/content.proto) → question bank / exam content
- [exam.proto](./grpc/exam.proto) → exam lifecycle & execution
- [payment.proto](./grpc/payment.proto) → subscriptions & billing status
- [stats.proto](./grpc/stats.proto) → analytics & reporting
