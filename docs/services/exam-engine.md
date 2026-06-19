# Service: Exam Engine

**Technology**: NestJS (TypeScript)  
**Role**: Core domain service. Exposes a gRPC server for all exam operations, fetches questions from Content Service, enforces scoring rules, and emits results to Kafka.

---

## Responsibilities

- Expose a gRPC server — all calls come from the API Gateway
- Verify subscription status before starting a session (gRPC → Payment Service)
- Fetch randomised question sets from Content Service via gRPC
- Persist in-progress sessions in Redis (TTL-based, zero DB writes mid-session)
- Accept answer submissions and calculate final scores
- Persist completed results in PostgreSQL
- Publish `exam.completed` to Kafka on session finish
- Enforce exam time limits server-side

---

## Internal Architecture

```
src/
├── main.ts
├── app.module.ts
├── exam/
│   ├── exam.module.ts
│   ├── exam.grpc.controller.ts        # gRPC server — ExamService.*
│   ├── exam.service.ts                # Orchestration logic
│   ├── exam.repository.ts             # TypeORM DB access
│   └── entities/
│       ├── exam-session.entity.ts
│       └── exam-answer.entity.ts
├── grpc/
│   ├── clients.module.ts
│   ├── content.client.ts              # gRPC client → Content Service
│   └── payment.client.ts              # gRPC client → Payment Service
├── redis/
│   ├── redis.module.ts
│   └── session.store.ts               # In-progress session storage
├── kafka/
│   └── exam.producer.ts
└── proto/
    ├── exam.proto                     # This service's server contract
    ├── content.proto                  # Client contract
    └── payment.proto                  # Client contract
```

---

## Database Schema (PostgreSQL)

### Table: `exam_sessions`

| Column               | Type        | Constraints       | Description                                             |
| -------------------- | ----------- | ----------------- | ------------------------------------------------------- |
| `id`                 | UUID        | PK                | Session ID                                              |
| `user_id`            | UUID        | NOT NULL, INDEXED | User who took the exam                                  |
| `status`             | ENUM        | NOT NULL          | `in_progress` / `completed` / `abandoned` / `timed_out` |
| `category`           | VARCHAR(8)  | NOT NULL          | e.g. `B`, `A`                                           |
| `total_questions`    | SMALLINT    | NOT NULL          | Always 32                                               |
| `correct_answers`    | SMALLINT    | NULL              | Set on completion                                       |
| `earned_points`      | SMALLINT    | NULL              | Set on completion                                       |
| `max_points`         | SMALLINT    | NULL              | Always 74                                               |
| `passed`             | BOOLEAN     | NULL              | Threshold: 68 pts                                       |
| `time_limit_seconds` | INT         | NOT NULL          | Default 1500 (25 min)                                   |
| `started_at`         | TIMESTAMPTZ | DEFAULT now()     |                                                         |
| `completed_at`       | TIMESTAMPTZ | NULL              |                                                         |

### Table: `exam_answers`

| Column            | Type        | Constraints                    | Description                 |
| ----------------- | ----------- | ------------------------------ | --------------------------- |
| `id`              | UUID        | PK                             |                             |
| `session_id`      | UUID        | FK → exam_sessions.id, CASCADE |                             |
| `question_id`     | UUID        | NOT NULL                       | Ref to Content Service      |
| `question_points` | SMALLINT    | NOT NULL                       | Denormalised: 1 / 2 / 3     |
| `selected_option` | CHAR(1)     | NOT NULL                       | `A` / `B` / `C`             |
| `correct_option`  | CHAR(1)     | NOT NULL                       | Denormalised at answer time |
| `is_correct`      | BOOLEAN     | NOT NULL                       |                             |
| `answered_at`     | TIMESTAMPTZ | DEFAULT now()                  |                             |

```sql
CREATE INDEX idx_exam_sessions_user_id ON exam_sessions(user_id);
CREATE INDEX idx_exam_sessions_user_status ON exam_sessions(user_id, status);
CREATE INDEX idx_exam_answers_session_id ON exam_answers(session_id);
```

---

## Redis Session Store

In-progress session state lives entirely in Redis — no DB writes until submission.

| Key                        | Value              | TTL    |
| -------------------------- | ------------------ | ------ |
| `exam:session:{sessionId}` | JSON session state | 30 min |

