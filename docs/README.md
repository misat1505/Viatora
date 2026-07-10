# Viatora Documentation Hub

This folder contains the product and architecture documentation for the Viatora platform. The root README is the entry point for visitors, while this page is the internal documentation hub for deeper technical context.

## Start here

- [Root README](../README.md)
- [Architecture overview](./architecture.md)
- [Communication model](./communication/communication.md)
- [Security guide](./security.md)
- [Technical rationale](./tech-rationale.md)

## Platform overview

Viatora is a multi-service learning platform for driving license preparation. It combines exam practice, subscriptions, analytics, notifications, and an AI assistant in a modular architecture.

## Documentation map

- Architecture: [architecture.md](./architecture.md)
- Communication: [communication/communication.md](./communication/communication.md)
- Security: [security.md](./security.md)
- Services:
  - [API Gateway](./services/api-gateway.md)
  - [Auth Service](./services/auth-service.md)
  - [Exam Engine](./services/exam-engine.md)
  - [Content Service](./services/content-service.md)
  - [Payment Service](./services/payment-service.md)
  - [Statistics Service](./services/statistics-service.md)
  - [Notification Service](./services/notification-service.md)
  - [AI Assistant Service](./services/ai-assistant.md)

## Documentation principles

- Keep the docs aligned with the codebase and the current service boundaries.
- Treat the API Gateway as the single ingress for user traffic.
- Describe the system as a set of cooperating services rather than a monolith.
- Highlight the external integrations that matter for product reliability: Stripe, Sanity, OpenRouter, Google OAuth, and messaging infrastructure.
