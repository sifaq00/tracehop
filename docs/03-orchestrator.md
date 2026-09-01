# Orchestrator Agent Specification

The **Orchestrator Agent** is responsible for pipeline execution order, capability routing, and progress streaming for inline on-demand scans.

## Role Responsibilities
1. **Capability Routing**: Queries the `Capability Registry` to load the correct chain adapter (Solana or Robinhood EVM) based on the asset address format and requested `chainId`.
2. **On-Demand Fetching**: Triggers the active chain client to download the first 20 trades and token deployment transaction.
3. **UAIM Mapping**: Calls the parser to transform raw blockchain events into the unified Universal Asset Intelligence Model (UAIM) schema.
4. **State coordination**: Updates progress metrics step-by-step and streams them to the SSE connection or bot webhook.

## Scanning Pipeline Flow (Next.js Inline)
Rather than maintaining memory buffers in Redis, the scanning pipeline follows a synchronous, async/await execution sequence when a scan is requested:

```
[Start Scan]
     │
     ▼
[Identify Chain (Solana/EVM)]
     │
     ▼
[Load Chain Adapter]
     │
     ▼
[Fetch Deployment Metadata (e.g. Pump.fun, hood.fun)]
     │
     ▼
[Fetch First 20 Trades from RPC/Blockscout]
     │
     ▼
[Enrich Wallets (Cache Lookup / RPC Trace)]
     │
     ▼
[Generate UAIM Document]
     │
     ▼
[Evaluate Rules Scorer]
     │
     ▼
[Save to Supabase DB & Stream Verdict]
```

## SSE Progress Steps
During execution, the orchestrator streams 16 specific scan progress steps including:
- Deployer details lookup
- Buyers identification
- Funding graph tracing
- Clustering & similarity checks
- Known wallets lookup
- Developer history evaluation
- Scoring calculations
- Verdict determination
