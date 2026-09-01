# Repository Structure

NOCAP uses a monorepo structure managed by `pnpm` workspaces to keep modules decoupled while sharing database schemas and core rules definitions.

## Monorepo Layout Map
```text
nocap/
├── apps/
│   └── web/                     # Next.js app containing:
│                                # - Web frontend UI (custom CA scanner, wallet connect modal)
│                                # - API Endpoints (/api/v1/scan, /api/v1/wallet/[addr]/status)
│                                # - Telegram Bot webhook (/api/v1/telegram/webhook)
│                                # - Embedded iframe viewer (/embed)
│
├── chains/                      # Encapsulated blockchain-specific code
│   ├── solana/
│   │   ├── client/              # Solana RPC client configurations
│   │   └── adapters/            # Solana implementations of core ports (DEX, explorer, funding traces)
│   └── robinhood/
│       ├── client/              # EVM JSON-RPC client
│       └── adapters/            # Robinhood EVM implementations of core ports (Blockscout API, stock tokens, bridge)
│
├── packages/
│   ├── core/                    # Core scanning, engine, and adapter interfaces (Chain-Agnostic)
│   │   ├── adapters/            # Port declarations (IChainClient, IExplorer, etc.)
│   │   ├── engine/              # Rules engine and Scorer evaluating UAIM risk rules
│   │   ├── parser/              # Maps raw blockchain feeds to standardized UAIM documents
│   │   ├── registry/            # Chain adapter capability registry
│   │   ├── reputation/          # Cross-chain reputation structures
│   │   └── test/                # Unit test suites (milestone validation checks)
│   │
│   ├── db/                      # Database interface and schemas
│   │   ├── drizzle/             # Drizzle generated SQL files
│   │   └── src/                 # Schemas, Supabase client connections, seeds, and check-db diagnostic scripts
│   │
│   └── mcp/                     # Model Context Protocol (MCP) server
│                                # Allows autonomous AI agents to query token scan reports
│
├── docs/                        # Project documentation files
```
