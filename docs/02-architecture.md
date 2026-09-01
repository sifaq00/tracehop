# System Architecture

The NOCAP pipeline is built for high speed and direct execution, eliminating asynchronous worker delays by performing real-time inline scans on-demand inside Next.js API Routes.

```
                  ┌──────────────────────────────┐
                  │        Client / Request      │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │     Next.js API Routes       │
                  │   (/api/v1/scan, /webhook)   │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │    Orchestrator Registry     │
                  │     (packages/core)          │
                  └──────────────┬───────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
            solana/adapters             robinhood/adapters
            (Pump.fun, RPC)             (EVM Client, Blockscout)
                   └─────────────┬─────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │      UAIM Document Parser    │
                  └──────────────┬───────────────┘
                                 │
                                 ▼
                  ┌──────────────────────────────┐
                  │     Dynamic Rules Engine     │
                  │  (Star weights, Scorer)      │
                  └──────────────┬───────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
            Supabase DB Cache           Client SSE Stream
            (wallet_profiles)           (Progress updates)
```

## 1. Request & Ingestion Layer
* **On-Demand Scan Endpoint**: Clients request scans via `POST /api/v1/scan` or the Telegram Bot webhook.
* **Direct Chain Adapters**: Next.js invokes the `Chain Registry` to load the appropriate adapter for the chain (Solana or Robinhood Chain EVM) without routing through background message queues.
* **Live Ingestion**: Connects directly to Solana RPC nodes (with Helius fallbacks) or EVM public RPC nodes and Blockscout APIs to pull the latest creation block and the first 20 trades.

## 2. Ports & Adapters (Multi-Chain Layout)
* **Solana Adapter**: Fetches token mint creation details and the first 20 buy transactions, resolves funding sources (CEX vs. organic wallets).
* **Robinhood EVM Adapter**: Standard JSON RPC client for mainnet/testnet (Chain ID 4663/46630), fetches ERC20 events, interacts with Blockscout REST API to trace EOA transactions and logs, and flags fake Stock Tokens.

## 3. Universal Asset Intelligence Model (UAIM) Parser
* Maps raw blockchain-specific payloads into a standardized `UAIM` document structure (containing uniform metadata, trades history, and funding relationships).
* Guarantees that the scoring engine remains entirely chain-agnostic.

## 4. Scorer & Engine
* Evaluates rule weights using dynamic JSON configurations and a 1-5 star weight severity system.
* Computes the risk score percentage.
* Overwrites predictions using Supabase upserts to ensure the latest scan results are cached.

## 5. Output Handlers
* **SSE Stream**: Server-Sent Events write progress increments (0-100%) and intermediate results directly to the browser client.
* **Telegram Bot**: Operates as a webhook API route, logs history to database, enforces scan limits, and outputs formatted markdown reports.
