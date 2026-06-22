# Viatora

Pass your driving license exam.

## Architecture

Architecture overview is available [here](./docs/architecture.md).

## Tech Stack

- NestJS
- Next.js
- Spring Boot
- FastAPI
- Docker
- PostgreSQL
- Redis
- Kafka

## Local Development

### 1. Environment setup

Copy the example environment file:

```shell
cp .env.example .env
```

### 2. Start infrastructure

Start required Docker services:

```shell
docker compose up -d
```

### 3. Run services

Each service can be started independently. See individual READMEs:

- [API Gateway](./services/api-gateway/README.md)
- [Auth Service](./services/auth-service/README.md)
