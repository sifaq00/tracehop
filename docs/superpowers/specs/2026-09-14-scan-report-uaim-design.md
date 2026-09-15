# Scan Report UAIM (C) — Design

## Goal
Hasil scan tampil seperti referensi: verdict hero kiri + 4 panel collapsible kanan:
FUNDING RELATION GRAPH, LAUNCH BUY UNIFORMITY, DEPLOYER PROFILE HISTORY, BEHAVIOR ANALYSIS VERDICT.

## Decision
Opsi C: backend kirim UAIM utuh ke frontend, frontend derivasi tampilan.
Sumber skor tetap server (`scorer.ts`), client tidak skor ulang, cuma baca.

## Data flow
1. `apps/web/src/app/api/v1/scan/route.ts` `performInlineScan` sudah bangun `uaim` + simpan `predictions.uaim_document`.
2. Extend `event: verdict` payload (`route.ts:390` EVM, `route.ts:647` Solana): tambah `uaim`, `trades` ringkas (max 20 `{trader, solAmount, slot}`), `meta {mint, speedMs, regime}`.
   Alasan `trades`: UAIM hanya aggregate (`windowStats`, `earlyWindowProfile`), chart uniformity butuh array per-buy.
   - Solana: `trades` dari `finalTrades` nyata (`route.ts:403-656`).
   - EVM: buyer cuma address (`evmBuyers`, `route.ts:224`), amount/slot tidak ada → bangun dari lookup `txs[].value` bila ada, fallback sintesis terdistribusi + `slot=index`. Tanpa ini chart uniformity EVM kosong.
3. Patch EVM `fundingGraph`: `normalizeEVMDataToUAIM` kembalikan `nodes:[]/edges:[]` kosong (`chains/robinhood/adapters/normalize.ts:82-85`), padahal `fundingSources` + `parentGroups` sudah ada di route (`route.ts:243-276`). Wajib isi manual dari `fundingSources` sebelum emit, mirror bentuk Solana (`chains/solana/adapters/normalize.ts:84-95`). Tanpa ini panel funding graph EVM blank.
4. Unify `verdictLevel`: EVM kirim `'high'/'low'` (`route.ts:396`), Solana kirim `PRELIMINARY/PROVISIONAL/FINAL`. Samakan EVM → `FINAL` (log `route.ts:340` memang FINAL). Frontend tidak cabang dua format.
3. `Demo.tsx` `handleStartScan` parse verdict, teruskan ke `ScanReport`.

## Components
- Baru: `apps/web/src/components/landing/ScanReport.tsx`.
  Props: `{ uaim: UAIMDocument, trades: TradePoint[], meta: {mint, speedMs, regime, verdict, confidence, subclass, reasons} }`.
  4 collapsible (`+`/`x`), default: uniformity terbuka, sisanya tertutup.
- `Demo.tsx:583`: render `<ScanReport>` di bawah hero banner, hanya saat `showVerdict && liveResult`.
- Mapping (baca dari `uaim`, chain-agnostic, JANGAN dari `features` — `features` EVM stub beda bentuk `route.ts:344-349`):
  - Funding graph ← `uaim.fundingGraph.{nodes, edges}` + `ownership.clusterAdjustedConcentration`.
  - Uniformity ← `trades[]` bar chart div murni (warna: normal emerald, sniper amber, cluster slate).
  - Deployer ← `uaim.creator.{priorLaunches, priorOutcomes, reputationScore}` + `deployment.deployer`.
  - Behavior ← `uaim.score.{verdict, subclass, confidence}` + `risks[]` + `reasons[]`.
- Style: ikut gambar — mono font, border tipis `#241a45`, header tracking-wide, tanpa dep chart baru.

## Error handling
- `uaim` null / `trades` kosong → panel tampil `no data`, hero verdict tetap jalan.
- Payload satu SSE frame, estimasi <100KB, aman.
- EVM + Solana bentuk sama karena sudah dinormalisasi ke UAIM.

## Testing
- Scan BONK (Solana) + satu mint EVM: cek 4 panel terisi, buka-tutup jalan.
- Cek fallback: block `trades` kosong → uniformity `no data`, tidak crash.
- Cek regresi: hero verdict + SSE lama tetap jalan.

## Out of scope
- Skor ulang di client.
- Lib chart baru (D3/recharts).
- Ubah rule/bobot scorer.
