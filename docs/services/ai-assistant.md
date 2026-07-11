# Service: AI Assistant

**Technology**: NestJS (TypeScript)  
**Role**: Provides an LLM-backed tutoring experience for learners by answering questions about exam content and maintaining conversation history for a specific question.

---

## Responsibilities

- Expose a gRPC service for the API Gateway.
- Retrieve detailed question context from the Content Service.
- Maintain per-question conversation history for each user.
- Build a tutoring prompt for the model provider.
- Send chat completion requests to an external LLM provider through the OpenAI-compatible client.

---

## Internal architecture

```
services/ai-assistant/src/
├── main.ts
├── app.module.ts
├── grpc/
├── modules/
│   ├── assistant/
│   │   ├── assistant.controller.ts
│   │   ├── assistant.service.ts
│   │   └── persistance/
│   └── openai/
│       └── openai.service.ts
```

## Core flow

1. The API Gateway forwards the user’s message to the assistant service.
2. The assistant service looks up the question context by ID through the Content Service.
3. It builds a prompt that includes the question, options, and correct answer.
4. It loads the conversation history for the user-question pair.
5. The assistant sends the prompt and history to the model provider.
6. The new reply is stored and returned to the caller.

## Storage

- Conversation and message history are stored in the AI Assistant service’s own PostgreSQL-backed database.
- Question content is not stored locally beyond the current context retrieved from the Content Service.
- The service uses the model provider as an external inference dependency.

## Communication

### Inbound

- API Gateway via gRPC

### Outbound

- Content Service via gRPC for question lookup
- External LLM provider via HTTP through the OpenAI-compatible client

## AI behavior

The assistant is designed to act like a guided tutor rather than a generic chatbot. The system prompt instructs it to explain concepts clearly, stay grounded in the specific question, and avoid replacing the learning process with a plain answer dump.

## Environment variables

```env
OPENROUTER_API_KEY=...
SERVICE_KEY=...
```

## Notes

- The current implementation uses the OpenRouter-compatible OpenAI client.
- The assistant service is a strong candidate for future enhancements such as richer memory, adaptive hints, and topic-level learning recommendations.
