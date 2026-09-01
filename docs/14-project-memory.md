# Project Memory & Caching Strategy

NOCAP uses a database-driven caching layer to minimize blockchain RPC query costs while maintaining accuracy.

## 1. Caching Levels
* **Active Scan Lookup**: To guarantee fresh, live recalculations during active scans, the cache lookup is disabled and live RPC queries are run.
* **Database Cache (`wallet_profiles` table)**: Semi-permanent storage in Supabase. Holds historical profiles of creators and traders.
* **Reputation Cache**: Cross-chain reputation records and bridges mapping caches.

## 2. Wallet Profile Indexing Schema
```typescript
interface CachedWalletProfile {
  address: string;
  firstTxTimestamp: Date;
  txCount: number;
  lastFunder: string;
  funderType: 'deployer' | 'cex' | 'organic_buyer' | 'unknown';
  reputationFlags: string[];
  launches: number;
  deadUnder10m: number;
  avgExtractionSol: number;
  fundedSnipers: number;
  cluster: string;
  trust: number;
  updatedAt: Date;
}
```

## 3. Cache Warming Rules
* When a scan processes, new profile information is inserted or incrementally updated in the Supabase DB.
* Future reference checks (like wallet detail queries) retrieve cached data from the database, preventing redundant RPC lookups.
* Bridge tracing maps cross-chain origins and caches associated wallet addresses.
