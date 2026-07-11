# Viatora

Viatora is a modern, multi-service platform for preparing for the driving license exam. It combines realistic exam practice, category-based subscriptions powered by Stripe, progress analytics, and an AI-powered learning assistant into a single learning experience designed to help learners prepare more effectively.

![Practice exam](./docs/screenshots/question.png)

---

## Why Viatora stands out

- Designed as a complete learning platform rather than a simple quiz application.
- Built using a distributed microservice architecture with clearly separated domains.
- Supports subscription-based access to driving license categories.
- Provides detailed analytics to help learners identify strengths and weaknesses.
- Includes an AI assistant capable of explaining questions and concepts.
- Built with scalability in mind, making it easy to introduce new exam categories and learning features.

---

## Core product features

- Realistic practice exams with structured question flows and automatic scoring.
- Progress tracking with detailed learning analytics.
- Category-based subscriptions powered by Stripe.
- AI-powered explanations and interactive learning support.
- Rich multimedia content managed through a headless CMS.
- Email notifications for registration, payments, and learning milestones.
- Secure authentication with OAuth and JWT.

---

# User interface

Viatora provides a modern and accessible user interface with full localization support for both **Polish** and **English**.

The application supports multiple professionally designed color themes inspired by the palettes available at [tweakcn](https://tweakcn.com/themes). Users can choose from:

- Caffeine
- Supabase
- Vercel
- Twitter
- Notebook
- Claude

Every theme is available in both **Light** and **Dark** mode, allowing users to personalize the interface while maintaining a consistent experience.

## Exam library

The exam library provides an overview of all available practice exams, allowing users to quickly browse available content and start learning sessions.

![Exam library](./docs/screenshots/exam-library-dark.png)

## Exam summary & analytics

After completing an exam, users receive a detailed summary including:

- overall score,
- correct and incorrect answers,
- performance statistics,
- visual charts,
- learning progress over time.

These insights help learners focus on the topics that require additional practice.

![Exam summary](./docs/screenshots/exam-summary-dark.png)

---

# Subscriptions & payments

Viatora integrates **Stripe** to provide secure subscription management and online payments.

Instead of unlocking the entire platform at once, learners purchase access to a selected **driving license category** (for example, Category B). Once payment is completed successfully, access is granted automatically and synchronized across the platform.

The payment workflow includes:

- subscription plan selection,
- secure Stripe Checkout,
- automatic subscription activation,
- payment status synchronization,
- access control enforced by backend services.

## Subscription plans

Users can compare available plans before purchasing access.

![Subscription plans](./docs/screenshots/pricing.png)

## Secure Stripe Checkout

Payments are processed through Stripe Checkout, providing a secure and familiar payment experience.

![Stripe Checkout](./docs/screenshots/stripe.png)

---

# AI Assistant

Viatora includes a dedicated AI assistant that makes studying more interactive.

The assistant can:

- explain why an answer is correct,
- clarify difficult concepts,
- answer follow-up questions,
- guide learners through confusing topics,
- encourage understanding instead of memorization.

The AI service is implemented as an independent microservice, allowing future improvements without affecting the rest of the platform.

![AI Assistant](./docs/screenshots/assistant-guides.png)

---

# Architecture

![Viatora architecture](./docs/diagram-creator/microservices_architecture.png)

Viatora follows a distributed microservice architecture where each service is responsible for a specific business domain.

The platform currently consists of:

- **Next.js Web Application** – user interface
- **API Gateway** – routing, authentication and authorization
- **Auth Service** – user accounts, OAuth and JWT
- **Exam Engine** – exam sessions, validation and scoring
- **Content Service** – questions and multimedia assets
- **Payment Service** – Stripe integration and subscriptions
- **Statistics Service** – learning analytics and progress tracking
- **Notification Service** – email notifications and events
- **AI Assistant Service** – conversational learning support

Additional documentation is available in:

- [Architecture Overview](docs/architecture.md)

---

# Technology stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui

### Backend

- NestJS
- FastAPI
- Spring Boot

### Infrastructure

- Docker
- Docker Compose
- Kafka
- Redis

### Databases & Storage

- PostgreSQL
- Sanity CMS

### Payments

- Stripe

---

# Getting started

Clone the repository.

```bash
git clone <repository-url>
```

Start the infrastructure.

```bash
docker compose up -d
```

Configure the required environment variables for each service.

Start the services you want to develop locally.

Each microservice contains its own README with service-specific setup instructions.

---

# Documentation

The project contains extensive technical documentation covering architecture, communication, security, and implementation details.

- [Documentation hub](docs/README.md)
- [Architecture overview](docs/architecture.md)
- [Communication model](docs/communication/communication.md)
- [Security guide](docs/security.md)
- [Technical rationale](docs/tech-rationale.md)
- [Service documentation](docs/services)

---

# Project goals

Viatora demonstrates the design and implementation of a modern distributed application that combines:

- microservice architecture,
- secure authentication,
- subscription-based monetization,
- AI-assisted learning,
- real-time messaging,
- analytics,
- scalable content management,
- and a polished user experience.
