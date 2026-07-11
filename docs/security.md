# Security Overview

Viatora follows a service-oriented security model in which the API Gateway is the public edge and the internal services enforce trust through service-to-service authentication and scoped access.

## Security boundaries

- The API Gateway is the only public entry point for user-facing traffic.
- Internal services communicate over gRPC and are expected to validate a shared service key.
- External callbacks such as Stripe webhooks and Sanity webhooks are accepted only by their dedicated services.
- Sensitive business data such as payment information remains with Stripe; the platform stores only references and internal billing state.

## Authentication and authorization

### User authentication

- User sessions are issued and validated by the Auth Service.
- The API Gateway uses a JWT authentication guard to accept bearer tokens and attach the current user context to the request.
- The gateway caches token validation results in Redis to reduce unnecessary internal calls.

### Service-to-service authentication

- Internal services use a shared service key header or interceptor pattern.
- This helps prevent unauthorised access from other services or from outside the trusted network.
- The Auth Service and other backends currently rely on interceptor-based validation in their gRPC entrypoints.

## Payment security

- Stripe handles card collection and payment lifecycle management.
- The Payment Service verifies webhook signatures before accepting payment events.
- The system stores Stripe event identifiers to prevent duplicate processing.
- Only payment references and subscription state are retained internally.

## Content and AI security considerations

- The Content Service pulls exam content from Sanity and uses environment-based credentials.
- The AI Assistant uses an external model provider via API credentials and should keep prompts and user content limited to the minimum needed for the task.
- Care should be taken not to expose sensitive user data in model prompts beyond what is necessary for tutoring.

## Recommended hardening steps

1. Rotate and centralise shared service keys.
2. Move sensitive configuration to a secret manager.
3. Enforce HTTPS and TLS between services in production.
4. Add stricter role-based permissions to internal gRPC endpoints.
5. Introduce audit logs and anomaly detection for billing and auth flows.
6. Add rate limiting and abuse protection around the AI assistant endpoint.
