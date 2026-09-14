# Robinhood Chain Gating & Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement access gating: 3 free scans for anonymous users (tracked via IP in Supabase), then require connecting an EVM wallet holding >= 50,000 $TRCHP ($ARDRILL testnet token on Robinhood Chain), fully dropping obsolete Solana SOL payment gating.

**Architecture:** 
- Port lightweight, dependency-free JSON-RPC `eth_call` hold check from `financialTrading/lib/layered/hold.ts` to `NoCap`.
- Implement IP-based anonymous usage tracking using the existing `usage` table in Supabase.
- Update `/api/v1/scan` to allow anonymous requests (up to 3 scans), and enforce on-chain hold check for connected EVM wallets.
- Expose `/api/v1/gate` status endpoint for live frontend check.
- Update `Demo.tsx` and `WalletModal.tsx` to support anonymous scanning and EVM wallet connections (MetaMask/OKX/Coinbase) for Robinhood Chain.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Supabase REST / `@supabase/supabase-js`, Robinhood Chain (Chain ID `0xb626` = 46630, Sepolia RPC), Tailwind CSS.

## Global Constraints

- Never add heavy blockchain libraries (wagmi/viem/ethers) when standard `fetch` with JSON-RPC `eth_call` does the job (Ponytail Mode).
- Robinhood Chain RPC: `https://robinhood-sepolia-rpc.publicnode.com` (Chain ID `46630` / `0xb626`).
- Test Token: ARDRILL (`0x901fc7e22b7bc7353c66f0344a521e6533bf665f`, 18 decimals).
- Required threshold: 50,000 tokens (`50000 * 10^18`).
- Free anonymous scans limit: 3 scans per IP.

---

### Task 1: Environment Variables & Robinhood Hold Checker Module

**Files:**
- Modify: `.env`
- Modify: `apps/web/.env.local`
- Create: `apps/web/src/lib/gating.ts`
- Test: `apps/web/scripts/test-gating.ts`

**Interfaces:**
- Produces:
  - `checkTokenHold(wallet: string): Promise<{ tier: 2 | 0 | -1; balance: string; formattedBalance: string }>`
  - `checkAnonUsage(ip: string): Promise<{ used: number; remaining: number; allowed: boolean }>`
  - `bumpAnonUsage(ip: string): Promise<void>`
  - `evaluateGating(wallet: string | null, ip: string): Promise<GatingDecision>`

- [ ] **Step 1: Update `.env` and `apps/web/.env.local` with Robinhood Chain & Token variables**
  Add:
  ```env
  HOLD_TOKEN_ADDRESS=0x901fc7e22b7bc7353c66f0344a521e6533bf665f
  HOLD_TOKEN_SYMBOL=ARDRILL
  HOLD_TOKEN_DECIMALS=18
  HOLD_THRESHOLD=50000
  FREE_ANON_SCANS=3
  HOOD_CHAIN_ID=46630
  HOOD_RPC_URL=https://robinhood-sepolia-rpc.publicnode.com
  ```

- [ ] **Step 2: Create `apps/web/src/lib/gating.ts`**
  Implement zero-dependency `checkTokenHold` using `eth_call` (`0x70a08231` balanceOf) and Supabase IP usage tracker using `usage` table with upsert (`Prefer: resolution=merge-duplicates`).

- [ ] **Step 3: Create and run runnable test script `apps/web/scripts/test-gating.ts`**
  Verify:
  1. Hold check against known wallet or zero address returns accurate tier and balance.
  2. Anon usage check and increment against Supabase works as expected.

- [ ] **Step 4: Commit Task 1**
  ```bash
  git add .env apps/web/.env.local apps/web/src/lib/gating.ts apps/web/scripts/test-gating.ts
  git commit -m "feat: add robinhood token hold check and anon gating module"
  ```

---

### Task 2: Gate Status API Endpoint (`/api/v1/gate`)

**Files:**
- Create: `apps/web/src/app/api/v1/gate/route.ts`

**Interfaces:**
- Produces:
  - `GET /api/v1/gate?wallet=0x...` -> `{ mode: 'hold', wallet, tier, balance, anonUsed, anonRemaining, required: 50000, symbol: 'ARDRILL', chain: 'Robinhood' }`

- [ ] **Step 1: Implement `apps/web/src/app/api/v1/gate/route.ts`**
  - Extract client IP from headers (`x-forwarded-for`, `x-real-ip`).
  - If `wallet` param provided, check hold via `checkTokenHold(wallet)`.
  - Check anon usage via `checkAnonUsage(ip)`.
  - Return comprehensive gate status JSON.

