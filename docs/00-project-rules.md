# Project Rules & Development Guidelines

This document outlines the strict guidelines and constraints for developers and agent processes building NOCAP.

## Technical Stack Constraints
* **Architecture**: Next.js unified monorepo manager using `pnpm` workspaces.
* **Runtime**: Node.js v20.x (LTS) with Strict TypeScript.
* **API & Frontend Framework**: Next.js (App Router) instead of standalone Fastify and React apps.
* **Database & Client**: PostgreSQL schema defined via Drizzle ORM, with data queries and mutations processed via the Supabase JS Client SDK.
* **Execution**: In-line real-time scans on-demand inside Next.js API Routes (no standalone background workers or Redis/BullMQ queues).
* **Telegram Bot**: Webhook integration handled as a Next.js App Router API endpoint (`/api/v1/telegram/webhook`).

## Product Boundaries & Non-Goals (v1)
> [!WARNING]
> Do NOT implement any of the following for the version 1 MVP:
> * Machine Learning (ML) or Deep Learning models (all features must be rule-based).
> * Auto-trading execution engines or native project tokens.
> * Mobile applications.

## Config & Threshold Calibration Rules
* **No Hardcoded Thresholds**: All rules threshold coefficients (e.g., standard deviation sizes, minimum token ages, holding thresholds) must be loaded dynamically from the `regime_configs` database table.
* **Regime Versioning**: Predictions must always capture the version of the regime config used during verification (e.g., `REGIME W14`).
* **Hot reloading**: Changes to thresholds in the database must hot-reload without restarting the worker processes or API services.

## Operational & Cost Guardrails
* **Scan Gating & Free Limits**:
  * Free tier is limited to 3 scans per wallet.
  * To bypass limits for free scans and wallet checks, a user must connect a Solana wallet and hold at least **66,666 $NOCAP** tokens.
  * Payment gating allows pay-as-you-go scans via a Phantom wallet 0.05 SOL payment flow verified via a blockhash proxy.
* **RPC Optimization**: All wallet crawls and historical trace crawls must be cached in the database (`wallet_profiles` table).
* **Cost Limits**: Keep RPC calls to a minimum. Log the absolute count of RPC calls per mint scan to enforce the project budget. Trigger webhook warnings if RPC credit usage exceeds limits.
