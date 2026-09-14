/* eslint-disable @typescript-eslint/no-explicit-any -- UAIM intentionally untyped at boundary, narrowed via ?? guards */
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