```json
{
  "sessionId": "uuid",
  "userId": "uuid",
  "category": "B",
  "questions": [{ "questionId": "uuid", "correctOption": "A", "points": 1 }],
  "answers": { "questionId": "A" },
  "startedAt": "2024-01-15T10:00:00Z",
  "timeLimitSeconds": 1500
}
```

---

## gRPC Interface (server)

**Proto**: `exam.proto` — port `50052`

```protobuf
service ExamService {
  rpc StartSession   (StartSessionRequest)   returns (StartSessionResponse);
  rpc GetSession     (GetSessionRequest)     returns (GetSessionResponse);
  rpc SubmitAnswer   (SubmitAnswerRequest)   returns (SubmitAnswerResponse);
  rpc FinishSession  (FinishSessionRequest)  returns (FinishSessionResponse);
  rpc ListResults    (ListResultsRequest)    returns (ListResultsResponse);
  rpc GetResult      (GetResultRequest)      returns (GetResultResponse);
}
```

Full message definitions: see [`exam.proto`](../communication/grpc/exam.proto)

---

## gRPC Clients (outbound)

### → Content Service

```protobuf
service ContentService {
  rpc GetQuestions    (GetQuestionsRequest)    returns (GetQuestionsResponse);
  rpc GetQuestionById (GetQuestionByIdRequest) returns (Question);
}
```

Called on `StartSession` to fetch 32 randomised questions.

### → Payment Service

```protobuf
service PaymentService {
  rpc CheckSubscription (CheckSubscriptionRequest) returns (CheckSubscriptionResponse);
}
```

Called on `StartSession` to verify active subscription before creating the session.

Full definitions: see [`content.proto`](../communication/grpc/content.proto) and [`payment.proto`](../communication/grpc/payment.proto)

---

## Communication

### Inbound

| Source      | Protocol | Methods                     |
| ----------- | -------- | --------------------------- |
| API Gateway | gRPC     | All `ExamService.*` methods |

### Outbound (sync — gRPC)

| Target          | Method              | When              |
| --------------- | ------------------- | ----------------- |
| Content Service | `GetQuestions`      | On `StartSession` |
| Payment Service | `CheckSubscription` | On `StartSession` |

### Outbound (async — Kafka)

| Topic            | When                                          |
| ---------------- | --------------------------------------------- |
| `exam.completed` | After `FinishSession` is scored and persisted |

---

## Kafka Events

### Published: `exam.completed`

```json
{
  "event": "exam.completed",
  "sessionId": "uuid",
  "userId": "uuid",
  "category": "B",
  "earnedPoints": 65,
  "maxPoints": 74,
  "scorePercent": 87.8,
  "passed": true,
  "correctAnswers": 28,
  "totalQuestions": 32,
  "durationSeconds": 840,
  "categoryAccuracy": {
    "traffic_signs": 0.9,
    "priority_rules": 0.6,
    "first_aid": 1.0
  },
  "completedAt": "2024-01-15T10:14:00Z"
}
```

---

## Scoring Logic

```typescript
// Polish exam rules: 32 questions, max 74 pts, pass at 68 pts
function calculateScore(answers: AnswerMap, questions: Question[]): ScoreResult {
  const earned = questions.reduce(
    (sum, q) => (answers[q.id] === q.correctOption ? sum + q.points : sum),
    0,
  );
  return {
    earnedPoints: earned,
    maxPoints: 74,
    passed: earned >= 68,
    scorePercent: parseFloat(((earned / 74) * 100).toFixed(2)),
  };
}
```

---

## Environment Variables

```env
GRPC_PORT=50052
DATABASE_URL=postgresql://user:pass@exam-db:5432/examdb
REDIS_URL=redis://redis:6379
KAFKA_BOOTSTRAP_SERVERS=kafka:9092

CONTENT_SERVICE_GRPC_URL=content-service:50054
PAYMENT_SERVICE_GRPC_URL=payment-service:50053

EXAM_TIME_LIMIT_SECONDS=1500
EXAM_PASS_THRESHOLD_POINTS=68
```

---

## Key Dependencies

```json
{
  "@nestjs/typeorm": "^10",
  "typeorm": "^0.3",
  "pg": "^8",
  "@nestjs/microservices": "^10",
  "@grpc/grpc-js": "^1.9",
  "@grpc/proto-loader": "^0.7",
  "kafkajs": "^2.2",
  "ioredis": "^5"
}
```
