# Communication Summary

| Channel | Used for |
|---|---|
| **gRPC** | Auth ↔ Gateway (token introspection), Exam Engine ↔ Content (question fetch), Exam Engine ↔ Payment (subscription check) |
| **Kafka** | `exam.completed`, `payment.confirmed`, `user.registered` — async, decoupled, durable |
| **HTTP (REST)** | All client → Gateway calls |
| **Redis** | Active exam sessions, rate limit counters, question cache, dashboard cache |
