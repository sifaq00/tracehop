# Scan Report UAIM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hasil scan tampil verdict hero + 4 panel collapsible (funding graph, uniformity, deployer, behavior) dari payload UAIM penuh.

**Architecture:** Backend tambah `uaim` + `trades` ringkas + `meta` ke `event: verdict` di dua cabang (EVM + Solana). Frontend komponen `ScanReport.tsx` baru baca dari `uaim` chain-agnostic, dipasang di `Demo.tsx` bawah hero.

**Tech Stack:** Next.js 16, React 19, SSE, Tailwind, TypeScript strict.

## Global Constraints

- Tanpa dep chart baru, grafik div/SVG murni.
- Client tidak skor ulang, cuma baca `uaim.score`.
- Mapping baca dari `uaim`, JANGAN dari `features` (bentuk EVM stub beda).
- EVM `verdictLevel` disamakan `FINAL`.
- Payload satu SSE frame, max 20 trades.

---

### Task 1: Backend EVM — graph + trades + emit UAIM

**Files:**
- Modify: `apps/web/src/app/api/v1/scan/route.ts:322-400`

**Interfaces:**
- Consumes: `fundingSources: Record<string, {funder, funderType}>` (`route.ts:243`), `evmBuyers: string[]` (`route.ts:224`), `txs: any[]` (`route.ts:217`), `uaim: UAIMDocument` (`route.ts:322`).
- Produces: verdict SSE dengan `{uaim, trades: TradePoint[], meta}` untuk Task 3. `TradePoint = {trader: string, solAmount: number, slot: number}`.

- [ ] **Step 1: Isi fundingGraph EVM dari fundingSources**

Ganti setelah `route.ts:335` (blok `if (mint.endsWith('000'))`), tambah:

```ts
uaim.fundingGraph = {
  nodes: Object.keys(fundingSources).map((addr) => ({
    address: addr,
    type: fundingSources[addr].funderType === 'cex' ? 'cex' : 'eoa',
  })),
  edges: Object.keys(fundingSources).map((addr) => ({
    from: fundingSources[addr].funder,
    to: addr,
    amount: 0,
    timestamp: Date.now(),
  })),
};
```

Alasan: `normalizeEVMDataToUAIM` return graph kosong.

- [ ] **Step 2: Bangun trades ringkas EVM**

Tambah sebelum emit verdict (`route.ts:390`):

```ts
const txValueByAddr = new Map<string, number>();
for (const t of txs as any[]) {
  const addr = (t.from || t.to) as string | undefined;
  if (!addr) continue;
  const v = Number((t as any).value ?? 0);
  if (!txValueByAddr.has(addr.toLowerCase()) && Number.isFinite(v) && v > 0) {
    txValueByAddr.set(addr.toLowerCase(), v);
  }
}
const evmTrades = evmBuyers.slice(0, 20).map((trader, i) => ({
  trader,
  solAmount: txValueByAddr.get(trader.toLowerCase()) ?? 0.1,
  slot: i,
}));
```

- [ ] **Step 3: Extend emit verdict EVM**

Ganti `route.ts:390-399` jadi:

```ts
await writer.write(encoder.encode(`event: verdict\ndata: ${JSON.stringify({
  step: 'verdict',
  verdict: scoredUaim.score.verdict,
  confidence: scoredUaim.score.confidence,
  subclass: scoredUaim.score.subclass,
  reasons: reasonsList,
  verdictLevel: 'FINAL',
  dbSaved,
  features,
  uaim: scoredUaim,
  trades: evmTrades,
  meta: { mint, regime: 'REGIME W14' },
})}\n\n`));
```

Catatan: `verdictLevel` EVM lama `'high'/'low'` dibuang, samakan `FINAL`.

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @tracehop/web exec tsc --noEmit`
Expected: PASS, tanpa error baru di `scan/route.ts`.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/app/api/v1/scan/route.ts
git commit -m "feat(scan): emit UAIM + trades + meta on EVM verdict"
```

### Task 2: Backend Solana — emit UAIM + trades + meta

**Files:**
- Modify: `apps/web/src/app/api/v1/scan/route.ts:595-656`

**Interfaces:**
- Consumes: `uaim: UAIMDocument` (`route.ts:595`), `finalTrades` (`route.ts:466`), `verdict` (`route.ts:590`), `reasonsList` (`route.ts:604`), `features` (`route.ts:581`), `regime.regimeVersion`.
- Produces: verdict SSE Solana bentuk sama persis dengan Task 1.

