# Agent Communication & Protocols

This document defines how services communicate, trade event statuses, and database sharing structures.

## Inline Scan Pipeline Flow (Synchronous)
Websocket ingester or direct scan triggers invoke the chain adapters directly. The pipeline downloads the token creation details and the first 20 trades synchronously via async/await from the RPC/Blockscout nodes, bypasses Redis queues, and processes the scoring in-memory before saving the results to Supabase.

## Scan Server to Client (SSE Protocol)
API Scan route pushes updates to client listening handles using Next.js Response streams:
- `Content-Type`: `text/event-stream`
- `Cache-Control`: `no-cache`
- `Connection`: `keep-alive`

Standard SSE sequence:
1. `event: progress` | `data: {"step":"deployer","pct":10}`
2. `event: progress` | `data: {"step":"buyers","pct":20}`
3. `event: progress` | `data: {"step":"funding_graph","pct":40}`
4. `event: cluster`  | `data: {"id":"C114","wallets":14,"parent":"7xKp...9fQ2"}`
5. `event: progress` | `data: {"step":"known_wallets","pct":70}`
6. `event: progress` | `data: {"step":"dev_history","pct":80}`
7. `event: progress` | `data: {"step":"scoring","pct":90}`
8. `event: verdict`  | `data: {"verdict":"CAP","confidence":0.96,"subclass":"extraction","reasons":[...]}`

## Bot / Frontend Client Communication
The Telegram bot is powered by a Webhook handler: `POST /api/v1/telegram/webhook`.
* When a user inputs a CA, the webhook handler executes the scanner logic synchronously.
* The response formatting follows the exact NoCap Agent Report template layout (with division markers, risk score percentages, and formatted key findings).
* Free scan checks and history logging are linked directly to database tables.
