# Tech Rationale

Viatora was designed as a modern product platform rather than a simple prototype. The technology choices reflect the need for reliability, clear service boundaries, and room for future AI-driven features.

## Why a microservice architecture

The product has several independent responsibilities that evolve at different rates: authentication, exam orchestration, content delivery, payments, analytics, notifications, and AI tutoring. Splitting those concerns into services keeps the system easier to reason about and avoids coupling unrelated workflows.

## Why NestJS for the gateway and core workflows

**NestJS** is well suited to the API Gateway and Exam Engine because it provides a structured TypeScript foundation, strong support for gRPC and Kafka, and a mature middleware ecosystem for routing and request handling. This makes it a strong fit for API composition, validation, dependency injection, and internal service integration.

## Why FastAPI for identity and analytics

**FastAPI** fits the Auth and Statistics services well because it supports asynchronous I/O efficiently, makes API contracts easy to reason about with Pydantic, and speeds up the development of data-heavy endpoints. This is especially useful for authentication flows and analytics pipelines that need quick iteration.

## Why Spring Boot for payments and notifications

**Spring Boot** is a strong fit for Payment and Notification flows because Java offers a mature ecosystem for transaction handling, integrations, and robust background processing. That matters for Stripe workflows, webhook handling, and reliable notification dispatching.

## Why Sanity for content

**Sanity** is used for content management because it handles rich media effectively and gives the team a flexible way to manage exam materials, media assets, and editorial updates. The content service can pull from it without tightly coupling the product’s core logic to a custom CMS implementation.

## Why event-driven messaging matters

Kafka is used for cross-service events such as exam completion and payment confirmation. That allows the platform to keep the user experience responsive while letting other services react asynchronously to business milestones. It also helps separate responsibilities so that analytics and notifications do not have to be embedded into the exam engine itself.

## Why Redis is used

Redis is used for short-lived state and caching. It supports rate limiting, temporary session state, and cached content and analytics responses. This keeps latency low and reduces pressure on the primary data stores.

## Why AI is a separate service

**AI assistance** is implemented as a dedicated service so the product can evolve its learning experience independently. This keeps the assistant modular, easier to extend, and more maintainable than embedding AI logic directly into the core application flow. It also makes future expansion to different tutor modes, memory systems, and domain-specific prompts more practical.

## Why Stripe is a good fit for payments

Stripe provides a mature payments platform that handles checkout, billing state, and secure card workflows. Keeping payment logic in a dedicated service reduces the chance of mixing business rules with user flow concerns and makes the integration easier to evolve as pricing or subscription models change.

## Architectural trade-offs

The current design prioritises clarity and modularity over maximum simplicity. That means more moving parts than a monolith, but also better boundaries, easier debugging, and clearer ownership for each subsystem.
