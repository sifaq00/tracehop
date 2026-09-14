/* eslint-disable @typescript-eslint/no-explicit-any -- UAIM intentionally untyped at boundary, narrowed via ?? guards */
'use client';
import { useState } from 'react';

export interface TradePoint { trader: string; solAmount: number; slot: number; }
interface Props {
  uaim: any;
  trades: TradePoint[];
  meta: { mint: string; regime: string; tradesSource?: string; fundingSource?: string; creatorSource?: string };
}

function short(addr: string): string {
  if (!addr || addr.length < 10) return addr || '?';
  return `${addr.slice(0, 4)}..${addr.slice(-3)}`;
}

function Panel({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-black/30 border border-[#241a45]">
      <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center justify-between px-3 py-2.5 font-mono text-[10px] uppercase tracking-widest text-[#94a3b8] hover:text-white cursor-pointer">
        <span>{title}</span>
        <span>{open ? 'x' : '+'}</span>
      </button>
      {open && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

function SourceBadge({ value }: { value?: string }) {
  const mock = !value || value === 'mock';
  return (
    <span className={`ml-auto text-[8.5px] font-mono px-1.5 py-0.5 rounded border ${mock ? 'text-amber-300 border-amber-500/40 bg-amber-500/10' : 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10'}`}>
      {mock ? 'MOCK' : 'ON-CHAIN'}
    </span>
  );
}

function FundingGraph({ uaim, source }: { uaim: any; source?: string }) {
  const edges: any[] = uaim?.fundingGraph?.edges ?? [];
  const nodes: any[] = uaim?.fundingGraph?.nodes ?? [];
  const deployer: string = uaim?.deployment?.deployer ?? '';
  if (edges.length === 0 && nodes.length === 0) {
    return <p className="font-mono text-[11px] text-[#64748b]">no data</p>;
  }
  const typeOf = new Map<string, string>(nodes.map((n) => [n.address, n.type]));
  const groups = new Map<string, string[]>();
  for (const e of edges) {
    if (!e?.from || !e?.to) continue;
    if (!groups.has(e.from)) groups.set(e.from, []);
    if (!groups.get(e.from)!.includes(e.to)) groups.get(e.from)!.push(e.to);
  }
  for (const n of nodes) {
    if (!groups.has(n.address) && !edges.some((e) => e.to === n.address)) {
      groups.set(n.address, []);
    }
  }
  const parents = [...groups.keys()];
  const W = 320;
  const topY = 30;
  const rowH = 44;
  const H = topY + 34 + parents.length * rowH + 8;
  const colorOf = (addr: string): string => {
    if (deployer && addr === deployer) return '#fb7185';
    if (typeOf.get(addr) === 'cex') return '#34d399';
    return '#f59e0b';
  };
  const labelOf = (addr: string): string => {
    if (deployer && addr === deployer) return 'DEPLOYER';
    if (typeOf.get(addr) === 'cex') return 'CEX';
    return 'PARENT';
  };
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: Math.min(220, H) }}>
        {parents.map((p, pi) => {
          const wallets = groups.get(p)!;
          const y = topY + 34 + pi * rowH + rowH / 2;
          const px = 76;
          return (
            <g key={p}>
              <line x1={px} y1={topY} x2={px} y2={y} stroke="#3b2d6e" strokeWidth="1" strokeDasharray="3 3" />
              <rect x={px - 62} y={topY - 13} width={124} height={26} rx={7} fill="#14102b" stroke={colorOf(p)} strokeOpacity="0.8" />
              <circle cx={px - 50} cy={topY} r={4} fill={colorOf(p)} />
              <text x={px - 40} y={topY - 1} fill="#e2e8f0" fontSize="9" fontFamily="monospace">{short(p)}</text>
              <text x={px - 40} y={topY + 9} fill={colorOf(p)} fontSize="7.5" fontFamily="monospace">{labelOf(p)} · {wallets.length}</text>
              {wallets.slice(0, 8).map((w, wi) => {
                const x = 150 + wi * 21;
                const clustered = wallets.length > 1;
                return (
                  <g key={w}>
                    <line x1={px} y1={topY + 13} x2={x} y2={y - 6} stroke={clustered ? '#f59e0b' : '#475569'} strokeWidth="1" opacity={clustered ? 0.85 : 0.45} />
                    <circle cx={x} cy={y} r={5.5} fill={clustered ? '#f59e0b' : '#64748b'} opacity="0.9">
                      <title>{w}</title>
                    </circle>
                  </g>
                );
              })}
              {wallets.length > 8 && (
                <text x={150 + 8 * 21} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace">+{wallets.length - 8}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 font-mono text-[9.5px] text-[#64748b]">
        <span><span className="inline-block w-2 h-2 rounded-full bg-[#fb7185] mr-1" />deployer</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-[#34d399] mr-1" />cex (benign)</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-[#f59e0b] mr-1" />clustered</span>
        <span className="ml-auto">{parents.length} parents · {edges.length} links · {Math.round((uaim?.ownership?.clusterAdjustedConcentration ?? 0) * 100)}% share</span>
        <SourceBadge value={source} />
      </div>
    </div>
  );
}

function Uniformity({ uaim, trades, source }: { uaim: any; trades: TradePoint[]; source?: string }) {
  const list = trades ?? [];
  if (list.length === 0) return <p className="font-mono text-[11px] text-[#64748b]">no data</p>;
  const maxBuy = Math.max(0.0001, ...list.map((t) => t.solAmount));
  const mean = list.reduce((a, t) => a + t.solAmount, 0) / list.length;
  return (
    <div>
      <div className="flex items-end justify-center gap-1.5 h-24">
          {list.map((t, i) => {
            const h = Math.max(5, (t.solAmount / maxBuy) * 100);
            const whale = t.solAmount > mean * 2 && list.length > 2;
            return (
              <div
                key={`${t.trader}-${i}`}
                title={`${t.trader} · ${t.solAmount.toFixed(4)} SOL · slot ${t.slot}`}
                className={`flex-1 max-w-[40px] rounded-t-[3px] ${whale ? 'bg-gradient-to-t from-amber-600 to-amber-300' : 'bg-gradient-to-t from-emerald-700 to-emerald-300'}`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      <div className="h-px bg-[#241a45] mt-0" />
      <div className="flex items-center gap-2 mt-1">
        <p className="font-mono text-[10px] text-[#64748b]">
          {list.length} buys · avg {mean.toFixed(4)} · stddev {Number(uaim?.trading?.earlyWindowProfile?.buySizeStdDev ?? 0).toFixed(3)} · same block {uaim?.trading?.earlyWindowProfile?.sameBlockCount ?? 0}
        </p>
        <SourceBadge value={source} />
      </div>
    </div>
  );
}

export function ScanReport({ uaim, trades, meta }: Props) {
  const [open, setOpen] = useState({ graph: false, uniformity: true, deployer: false, behavior: false });
  const toggle = (k: keyof typeof open) => setOpen((p) => ({ ...p, [k]: !p[k] }));
  const creator = uaim?.creator ?? {};
  const outcomes = creator?.priorOutcomes ?? {};
  if (!uaim) return <p className="font-mono text-[11px] text-[#64748b]">no data</p>;
  return (
    <div className="shrink-0 grid gap-2 mt-3">
      <Panel title="Funding relation graph" open={open.graph} onToggle={() => toggle('graph')}>
        <FundingGraph uaim={uaim} source={meta.fundingSource} />
      </Panel>
      <Panel title="Launch buy uniformity" open={open.uniformity} onToggle={() => toggle('uniformity')}>
        <Uniformity uaim={uaim} trades={trades} source={meta.tradesSource} />
      </Panel>
      <Panel title="Deployer profile history" open={open.deployer} onToggle={() => toggle('deployer')}>
        <div className="flex items-center gap-4 font-mono">
          <div className="flex items-end gap-2 h-16">
            {[
              { label: 'LAUNCH', v: creator.priorLaunches ?? 0, c: 'bg-[#7c3aed]' },
              { label: 'DIED', v: outcomes.died ?? 0, c: 'bg-rose-500' },
              { label: 'GRAD', v: outcomes.graduated ?? 0, c: 'bg-emerald-400' },
            ].map((b) => {
              const mx = Math.max(1, creator.priorLaunches ?? 0, outcomes.died ?? 0, outcomes.graduated ?? 0);
              return (
                <div key={b.label} className="flex flex-col items-center gap-1">
                  <span className="text-[11px] text-white font-bold">{b.v}</span>
                  <div className={`w-9 rounded-t-[3px] ${b.c} opacity-90`} style={{ height: `${Math.max(6, (b.v / mx) * 52)}px` }} />
                  <span className="text-[8px] text-[#64748b]">{b.label}</span>
                </div>
              );
            })}
          </div>
          <div className="text-[11px] leading-relaxed">
            <p className="text-[#cbd5e1]">rep score <span className="text-white font-bold">{creator.reputationScore ?? 0}</span></p>
            <p className="text-[#64748b] break-all text-[10px]">{uaim?.deployment?.deployer ?? ''}</p>
          </div>
          <SourceBadge value={meta.creatorSource} />
        </div>
      </Panel>
      <Panel title="Behavior analysis verdict" open={open.behavior} onToggle={() => toggle('behavior')}>
        <p className="font-mono text-[11px] text-[#cbd5e1]">{uaim?.score?.verdict === 'CAP' ? 'THREAT' : 'SAFE'} ({uaim?.score?.subclass ?? ''}) · {Math.round((uaim?.score?.confidence ?? 0) * 100)}%</p>
        {!meta?.mint ? <p className="font-mono text-[10px] text-[#64748b]">no data</p> : <p className="font-mono text-[10px] text-[#64748b]">{(meta.mint ?? '').slice(0, 6)}...{(meta.mint ?? '').slice(-4)} · {meta.regime}</p>}
      </Panel>
    </div>
  );
}
