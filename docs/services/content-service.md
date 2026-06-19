# Service: Content Service

**Technology**: NestJS (TypeScript)  
**Role**: Question bank. Fetches and caches questions with rich media from Sanity CMS, and exposes them exclusively via gRPC.

---

## Responsibilities

- Expose a gRPC server — all calls come from the Exam Engine
- Fetch and normalise question data from Sanity CMS
- Cache the full question bank in Redis to minimise Sanity API calls
- Invalidate cache on Sanity Webhook events (content updates)
- Serve randomised, regulation-compliant question sets

---

## Internal Architecture

```
src/
├── main.ts                            # Starts gRPC server only — no HTTP listener
├── app.module.ts
├── content/
│   ├── content.module.ts
│   ├── content.grpc.controller.ts     # gRPC servicer — ContentService.*
│   └── content.service.ts             # Randomisation + Sanity fetch logic
├── sanity/
│   ├── sanity.module.ts
│   ├── sanity.client.ts               # @sanity/client wrapper
│   └── sanity.queries.ts              # GROQ query definitions
├── webhook/
│   └── webhook.controller.ts          # POST /webhook/sanity — Sanity only, not user-facing
├── cache/
│   ├── cache.module.ts
│   └── question.cache.ts
└── proto/
    └── content.proto
```

> **Note on the Sanity webhook**: Sanity sends HTTP POST callbacks to trigger cache invalidation.
> This is an external system callback (not internal service communication), so a minimal HTTP listener
> is acceptable here. It is not exposed via the API Gateway.

---

## Sanity CMS Data Model

### Document type: `question`

```javascript
{
  name: 'question',
  type: 'document',
  fields: [
    { name: 'externalId',    type: 'string'  },  // Official ID e.g. "1-001"
    { name: 'category',      type: 'string'  },  // "A" | "B" | "C" | "D" | "AM"
    { name: 'difficulty',    type: 'string'  },  // "basic" | "medium" | "specialist"
    { name: 'points',        type: 'number'  },  // 1 | 2 | 3
    { name: 'text',          type: 'text'    },
    { name: 'optionA',       type: 'string'  },
    { name: 'optionB',       type: 'string'  },
    { name: 'optionC',       type: 'string'  },
    { name: 'correctOption', type: 'string'  },  // "A" | "B" | "C"
    { name: 'media',         type: 'file'    },  // image or video asset
    { name: 'mediaType',     type: 'string'  },  // "image" | "video" | "none"
    { name: 'explanation',   type: 'text'    },  // Shown post-exam only
    { name: 'tags',          type: 'array', of: [{type: 'string'}] },
    { name: 'isActive',      type: 'boolean' },
  ]
}
```

### GROQ query

```groq
*[_type == "question" && category == $category && isActive == true] {
  _id, externalId, category, difficulty, points,
  text, optionA, optionB, optionC, correctOption,
  "mediaUrl": media.asset->url, mediaType,
  explanation, tags
}
```

---

## No Relational Database

Content Service has no PostgreSQL. Sanity CMS is the persistent store; Redis is a local cache only. If offline resilience becomes a requirement, a read-replica PostgreSQL mirror can be added later.

---

## Redis Cache Strategy

| Key                        | Value                    | TTL    |
| -------------------------- | ------------------------ | ------ |
| `questions:category:{cat}` | Full JSON question array | 24 h   |
| `questions:version:{cat}`  | SHA-256 of last payload  | No TTL |

### Cache invalidation via Sanity Webhook

```typescript
// webhook/webhook.controller.ts
@Post('/webhook/sanity')
async handleSanityWebhook(@Body() payload, @Headers('sanity-webhook-signature') sig) {
  verifySanitySignature(sig, payload, process.env.SANITY_WEBHOOK_SECRET);
  const category = payload.document?.category;
  await this.questionCache.invalidate(category);
}
```

---

## gRPC Interface (server)

**Proto**: `content.proto` — port `50054`

```protobuf
service ContentService {
  // Primary method — called by Exam Engine on session start
  rpc GetQuestions    (GetQuestionsRequest)    returns (GetQuestionsResponse);

  // Used by Exam Engine to fetch explanation after exam completion
  rpc GetQuestionById (GetQuestionByIdRequest) returns (QuestionDetail);
}
```

Full message definitions: see [`proto/content.proto`](./proto/content.proto)

---

## Question Set Composition

`GetQuestions` returns a shuffled selection per official Polish exam rules:

| Difficulty | Count  | Points each | Total pts |
| ---------- | ------ | ----------- | --------- |
| Basic      | 20     | 1           | 20        |
| Medium     | 6      | 2           | 12        |
| Specialist | 6      | 3           | 18        |
| **Total**  | **32** |             | **50–74** |

Shuffling happens after cache read — every call returns a unique order.

---

## Communication

### Inbound

| Source      | Protocol            | Methods                                   |
| ----------- | ------------------- | ----------------------------------------- |
| Exam Engine | gRPC                | `GetQuestions`, `GetQuestionById`         |
| Sanity CMS  | HTTP POST (webhook) | Cache invalidation only — not via Gateway |

### Outbound

| Target         | Protocol | Purpose                   |
| -------------- | -------- | ------------------------- |
| Sanity CDN API | HTTPS    | GROQ queries              |
| Redis          | TCP      | Read/write question cache |

---

## Environment Variables

```env
GRPC_PORT=50054
WEBHOOK_HTTP_PORT=4004   # Internal only — not exposed via Gateway
REDIS_URL=redis://redis:6379

SANITY_PROJECT_ID=abc123
SANITY_DATASET=production
SANITY_API_VERSION=2024-01-01
SANITY_TOKEN=...
SANITY_WEBHOOK_SECRET=...

CACHE_TTL_SECONDS=86400
```

---

## Key Dependencies

```json
{
  "@sanity/client": "^6",
  "@nestjs/microservices": "^10",
  "@grpc/grpc-js": "^1.9",
  "@grpc/proto-loader": "^0.7",
  "ioredis": "^5"
}
```

---

## Notes

- `explanation` is excluded from `GetQuestions` response — it is only returned by `GetQuestionById`, which is called post-exam.
- Media URLs are Sanity CDN URLs served directly to the client — this service does not proxy media.
- Video clips must be ≤ 30s per Polish driving exam regulations.
