# Tech Rationale

**NestJS** for the API Gateway and Exam Engine — TypeScript, decorator-based architecture, excellent gRPC and Kafka client support, and rate limiting middleware out of the box.

**FastAPI** for Auth and Statistics — async Python, great for I/O-heavy workloads, type safety via Pydantic, and fast prototyping of complex aggregation queries.

**Spring Boot** for Payment and Notifications — Java's mature ecosystem for financial transactions (Stripe SDK, transactional guarantees) and battle-tested Kafka consumer support with `@KafkaListener`.

**Sanity** for content — its structured content model handles rich media (images, videos) cleanly, and the Webhook support enables real-time cache invalidation in the Content Service.