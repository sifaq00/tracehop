# TraceHop · Know before you ape 🔍

TraceHop is a real-time multi-chain wallet intelligence layer that monitors token launches (starting with the first 20 trades), traces funding sources across chains and bridges, and delivers a quick verdict on whether the launch is **CAP** (bundled/extraction/rug-risk) or **NO CAP** (organic/organic coordinated), along with a confidence/risk prediction score.

This repository is structured as a `pnpm` monorepo containing the Next.js fullstack application, chain adapters, scoring engines, database layers, and agent interfaces (MCP).

---

## 🚀 Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) + [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database & ORM**: PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/) & [Supabase JS Client SDK](https://supabase.com/)
- **Blockchain Integrations**:
  - **Solana**: `@solana/web3.js` (Pump.fun program metrics, Phantom wallet connection, SOL payment flow)
  - **Robinhood Chain EVM**: JSON-RPC integration + Blockscout API (RWA Stock Token checks, bridge tracking, and wash-trading detection)
- **Agent Interactivity**: Model Context Protocol (MCP) Server for LLM integration.

---

## 📁 Repository Structure

```text
tracehop/
├── apps/
│   └── web/                     # Fullstack Next.js Application
│                                # - Web UI, Interactive Scanner, & Wallet Gate Modal
│                                # - API Endpoints (/api/v1/scan, /api/v1/wallet/[addr]/status)
│                                # - Telegram Bot Webhook (/api/v1/telegram/webhook)
│                                # - Iframe embed widget (/embed)
│
├── chains/                      # Encapsulated Blockchain Adapters
│   ├── solana/                  # Solana RPC fetchers and funding traces
│   └── robinhood/               # Robinhood EVM RPC client and Blockscout integrations
│
├── packages/
│   ├── core/                    # Chain-Agnostic Rules Engine, Scorer, and UAIM Parser
│   ├── db/                      # Database Schema (Drizzle) and Supabase client
│   └── mcp/                     # Model Context Protocol (MCP) Server for AI Agent tooling
│
└── docs/                        # Specifications, Developer Guides, and Architecture Specs
```

---

## 🛠️ Setup & Local Development

### 1. Prerequisites
- **Node.js**: v20.x (LTS)
- **PNPM**: Installed globally (`npm i -g pnpm`)

### 2. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):

```env
NODE_ENV=development
DATABASE_URL=your-supabase-postgres-connection-string
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key
HELIUS_API_KEY=your-helius-solana-rpc-key
TG_BOT_TOKEN=your-telegram-bot-token
REGIME_VERSION=W14
```

### 3. Install Dependencies
```bash
pnpm install
```

### 4. Database Setup & Migrations
```bash
# Generate SQL migrations via Drizzle Kit
pnpm --filter @tracehop/db db:generate

# Execute migrations on the database
pnpm --filter @tracehop/db db:migrate

# Seed default regime configurations and rules
pnpm --filter @tracehop/db db:seed

# Check database connection state
pnpm --filter @tracehop/db run check-db
```

### 5. Running the Application
```bash
# Run Next.js web application locally
pnpm --filter @tracehop/web dev
```

---

## 🧪 Testing

The core engine and rule models are verified using automated unit and integration tests.

```bash
# Run all tests in the core package
pnpm --filter @tracehop/core run test
```

---

## 📖 Documentation Index

For detailed architectural diagrams and role specifications, please refer to the files in the [docs/](file:///D:/Real%20Kerja/NoCap/docs/) directory:

### Core Specs & Rules
- [00-project-rules.md](file:///D:/Real%20Kerja/NoCap/docs/00-project-rules.md) - Project-wide guidelines, limits, and tech constraints.
- [01-system-overview.md](file:///D:/Real%20Kerja/NoCap/docs/01-system-overview.md) - Product concept, scope, and feature matrix.
- [02-architecture.md](file:///D:/Real%20Kerja/NoCap/docs/02-architecture.md) - System architecture diagram and flow description.

### Agent-Specific Systems
- [03-orchestrator.md](file:///D:/Real%20Kerja/NoCap/docs/03-orchestrator.md) - Scan routing, UAIM parser, and step updates coordination.
- [04-planner-agent.md](file:///D:/Real%20Kerja/NoCap/docs/04-planner-agent.md) - Rules engine scoring calibration and weights.
- [05-architect-agent.md](file:///D:/Real%20Kerja/NoCap/docs/05-architect-agent.md) - Repository package layout definitions.
- [06-backend-agent.md](file:///D:/Real%20Kerja/NoCap/docs/06-backend-agent.md) - API endpoints & SSE streaming specifications.
- [07-frontend-agent.md](file:///D:/Real%20Kerja/NoCap/docs/07-frontend-agent.md) - Next.js UI styling, tokens, and wallet triggers.
- [08-qa-agent.md](file:///D:/Real%20Kerja/NoCap/docs/08-qa-agent.md) - Test harnesses & holdout performance calibration.
- [09-debug-agent.md](file:///D:/Real%20Kerja/NoCap/docs/09-debug-agent.md) - DNS overrides and troubleshooting diagnostics.
- [10-security-agent.md](file:///D:/Real%20Kerja/NoCap/docs/10-security-agent.md) - Wallet gating, 66,666 $NOCAP holding requirements, and SOL payments.
- [11-devops-agent.md](file:///D:/Real%20Kerja/NoCap/docs/11-devops-agent.md) - Deployment setup on Railway.
- [12-reporter-agent.md](file:///D:/Real%20Kerja/NoCap/docs/12-reporter-agent.md) - Oracle outcomes verification.

### Collaboration & Repositories
- [13-agent-communication.md](file:///D:/Real%20Kerja/NoCap/docs/13-agent-communication.md) - API stream details & webhook communication protocols.
- [14-project-memory.md](file:///D:/Real%20Kerja/NoCap/docs/14-project-memory.md) - Database caching strategy for wallet profiles.
- [15-workflow.md](file:///D:/Real%20Kerja/NoCap/docs/15-workflow.md) - Development & database migration guidelines.
- [16-repository-structure.md](file:///D:/Real%20Kerja/NoCap/docs/16-repository-structure.md) - Monorepo path layout map.
- [17-coding-standard.md](file:///D:/Real%20Kerja/NoCap/docs/17-coding-standard.md) - Strict TypeScript & Route handler guidelines.
- [18-testing-standard.md](file:///D:/Real%20Kerja/NoCap/docs/18-testing-standard.md) - Unit test structures and coverage expectations.
- [19-deployment.md](file:///D:/Real%20Kerja/NoCap/docs/19-deployment.md) - Deployment scripts on target platforms.
- [20-roadmap.md](file:///D:/Real%20Kerja/NoCap/docs/20-roadmap.md) - Operational Milestones (M1 to M9) completion history.
