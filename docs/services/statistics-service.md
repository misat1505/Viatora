# Service: Statistics Service

**Technology**: FastAPI (Python)  
**Role**: Kafka consumer and analytics provider. Ingests exam results, stores time-series data in TimescaleDB, and exposes analytics via gRPC.

---

## Responsibilities

- Consume `exam.completed` Kafka events and persist results to TimescaleDB
- Expose a gRPC server for analytics and history queries
- Compute score trends, category accuracy, weak spots, streak tracking
- Cache pre-computed dashboards in Redis

---

## Internal Architecture

```
app/
├── main.py                            # Starts gRPC server + Kafka consumer
├── config.py
├── database.py
├── grpc_server.py                     # gRPC servicer — StatsService.*
├── models/
│   └── exam_result.py
├── schemas/
│   ├── exam_result.py
│   └── stats.py
├── services/
│   ├── stats_service.py               # Aggregation queries
│   └── cache_service.py
├── kafka/
│   └── consumer.py                    # aiokafka consumer
├── workers/
│   └── cache_warmer.py                # Background: pre-compute dashboards
└── proto/
    └── stats.proto
```

---

## Database Schema (TimescaleDB)

### Hypertable: `exam_results`

```sql
CREATE TABLE exam_results (
  id               UUID          NOT NULL DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL,
  session_id       UUID          NOT NULL UNIQUE,
  category         VARCHAR(8)    NOT NULL,
  earned_points    SMALLINT      NOT NULL,
  max_points       SMALLINT      NOT NULL,
  score_percent    DECIMAL(5,2)  NOT NULL,
  passed           BOOLEAN       NOT NULL,
  total_questions  SMALLINT      NOT NULL,
  correct_answers  SMALLINT      NOT NULL,
  duration_seconds INT           NOT NULL,
  category_accuracy JSONB        NOT NULL DEFAULT '{}',
  completed_at     TIMESTAMPTZ   NOT NULL
);

SELECT create_hypertable('exam_results', 'completed_at');

CREATE INDEX idx_er_user_time     ON exam_results(user_id, completed_at DESC);
CREATE INDEX idx_er_user_category ON exam_results(user_id, category);
```

### Continuous Aggregate: `daily_user_stats`

```sql
CREATE MATERIALIZED VIEW daily_user_stats
WITH (timescaledb.continuous) AS
SELECT
  user_id,
  category,
  time_bucket('1 day', completed_at)              AS day,
  COUNT(*)                                         AS exams_taken,
  AVG(score_percent)                               AS avg_score,
  SUM(CASE WHEN passed THEN 1 ELSE 0 END)          AS passed_count,
  AVG(duration_seconds)                            AS avg_duration
FROM exam_results
GROUP BY user_id, category, day;

SELECT add_continuous_aggregate_policy('daily_user_stats',
  start_offset      => INTERVAL '7 days',
  end_offset        => INTERVAL '1 hour',
  schedule_interval => INTERVAL '1 hour'
);
```

---

## gRPC Interface (server)

**Proto**: `stats.proto` — port `50055`

```protobuf
service StatsService {
  rpc GetSummary         (GetSummaryRequest)         returns (GetSummaryResponse);
  rpc GetAnalytics       (GetAnalyticsRequest)       returns (GetAnalyticsResponse);
  rpc GetCategoryBreakdown (GetCategoryBreakdownRequest) returns (GetCategoryBreakdownResponse);
  rpc GetScoreTrend      (GetScoreTrendRequest)      returns (GetScoreTrendResponse);
  rpc GetHistory         (GetHistoryRequest)         returns (GetHistoryResponse);
  rpc GetHistoryDetail   (GetHistoryDetailRequest)   returns (GetHistoryDetailResponse);
}
```

Full message definitions: see [`stats.proto`](../communication/grpc/stats.proto)

### Example: `GetAnalytics` response shape

```json
{
  "totalExams": 42,
  "passRate": 78.5,
  "averageScore": 82.3,
  "bestScore": 97.3,
  "currentStreak": 5,
  "longestStreak": 12,
  "totalTimeMinutes": 840,
  "weakSpots": ["first_aid", "priority_rules", "highway"],
  "byCategory": {
    "B": { "taken": 35, "passRate": 80.0, "avgScore": 83.1 }
  }
}
```

---

## Communication

### Inbound

| Source      | Protocol | Methods                      |
| ----------- | -------- | ---------------------------- |
| API Gateway | gRPC     | All `StatsService.*` methods |
| Kafka       | Consumer | `exam.completed`             |

### Outbound

| Target      | Protocol | Purpose                       |
| ----------- | -------- | ----------------------------- |
| TimescaleDB | TCP      | Read/write exam results       |
| Redis       | TCP      | Cache pre-computed dashboards |

---

## Kafka Consumer

Topic: `exam.completed` — Consumer group: `statistics-service`

```python
async def handle_exam_completed(message: dict):
    await exam_result_repo.insert(ExamResultCreate(
        session_id       = message["sessionId"],
        user_id          = message["userId"],
        category         = message["category"],
        earned_points    = message["earnedPoints"],
        max_points       = message["maxPoints"],
        score_percent    = message["scorePercent"],
        passed           = message["passed"],
        correct_answers  = message["correctAnswers"],
        total_questions  = message["totalQuestions"],
        duration_seconds = message["durationSeconds"],
        category_accuracy= message["categoryAccuracy"],
        completed_at     = message["completedAt"],
    ))
    await cache_service.invalidate_user(message["userId"])
```

---

## Redis Cache Strategy

| Key                               | Value | TTL    |
| --------------------------------- | ----- | ------ |
| `stats:summary:{userId}`          | JSON  | 10 min |
| `stats:analytics:{userId}`        | JSON  | 10 min |
| `stats:history:{userId}:page:{n}` | JSON  | 5 min  |

Invalidated per-user on each new `exam.completed` event.

---

## Streak Calculation (SQL)

```sql
WITH daily_passes AS (
  SELECT DISTINCT DATE(completed_at AT TIME ZONE 'Europe/Warsaw') AS exam_day
  FROM exam_results
  WHERE user_id = :user_id AND passed = true
  ORDER BY exam_day DESC
),
streak_groups AS (
  SELECT exam_day,
         exam_day - ROW_NUMBER() OVER (ORDER BY exam_day DESC)::int AS grp
  FROM daily_passes
)
SELECT COUNT(*) AS current_streak
FROM streak_groups
WHERE grp = (SELECT grp FROM streak_groups ORDER BY exam_day DESC LIMIT 1);
```

---

## Environment Variables

```env
GRPC_PORT=50055
DATABASE_URL=postgresql+asyncpg://user:pass@stats-db:5432/statsdb
REDIS_URL=redis://redis:6379
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_GROUP_ID=statistics-service
KAFKA_TOPIC_EXAM_COMPLETED=exam.completed
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
redis = {extras = ["asyncio"], version = "^5.0"}
pydantic-settings = "^2.2"
```