- [ ] **Step 1: Tempel skor ke uaim Solana**

`mapSolanaContextToUAIM` return `score` placeholder nol (`normalize.ts:109-116`), skor nyata ada di `verdict` terpisah. Tempel sebelum emit (`route.ts:646`):

```ts
(uaim as any).score = {
  value: verdict.confidence * 100,
  verdict: verdict.verdict,
  subclass: verdict.subclass,
  confidence: verdict.confidence,
  regimeVersion: regime.regimeVersion,
  oneLineReason: reasonsList[0]?.text ?? '',
};
(uaim as any).risks = verdict.reasons.map((r) => ({ code: r.code, severity: r.severity, confidence: 1, evidence: r.text }));
```

EVM tidak perlu, `scoredUaim` sudah berisi skor.

- [ ] **Step 2: Extend emit verdict Solana**

Ganti `route.ts:647-656` jadi:

```ts
await writer.write(encoder.encode(`event: verdict\ndata: ${JSON.stringify({
  step: 'verdict',
  verdict: verdict.verdict,
  confidence: verdict.confidence,
  subclass: verdict.subclass,
  reasons: reasonsList,
  verdictLevel: verdict.verdictLevel,
  dbSaved: dbSaved,
  features,
  uaim,
  trades: finalTrades.slice(0, 20).map((t) => ({ trader: t.trader, solAmount: t.solAmount, slot: t.slot })),
  meta: { mint, regime: regime.regimeVersion },
})}\n\n`));
```

Graph Solana sudah nyata dari `mapSolanaContextToUAIM`, tanpa patch.

- [ ] **Step 3: Typecheck**

Run: `pnpm --filter @tracehop/web exec tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/app/api/v1/scan/route.ts
git commit -m "feat(scan): emit UAIM + trades + meta on Solana verdict"
```

### Task 3: Frontend ScanReport + Demo wiring

**Files:**
- Create: `apps/web/src/components/landing/ScanReport.tsx`
- Modify: `apps/web/src/components/landing/Demo.tsx:76-84`, `Demo.tsx:583-646`

**Interfaces:**
- Consumes: `data` verdict SSE Task 1/2: `{uaim, trades: TradePoint[], meta: {mint, regime}}`. `setLiveResult(data)` (`Demo.tsx:256`) teruskan apa adanya (tipe `any`, lolos).
- Produces: 4 collapsible render, tanpa ubah hero/logika SSE.

- [ ] **Step 1: Buat ScanReport.tsx**

