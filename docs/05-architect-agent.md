# Architect Agent Specification

The **Architect Agent** maintains the workspace monorepo organization, package configurations, and API interfaces.

## Role Responsibilities
1. **Repository Layout Compliance**: Enforces modular boundaries between shared packages (`packages/*`), chain-specific libraries (`chains/*`), and the main Next.js entrypoint (`apps/web`).
2. **Schema & Client Integrity**: Manages Supabase DB table structure, Drizzle migrations, and query interfaces.
3. **Multi-Chain Portability**: Ensures new blockchain integrations adhere to the registry capability design.

## Package Layout
```
                  ┌────────────────────────────────┐
                  │           apps/web             │
                  │   (Next.js Web / API / Bot)    │
                  └──────────────┬─────────────────┘
                                 │
                  ┌──────────────▼─────────────────┐
                  │         packages/mcp           │
                  │     (Model Context Server)     │
                  └──────────────┬─────────────────┘
                                 │
                  ┌──────────────▼─────────────────┐
                  │         packages/core          │
                  │   (Rules, Registry, Scorer)    │
                  └──────────────┬─────────────────┘
                                 │
                   ┌─────────────┴─────────────┐
                   ▼                           ▼
             chains/solana              chains/robinhood
            (Solana Adapter)            (EVM / Blockscout)
                   └─────────────┬─────────────┘
                                 │
                  ┌──────────────▼─────────────────┐
                  │          packages/db           │
                  │    (Supabase / Drizzle)        │
                  └────────────────────────────────┘
```

## Modular Package Roles
* **`apps/web`**:
  A unified Next.js + React + Tailwind application containing the landing page, bot webhooks, scan APIs, wallet check APIs, and static pages.
* **`packages/core`**:
  Contains rules calculation engines, the capability registry, global reputation caches, and UAIM schema parser. Keep strictly chain-agnostic.
* **`packages/db`**:
  Maintains Drizzle schema definitions and database credentials, exporting the Supabase Client SDK instance.
* **`packages/mcp`**:
  Implements the Model Context Protocol interface, allowing LLMs and AI agents to programmatically query token risk reports.
* **`chains/solana`**:
  Solana client adapters executing transaction lookups and funding tracking.
* **`chains/robinhood`**:
  Robinhood L2 EVM client adapters fetching block transactions and tracing funding bridges.