- [ ] **Step 2: Verify `/api/v1/gate` with curl or node test**
  Ensure correct JSON response for both anonymous and wallet-provided requests.

- [ ] **Step 3: Commit Task 2**
  ```bash
  git add apps/web/src/app/api/v1/gate/route.ts
  git commit -m "feat: create /api/v1/gate status endpoint"
  ```

---

### Task 3: Refactor Scan Route Gating (`/api/v1/scan`)

**Files:**
- Modify: `apps/web/src/app/api/v1/scan/route.ts`

**Interfaces:**
- Consumes: `evaluateGating(wallet, ip)` from `apps/web/src/lib/gating.ts`

- [ ] **Step 1: Replace legacy Solana 0.01 SOL & 66,666 TRACEHOP gating in `route.ts`**
  - Remove mandatory `if (!userWallet) return 401 WALLET_REQUIRED`.
  - Replace gating logic with `const decision = await evaluateGating(userWallet, clientIp)`.
  - If `!decision.allowed`:
    - Return HTTP 402 with structured payload:
      - For `anon_exhausted`: `{ error: 'ANON_EXHAUSTED', message: 'Free anonymous scans exhausted (3/3). Connect wallet with 50,000+ TRCHP (ARDRILL) on Robinhood Chain to continue.', required: 50000, symbol: 'ARDRILL', chain: 'Robinhood Chain' }`
      - For `insufficient_hold`: `{ error: 'HOLD_REQUIRED', message: 'Wallet holds insufficient TRCHP (ARDRILL). Required: 50,000. Current: ' + decision.formattedBalance, current: decision.formattedBalance, required: 50000, symbol: 'ARDRILL', chain: 'Robinhood Chain' }`
  - If `decision.allowed`:
    - Proceed to scan.
    - If anonymous, consume 1 free scan via `bumpAnonUsage(clientIp)`.

- [ ] **Step 2: Test `/api/v1/scan` directly with mock requests**
  Verify:
  - Anonymous scan 1, 2, 3 succeed.
  - Anonymous scan 4 returns 402 `ANON_EXHAUSTED`.
  - Scan with wallet having < 50k tokens returns 402 `HOLD_REQUIRED`.

- [ ] **Step 3: Commit Task 3**
  ```bash
  git add apps/web/src/app/api/v1/scan/route.ts
  git commit -m "feat: migrate scan gating to 3 free anon + robinhood 50k token hold"
  ```

---

### Task 4: Frontend UI Adaptation (`Demo.tsx`, `WalletModal.tsx`, `WalletButton.tsx`)

**Files:**
- Modify: `apps/web/src/components/landing/Demo.tsx`
- Modify: `apps/web/src/components/WalletModal.tsx`
- Modify: `apps/web/src/components/WalletButton.tsx`

**Interfaces:**
- Consumes: `/api/v1/gate` and updated `/api/v1/scan` 402 response

- [ ] **Step 1: Update `Demo.tsx`**
  - Allow initiating scan without connected wallet (`userWallet` can be null).
  - Fetch `/api/v1/gate` on load to show scan badge (e.g. `Free Anon: 3/3 left` or `Holder Tier`).
  - On HTTP 402:
    - Parse error reason (`ANON_EXHAUSTED` or `HOLD_REQUIRED`).
    - Render modal or interactive callout with "Connect EVM Wallet" button.

- [ ] **Step 2: Update `WalletModal.tsx` and `WalletButton.tsx`**
  - Prioritize EVM wallets: MetaMask, OKX, Coinbase, Browser Wallet (`window.ethereum`).
  - Store connected address in `localStorage.getItem('tracehop-wallet-connected')` formatted as `0x...`.
  - When connecting, request or switch to Robinhood Chain (ID: `46630` / `0xb626`).

- [ ] **Step 3: Verify end-to-end user flow in browser**
  1. Open app without wallet connected -> scan runs freely.
  2. Check counter decrements (3 -> 2 -> 1 -> 0).
  3. On 4th scan -> Prompt appears requesting wallet connection with 50,000 TRCHP (ARDRILL).
  4. Connect EVM wallet -> Balance evaluated.

- [ ] **Step 4: Commit Task 4**
  ```bash
  git add apps/web/src/components/landing/Demo.tsx apps/web/src/components/WalletModal.tsx apps/web/src/components/WalletButton.tsx
  git commit -m "feat: enable anon scanning and evm wallet gating in frontend"
  ```

---

### Task 5: Final Verification & Build Check

- [ ] **Step 1: Run Next.js build (`pnpm --filter @tracehop/web build`)**
  Ensure zero TypeScript or bundling errors.
- [ ] **Step 2: Run verification test suite**
- [ ] **Step 3: Git status & final commit**