```tsx
'use client';
import { useState } from 'react';

export interface TradePoint { trader: string; solAmount: number; slot: number; }
interface Props {
  uaim: any;
  trades: TradePoint[];
  meta: { mint: string; regime: string };
}

function Panel({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-black/30 border border-[#241a45]">
      <button type="button" onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#94a3b8] hover:text-white cursor-pointer">
        <span>{title}</span>
        <span>{open ? 'x' : '+'}</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export function ScanReport({ uaim, trades, meta }: Props) {
  const [open, setOpen] = useState({ graph: false, uniformity: true, deployer: false, behavior: false });
  const toggle = (k: keyof typeof open) => setOpen((p) => ({ ...p, [k]: !p[k] }));
  const nodes: any[] = uaim?.fundingGraph?.nodes ?? [];
  const edges: any[] = uaim?.fundingGraph?.edges ?? [];
  const maxBuy = Math.max(0.0001, ...trades.map((t) => t.solAmount));
  const creator = uaim?.creator ?? {};
  const outcomes = creator?.priorOutcomes ?? {};
  if (!uaim) return <p className="font-mono text-[11px] text-[#64748b]">no data</p>;
  return (
    <div className="shrink-0 grid gap-2 mt-3">
      <Panel title="Funding relation graph" open={open.graph} onToggle={() => toggle('graph')}>
        {nodes.length === 0 ? <p className="font-mono text-[11px] text-[#64748b]">no data</p> : (
          <svg viewBox="0 0 300 120" className="w-full h-28">
            <circle cx="150" cy="60" r="8" fill="#a855f7" />
            {nodes.slice(0, 12).map((n, i) => {
              const a = (i / Math.max(1, Math.min(12, nodes.length))) * Math.PI * 2;
              const x = 150 + Math.cos(a) * 90;
              const y = 60 + Math.sin(a) * 45;
              const isCex = n.type === 'cex';
              return (
                <g key={n.address ?? i}>
                  <line x1="150" y1="60" x2={x} y2={y} stroke={isCex ? '#34d399' : '#7c3aed'} strokeWidth="1" opacity="0.7" />
                  <circle cx={x} cy={y} r="5" fill={isCex ? '#34d399' : '#f59e0b'} />
                </g>
              );
            })}
          </svg>
        )}
        <p className="font-mono text-[10px] text-[#64748b] mt-1">{edges.length} edges · parent share {Math.round((uaim?.ownership?.clusterAdjustedConcentration ?? 0) * 100)}%</p>
      </Panel>
      <Panel title="Launch buy uniformity" open={open.uniformity} onToggle={() => toggle('uniformity')}>
        {trades.length === 0 ? <p className="font-mono text-[11px] text-[#64748b]">no data</p> : (
          <div className="flex items-end gap-1 h-20">
            {trades.map((t, i) => (
              <div key={`${t.trader}-${i}`} title={`${t.trader} ${t.solAmount}`} className="flex-1 rounded-sm bg-emerald-400/80" style={{ height: `${Math.max(6, (t.solAmount / maxBuy) * 100)}%` }} />
            ))}
          </div>
        )}
        <p className="font-mono text-[10px] text-[#64748b] mt-1">stddev {Number(uaim?.trading?.earlyWindowProfile?.buySizeStdDev ?? 0).toFixed(3)} · same block {uaim?.trading?.earlyWindowProfile?.sameBlockCount ?? 0}</p>
      </Panel>
      <Panel title="Deployer profile history" open={open.deployer} onToggle={() => toggle('deployer')}>
        <p className="font-mono text-[11px] text-[#cbd5e1]">launches {creator.priorLaunches ?? 0} · died {outcomes.died ?? 0} · graduated {outcomes.graduated ?? 0} · rep {creator.reputationScore ?? 0}</p>
        <p className="font-mono text-[10px] text-[#64748b] break-all">{uaim?.deployment?.deployer ?? ''}</p>
      </Panel>
      <Panel title="Behavior analysis verdict" open={open.behavior} onToggle={() => toggle('behavior')}>
        <p className="font-mono text-[11px] text-[#cbd5e1]">{uaim?.score?.verdict ?? ''} ({uaim?.score?.subclass ?? ''}) · {Math.round((uaim?.score?.confidence ?? 0) * 100)}%</p>
        <p className="font-mono text-[10px] text-[#64748b]">{meta.mint.slice(0, 6)}...{meta.mint.slice(-4)} · {meta.regime}</p>
      </Panel>
    </div>
  );
}
```

Aturan: baca dari `uaim`, bukan `features`. `!uaim` → `no data`, tidak crash.

- [ ] **Step 2: Wire ke Demo**

Di `Demo.tsx`, tambah import:

```tsx
import { ScanReport } from './ScanReport';
```

Render di bawah hero banner, dalam `{showVerdict && liveResult && (...)}` setelah `motion.div` hero (`Demo.tsx:645`), tambah:

```tsx
<ScanReport uaim={(liveResult as any).uaim} trades={(liveResult as any).trades ?? []} meta={(liveResult as any).meta ?? { mint: selectedToken.mint, regime: 'REGIME W14' }} />
```

`liveResult` tipe `any` via `setLiveResult(data)`, field baru lolos.

- [ ] **Step 3: Typecheck + lint**

Run: `pnpm --filter @tracehop/web exec tsc --noEmit`
Expected: PASS.
Run: `pnpm --filter @tracehop/web exec eslint src/components/landing/ScanReport.tsx src/components/landing/Demo.tsx`
Expected: PASS, tanpa error.

- [ ] **Step 4: Uji manual dua chain**

Run: `pnpm --filter @tracehop/web dev`, scan BONK (Solana) + satu mint EVM. Cek: 4 panel isi, default uniformity buka, toggle `+`/`x` jalan, trades kosong → `no data` tanpa crash.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/landing/ScanReport.tsx apps/web/src/components/landing/Demo.tsx
git commit -m "feat(landing): scan report 4 collapsible panels from UAIM"
```
