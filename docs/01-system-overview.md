# System Overview

NOCAP is a modular, real-time wallet and token intelligence infrastructure layer designed to analyze token launches across multiple blockchains, supporting Solana (Pump.fun) and Robinhood Chain (hood.fun, NOXA, and tokenized Stock Tokens).

## Core Concept
Instead of rendering complex charts or heavy analytical dashboards, NOCAP outputs a single verdict: **CAP** (indicating a bundled extraction setup where a single entity dominates the supply) or **NO CAP** (organic trading behavior).

Every verdict is delivered alongside a risk percentage score (representing confidence from 0% to 100%) and a list of clear, human-readable reasons detailing the verdict criteria, generated in a chain-agnostic manner.

## Scope & Priority Matrix

| Priority | Scope | Features / Deliverables |
|---|---|---|
| **P0** | Ingestion & Core Scorer | Modular adapters (Solana & Robinhood Chain EVM), cross-chain funding tracers, dynamic rules engine (packages/core), scan API (Next.js REST + SSE stream), prediction history logs, and outcome oracle cron. |
| **P1** | User Surfaces | Telegram Webhook-based bot, embeddable iframe widget (`/embed`), wallet profile search endpoint, and a public accuracy metrics page. |
| **P2** | Distribution & Tooling | Chrome extension (read-only injects), automatic X reply bot, and regime recalibration/shadow mode testing tools. |

## Feature Engine Matrix (Rule-Based with Star Weights)

The system computes core rules for each scan, evaluated with a 1-5 star weight system, severity levels, and custom thresholds:

1. **`funding_parent_share`**: Percentage of the early buyers (first 20) funded by a single parent wallet. A high shared parent funding share triggers an automatic CAP verdict.
2. **`deployer_funded`**: Detects if buyers are funded directly or 1-hop by the developer/creator wallet.
3. **`same_block_count`**: Number of buys occurring in the exact same slot/block/second as token creation.
4. **`size_uniformity`**: Standard deviation of buy sizes in quote assets (SOL/ETH/USDG) (uniform sizes indicate volume bots).
5. **`fresh_wallet_ratio`**: Ratio of buyers whose wallets are under 24 hours old.
6. **`dev_history`**: History of the deployer wallet (prior launches, % dead under 10m, time since last rug).
7. **`dev_commitment`**: Whether the developer wallet holds its buy at early trade thresholds, and presence of metadata socials.
8. **`known_bad_overlap`**: Buyers with history linked to previous extraction/rug tokens.
9. **`stock_token_impersonation`**: EVM rule specifically flagging tokens impersonating tokenized Stock Equities (NVDA, GOOG, AAPL, etc.).

## Verdict Outputs
* **CAP** (`extraction`): Strong cluster funding signatures, high parent share, or uniform bot patterns indicate single-entity supply dominance.
* **NO CAP** (`organic`): Distributed funding, natural variance in size, and non-suspicious deployer actions.
* **NO CAP (Coordinated)**: Group/coordinated buys but without hostile extraction patterns (dev remains committed). Maps to **NO CAP** with an active coordinated warning flag.
