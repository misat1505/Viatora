# Service: Auth Service

**Technology**: FastAPI (Python)  
**Role**: Manages user identity. Handles Google OAuth 2.0 login, issues JWT tokens, and exposes a gRPC server for all auth operations.

---

## Responsibilities

- Expose a gRPC server — all calls come from the API Gateway, never directly from clients
- Integrate with Google OAuth 2.0 for social login
- Issue JWT access tokens (15 min TTL) and refresh tokens (30 days TTL)
- Store and manage user records in its own PostgreSQL database
- Publish `user.registered` to Kafka on new user creation

---

## Internal Architecture

```
app/
├── main.py                            # Starts both gRPC server and Kafka producer
├── config.py
├── database.py
├── grpc_server.py                     # gRPC servicer implementation
├── models/
│   └── user.py
├── schemas/
│   ├── user.py
│   └── token.py
├── services/
│   ├── google_oauth.py                # httpx calls to Google APIs
│   ├── token_service.py               # JWT creation & validation
│   └── user_service.py                # DB operations
├── kafka/
│   └── producer.py                    # aiokafka producer
└── proto/
    └── auth.proto
```

---

## Database Schema (PostgreSQL)

### Table: `users`

| Column          | Type         | Constraints                   | Description                   |
| --------------- | ------------ | ----------------------------- | ----------------------------- |
| `id`            | UUID         | PK, default gen_random_uuid() | Internal user ID              |
| `google_id`     | VARCHAR(128) | UNIQUE, NOT NULL              | Google subject ID             |
| `email`         | VARCHAR(255) | UNIQUE, NOT NULL              | User email from Google        |
| `display_name`  | VARCHAR(255) | NOT NULL                      | Full name from Google profile |
| `avatar_url`    | TEXT         | NULL                          | Profile picture URL           |
| `is_active`     | BOOLEAN      | DEFAULT true                  | Soft disable flag             |
| `created_at`    | TIMESTAMPTZ  | DEFAULT now()                 | Registration timestamp        |
| `last_login_at` | TIMESTAMPTZ  | NULL                          | Updated on each login         |

### Table: `refresh_tokens`

| Column       | Type        | Constraints            | Description                         |
| ------------ | ----------- | ---------------------- | ----------------------------------- |
| `id`         | UUID        | PK                     | Token ID — also stored in JWT `jti` |
| `user_id`    | UUID        | FK → users.id, CASCADE | Owner                               |
| `token_hash` | VARCHAR(64) | NOT NULL               | SHA-256 hash of the raw token       |
| `expires_at` | TIMESTAMPTZ | NOT NULL               | 30 days from issuance               |
| `revoked`    | BOOLEAN     | DEFAULT false          | Revoked on logout or rotation       |
| `created_at` | TIMESTAMPTZ | DEFAULT now()          |                                     |

```sql
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_email ON users(email);
```

---

## gRPC Interface

**Proto**: `auth.proto` — port `50051`

All methods are called exclusively by the API Gateway.

```protobuf
service AuthService {
  // Called on every authenticated request — result cached in Gateway Redis
  rpc ValidateToken (ValidateTokenRequest) returns (ValidateTokenResponse);

  // OAuth flow — Gateway redirects client, then calls these
  rpc InitiateOAuth      (InitiateOAuthRequest)      returns (InitiateOAuthResponse);
  rpc HandleOAuthCallback(OAuthCallbackRequest)       returns (OAuthCallbackResponse);

  // Token lifecycle
  rpc RefreshToken (RefreshTokenRequest)  returns (RefreshTokenResponse);
  rpc Logout       (LogoutRequest)        returns (LogoutResponse);

  // Profile
  rpc GetMe (GetMeRequest) returns (GetMeResponse);
}
```

Full message definitions: see [`auth.proto`](../communication/grpc/auth.proto)

---

## Communication

### Inbound

| Source      | Protocol | Methods                     |
| ----------- | -------- | --------------------------- |
| API Gateway | gRPC     | All `AuthService.*` methods |

### Outbound

| Target           | Protocol | Purpose                                |
| ---------------- | -------- | -------------------------------------- |
| Google OAuth API | HTTPS    | Exchange auth code, fetch user profile |
| Kafka            | Producer | `user.registered` on new registration  |

---

## Kafka Events

### Published: `user.registered`

Topic: `user.registered`

```json
{
  "event": "user.registered",
  "userId": "uuid",
  "email": "user@example.com",
  "displayName": "Jan Kowalski",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Consumed by: Notification Service.

---

## Redis Usage

| Key pattern           | Value | TTL                | Purpose                                      |
| --------------------- | ----- | ------------------ | -------------------------------------------- |
| `token:revoked:{jti}` | `"1"` | Until token expiry | Revocation list — checked in `ValidateToken` |

Token validation cache lives in the **Gateway's Redis** (not here) to avoid a network hop on every request.

---

## JWT Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "jti": "unique-token-id",
  "iat": 1700000000,
  "exp": 1700000900
}
```

Algorithm: `RS256`. Private key held only by Auth Service. Public key distributed to other services that need local verification.

---

## Environment Variables

```env
GRPC_PORT=50051
DATABASE_URL=postgresql+asyncpg://user:pass@auth-db:5432/authdb
REDIS_URL=redis://redis:6379
KAFKA_BOOTSTRAP_SERVERS=kafka:9092

GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://ExamPro.pl/auth/google/callback

JWT_PRIVATE_KEY_PATH=/secrets/jwt_private.pem
JWT_PUBLIC_KEY_PATH=/secrets/jwt_public.pem
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
JWT_REFRESH_TOKEN_EXPIRE_DAYS=30
```

---

## Key Dependencies

```toml
fastapi = "^0.110"
grpcio = "^1.62"
grpcio-tools = "^1.62"
sqlalchemy = {extras = ["asyncio"], version = "^2.0"}
asyncpg = "^0.29"
alembic = "^1.13"
aiokafka = "^0.10"
httpx = "^0.27"
python-jose = {extras = ["cryptography"], version = "^3.3"}
pydantic-settings = "^2.2"
redis = {extras = ["asyncio"], version = "^5.0"}
```
