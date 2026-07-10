# Tech Rationale

Viatora was designed as a modern product platform rather than a simple prototype. The technology choices reflect the need for reliability, clear service boundaries, and room for future AI-driven features.

**NestJS** is well suited to the API Gateway and Exam Engine because it provides a structured TypeScript foundation, strong support for gRPC and Kafka, and a mature middleware ecosystem for routing and request handling.

**FastAPI** fits the Auth and Statistics services well because it supports asynchronous I/O efficiently, makes API contracts easy to reason about with Pydantic, and speeds up the development of data-heavy endpoints.

**Spring Boot** is a strong fit for Payment and Notification flows because Java offers a mature ecosystem for transaction handling, integrations, and robust background processing.

**Sanity** is used for content management because it handles rich media effectively and gives the team a flexible way to manage exam materials, media assets, and editorial updates.

**AI assistance** is implemented as a dedicated service so the product can evolve its learning experience independently. This keeps the assistant modular, easier to extend, and more maintainable than embedding AI logic directly into the core application flow.
