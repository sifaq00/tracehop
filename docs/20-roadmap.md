# Project Roadmap & Milestones

This document details the development milestones, operational targets, and completion status for the NOCAP platform.

```
 M1: Core Pipeline [DONE] ──> M2: Loop & Metrics [DONE] ──> M3: Public Surfaces [DONE] ──> M4: External APIs [DONE]
                                                                                                  │
                                                                                                  ▼
 M8: Cross-Chain [DONE]  <──  M7: Robinhood EVM [DONE]  <──  M6: Rules Engine [DONE]   <──  M5: Solana Port [DONE]
   │
   ▼
 M9: AI surfaces & Payments [DONE]
```

## Milestone 1: Core Scan Pipeline (M1) - [COMPLETED]
* **Goal**: Process a token address end-to-end, parse trades, perform funding traces, and output a verdict.
* **Status**: Completed. Solana transaction fetching and funding parent wallet tracing are fully integrated.

## Milestone 2: Self-Improving Loop & Shadow Mode (M2) - [COMPLETED]
* **Goal**: Automate performance logging and evaluate rules accuracy.
* **Status**: Completed. Dynamic JSON rules engine, scorer, and capability registry are running. Prediction logs and outcome triggers are populated.

## Milestone 3: TG Bot & Accuracy Portal (M3) - [COMPLETED]
* **Goal**: Launch consumer interfaces.
* **Status**: Completed. Telegram bot integrates with webhook and database-linked history scan limits. Public page shows live stats.

## Milestone 4: External Integrations & SDK (M4) - [COMPLETED]
* **Goal**: Open API services to third-party integrations.
* **Status**: Completed. REST/SSE endpoints are exposed. Embedded `/embed` widgets render dynamically.

## Milestone 5: Solana Consolidation (M5) - [COMPLETED]
* **Goal**: Refactor the current Solana codebase to implement internal Ports & Adapters interfaces and output normalized UAIM documents.
* **Status**: Completed. Standard ports and adapters structure implemented. Compilation and unit tests pass with zero regression.

## Milestone 6: Universal Engine & Extraction (M6) - [COMPLETED]
* **Goal**: Isolate all chain-agnostic modules (Risk rules, Scoring calibrators, AI explainer) into a strictly decoupled engine in `packages/core`.
* **Status**: Completed. Decoupled engine isolated in `packages/core`. Registry supports loading mock or chain adapters dynamically.

## Milestone 7: Robinhood Chain Adapter Family (M7) - [COMPLETED]
* **Goal**: Implement the Robinhood Chain EVM integration to scan meme tokens and flag impersonated Stock Tokens.
* **Status**: Completed. Users can scan Robinhood EVM token addresses and receive a full UAIM-compliant intelligence report, complete with fake stock token flagging and wash trading alerts.

## Milestone 8: Cross-Chain Reputations & Bridge Resolution (M8) - [COMPLETED]
* **Goal**: Build bridge tracing to link week-one Robinhood Wallet identities with historic Solana/Ethereum addresses.
* **Status**: Completed. Cross-chain bridge transaction tracker and reputation cache are implemented.

## Milestone 9: AI Portfolio & Agent Surfaces (M9) - [COMPLETED]
* **Goal**: Package NoCap intelligence as a machine-readable safety oracle and implement payment gating models.
* **Status**: Completed. Model Context Protocol (MCP) server implemented under `packages/mcp`. Payment gating (0.05 SOL Phantom flow, 66,666 $NOCAP hold, and 3 free trial scans) fully built into Next.js routes.
