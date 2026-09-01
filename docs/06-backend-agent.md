# Backend Agent Specification

The **Backend Agent** is responsible for building and maintaining Next.js App Router API endpoints, SSE streams, database mutations, and integration endpoints.

## Role Responsibilities
1. **Next.js API Routing**: Develops endpoints supporting scans, wallet status checks, and Telegram Bot webhooks.
2. **SSE Streaming**: Implements real-time progress updates using native response stream wrappers.
3. **Database Integration**: Oversees direct database reads/updates using the Supabase client.

## Core API Endpoints
* `POST /api/v1/scan`: Runs real-time scan analysis and streams SSE events if `stream=true`.
* `POST /api/v1/telegram/webhook`: processes updates from the Telegram Bot.
* `GET /api/v1/wallet/[addr]/status`: Resolves wallet gating permissions, connected status, and trial scan count.

## SSE Chunk Transmission Rules
* Streamed responses must return `Content-Type: text/event-stream`.
* Write progress updates and results directly to the response stream buffer:
  * `event: progress` | `data: {"step":"funding_graph","pct":42}`
  * `event: cluster`  | `data: {"id":"C114","wallets":14,"parent":"7xKp..."}`
  * `event: verdict`  | `data: {"verdict":"CAP","confidence":0.96,"subclass":"extraction","reasons":[]}`
