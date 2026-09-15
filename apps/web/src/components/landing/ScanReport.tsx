/* eslint-disable @typescript-eslint/no-explicit-any -- UAIM intentionally untyped at boundary, narrowed via ?? guards */
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Shield, ShieldAlert, ShieldCheck, Network, BarChart3, User, Brain } from 'lucide-react';

export interface TradePoint { trader: string; solAmount: number; slot: number; }
interface Props {
  uaim: any;
  trades: TradePoint[];
  meta: { mint: string; chain?: string; regime: string; tradesSource?: string; fundingSource?: string; creatorSource?: string };
}

function short(addr: string): string {
  if (!addr || addr.length < 10) return addr || '?';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function SourceBadge({ value }: { value?: string }) {
  const mock = !value || value === 'mock';
  return (
    <span className={`ml-auto text-[9px] font-mono px-2 py-0.5 rounded-full border ${mock ? 'text-amber-300 border-amber-500/30 bg-amber-500/10' : 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10'}`}>
      {mock ? 'MOCK' : 'ON-CHAIN'}
    </span>
  );
}

function Panel({ title, icon: Icon, open, onToggle, accent, children }: { title: string; icon: any; open: boolean; onToggle: () => void; accent: string; children: React.ReactNode }) {
  return (
    <div className={`rounded-xl border transition-all duration-300 ${open ? `border-[${accent}]/30 bg-[#0c0a1a]/80 shadow-[0_0_20px_rgba(0,0,0,0.3)]` : 'border-[#1e1735]/60 bg-[#0a0818]/60 hover:border-[#2a2050]'}`}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full flex items-center gap-2.5 px-4 py-3 cursor-pointer group"
      >
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${open ? 'bg-gradient-to-br from-[#7c3aed]/30 to-[#ff7a29]/20 shadow-[0_0_8px_rgba(124,58,237,0.2)]' : 'bg-[#1a1333] group-hover:bg-[#221a42]'}`}>
          <Icon className={`w-3.5 h-3.5 transition-colors duration-300 ${open ? 'text-[#c4b5fd]' : 'text-[#64748b] group-hover:text-[#94a3b8]'}`} />
        </div>
        <span className={`font-mono text-[11px] uppercase tracking-widest transition-colors duration-300 ${open ? 'text-white' : 'text-[#7a8599] group-hover:text-[#b0b8c8]'}`}>{title}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="ml-auto"
        >
          <ChevronDown className={`w-4 h-4 transition-colors duration-300 ${open ? 'text-[#c4b5fd]' : 'text-[#475569]'}`} />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FundingGraph({ uaim, source }: { uaim: any; source?: string }) {
  const edges: any[] = uaim?.fundingGraph?.edges ?? [];
  const nodes: any[] = uaim?.fundingGraph?.nodes ?? [];
  const deployer: string = uaim?.deployment?.deployer ?? '';
  if (edges.length === 0 && nodes.length === 0) {
    return <p className="font-mono text-[11px] text-[#4a5568] py-2">No funding data available for this token.</p>;
  }
  const typeOf = new Map<string, string>(nodes.map((n: any) => [n.address, n.type]));
  const groups = new Map<string, string[]>();
  for (const e of edges) {
    if (!e?.from || !e?.to) continue;
    if (!groups.has(e.from)) groups.set(e.from, []);
    if (!groups.get(e.from)!.includes(e.to)) groups.get(e.from)!.push(e.to);
  }
  for (const n of nodes) {
    if (!groups.has(n.address) && !edges.some((e: any) => e.to === n.address)) {
      groups.set(n.address, []);
    }
  }
  const parents = [...groups.keys()];
  const W = 340;
  const topY = 32;
  const rowH = 48;
  const H = topY + 38 + parents.length * rowH + 8;
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
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: Math.min(240, H) }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {parents.map((p, pi) => {
          const wallets = groups.get(p)!;
          const y = topY + 38 + pi * rowH + rowH / 2;
          const px = 82;
          return (
            <g key={p}>
              <line x1={px} y1={topY} x2={px} y2={y} stroke="#2a1e54" strokeWidth="1" strokeDasharray="4 4" opacity="0.6" />
              <rect x={px - 66} y={topY - 15} width={132} height={30} rx={8} fill="#110d24" stroke={colorOf(p)} strokeOpacity="0.5" strokeWidth="0.8" />
              <circle cx={px - 54} cy={topY} r={4.5} fill={colorOf(p)} filter="url(#glow)" />
              <text x={px - 42} y={topY - 1} fill="#e2e8f0" fontSize="9.5" fontFamily="monospace" fontWeight="500">{short(p)}</text>
              <text x={px - 42} y={topY + 10} fill={colorOf(p)} fontSize="8" fontFamily="monospace" opacity="0.9">{labelOf(p)} · {wallets.length}</text>
              {wallets.slice(0, 8).map((w, wi) => {
                const x = 160 + wi * 22;
                const clustered = wallets.length > 1;
                return (
                  <g key={w}>
                    <line x1={px} y1={topY + 15} x2={x} y2={y - 6} stroke={clustered ? '#f59e0b' : '#3b2d6e'} strokeWidth="1" opacity={clustered ? 0.7 : 0.35} />
                    <circle cx={x} cy={y} r={6} fill={clustered ? '#f59e0b' : '#4a5568'} opacity="0.85" filter={clustered ? 'url(#glow)' : undefined}>
                      <title>{w}</title>
                    </circle>
                  </g>
                );
              })}
              {wallets.length > 8 && (
                <text x={160 + 8 * 22} y={y + 3} fill="#64748b" fontSize="9" fontFamily="monospace">+{wallets.length - 8}</text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 pt-2 border-t border-[#1e1735]/50 font-mono text-[9.5px] text-[#64748b]">
        <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-[#fb7185]" />deployer</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-[#34d399]" />cex</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-2 h-2 rounded-full bg-[#f59e0b]" />clustered</span>
        <span className="ml-auto text-[#7a8599]">{parents.length} parents · {edges.length} links · {Math.round((uaim?.ownership?.clusterAdjustedConcentration ?? 0) * 100)}% share</span>
        <SourceBadge value={source} />
      </div>
    </div>
  );
}

function Uniformity({ uaim, trades, source, unit }: { uaim: any; trades: TradePoint[]; source?: string; unit: string }) {
  const list = trades ?? [];
  if (list.length === 0) return <p className="font-mono text-[11px] text-[#4a5568] py-2">No trade data available.</p>;
  const maxBuy = Math.max(0.0001, ...list.map((t) => t.solAmount));
  const mean = list.reduce((a, t) => a + t.solAmount, 0) / list.length;
  const stddev = Number(uaim?.trading?.earlyWindowProfile?.buySizeStdDev ?? 0);
  const sameBlock = uaim?.trading?.earlyWindowProfile?.sameBlockCount ?? 0;
  const uniformity = Number(uaim?.trading?.earlyWindowProfile?.sizeUniformity ?? 0);
  return (
    <div>
      <div className="flex items-end justify-center gap-1 h-28 px-1">
        {list.map((t, i) => {
          const h = Math.max(6, (t.solAmount / maxBuy) * 100);
          const whale = t.solAmount > mean * 2 && list.length > 2;
          return (
            <motion.div
              key={`${t.trader}-${i}`}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.5, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
              title={`${short(t.trader)} · ${t.solAmount.toFixed(4)} ${unit} · slot ${t.slot}`}
              className={`flex-1 max-w-[36px] rounded-t-[4px] cursor-crosshair transition-opacity hover:opacity-100 ${whale ? 'bg-gradient-to-t from-amber-700 to-amber-400 opacity-90' : 'bg-gradient-to-t from-emerald-800 to-emerald-400 opacity-80'}`}
            />
          );
        })}
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-[#2a1e54] to-transparent mt-1" />
      <div className="flex flex-wrap items-center gap-3 mt-2 pt-2 border-t border-[#1e1735]/50">
        <div className="flex items-center gap-4 font-mono text-[10px] text-[#7a8599]">
          <span>{list.length} buys</span>
          <span>avg <span className="text-white">{mean.toFixed(4)}</span></span>
          <span>stddev <span className="text-[#c4b5fd]">{stddev.toFixed(3)}</span></span>
          <span>same block <span className={sameBlock > 3 ? 'text-amber-400' : 'text-emerald-400'}>{sameBlock}</span></span>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-mono text-[9px] text-[#64748b]">uniformity</span>
          <div className="w-16 h-1.5 rounded-full bg-[#1a1333] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, uniformity * 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${uniformity > 0.5 ? 'bg-amber-500' : 'bg-emerald-500'}`}
            />
          </div>
          <span className="font-mono text-[9px] text-[#94a3b8]">{Math.round(uniformity * 100)}%</span>
        </div>
        <SourceBadge value={source} />
      </div>
    </div>
  );
}

function DeployerProfile({ uaim, creatorSource }: { uaim: any; creatorSource?: string }) {
  const creator = uaim?.creator ?? {};
  const outcomes = creator?.priorOutcomes ?? {};
  const launchCount = creator?.priorLaunches ?? 0;
  const diedCount = outcomes.died ?? 0;
  const gradCount = outcomes.graduated ?? 0;
  const ruggedCount = outcomes.rugged ?? 0;
  const hasHistory = launchCount > 0 || diedCount > 0 || gradCount > 0 || ruggedCount > 0;
  const mx = Math.max(1, launchCount, diedCount, gradCount, ruggedCount);
  const rep = creator?.reputationScore ?? 0;
  const repColor = rep >= 0.7 ? 'text-emerald-400' : rep >= 0.4 ? 'text-amber-400' : 'text-rose-400';
  const deployer = uaim?.deployment?.deployer ?? '';
  const txAge = uaim?.deployment?.deployedAt;
  const ageStr = txAge ? `${Math.floor((Date.now() - txAge) / 3600000)}h ago` : '';

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {hasHistory ? (
          <div className="flex items-end gap-2.5 h-20">
            {[
              { label: 'LAUNCH', v: launchCount, c: 'from-[#7c3aed] to-[#a855f7]' },
              { label: 'DIED', v: diedCount, c: 'from-rose-600 to-rose-400' },
              { label: 'GRAD', v: gradCount, c: 'from-emerald-600 to-emerald-400' },
              { label: 'RUG', v: ruggedCount, c: 'from-red-700 to-red-500' },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] text-white font-bold font-mono">{b.v}</span>
                <div className={`w-8 rounded-t-[4px] bg-gradient-to-t ${b.c} opacity-85`} style={{ height: `${Math.max(6, (b.v / mx) * 60)}px` }} />
                <span className="text-[8px] text-[#64748b] font-mono tracking-wider">{b.label}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 h-20">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            </div>
            <div>
              <p className="font-mono text-[11px] text-emerald-400 font-bold">First-time deployer</p>
              <p className="font-mono text-[9px] text-[#64748b]">No prior launches recorded on this chain</p>
            </div>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] text-[#7a8599]">REPUTATION</span>
            <span className={`font-mono text-sm font-bold ${repColor}`}>{rep.toFixed(1)}</span>
            <div className="flex-1 h-1 rounded-full bg-[#1a1333] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${rep * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${rep >= 0.7 ? 'bg-emerald-500' : rep >= 0.4 ? 'bg-amber-500' : 'bg-rose-500'}`}
              />
            </div>
          </div>
          <p className="font-mono text-[9px] text-[#4a5568] break-all leading-relaxed">{deployer}</p>
          {ageStr && <p className="font-mono text-[9px] text-[#64748b] mt-0.5">deployed {ageStr}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-[#1e1735]/50 font-mono text-[9.5px] text-[#64748b]">
        <span>socials {creator?.profileLinks?.length ? <span className="text-emerald-400">{creator.profileLinks.length}</span> : <span className="text-[#4a5568]">none</span>}</span>
        <span>reputation <span className={repColor}>{rep.toFixed(1)}</span></span>
        {hasHistory && <span>history <span className="text-[#c4b5fd]">{launchCount}</span> launches</span>}
        <SourceBadge value={creatorSource} />
      </div>
    </div>
  );
}

function BehaviorVerdict({ uaim, meta }: { uaim: any; meta: any }) {
  const score = uaim?.score ?? {};
  const verdict = score.verdict ?? 'UNKNOWN';
  const confidence = score.confidence ?? 0;
  const subclass = score.subclass ?? '';
  const isThreat = verdict === 'CAP';
  const risks = uaim?.risks ?? [];
  const features = uaim?.fundingGraph ?? {};
  const ownership = uaim?.ownership ?? {};
  const confPct = Math.round(confidence * 100);

  return (
    <div className="space-y-3">
      {/* Verdict Hero */}
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${isThreat ? 'bg-rose-500/5 border-rose-500/20' : 'bg-emerald-500/5 border-emerald-500/20'}`}>
        {isThreat ? (
          <ShieldAlert className="w-8 h-8 text-rose-400 shrink-0" />
        ) : (
          <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`font-display text-lg font-bold ${isThreat ? 'text-rose-400' : 'text-emerald-400'}`}>{isThreat ? 'THREAT' : 'SAFE'}</span>
            {subclass && <span className="font-mono text-[10px] text-[#7a8599] bg-[#1a1333] px-2 py-0.5 rounded-full">{subclass}</span>}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-[10px] text-[#64748b]">confidence</span>
            <div className="flex-1 h-1.5 rounded-full bg-[#1a1333] overflow-hidden max-w-[120px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${confPct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full ${isThreat ? 'bg-rose-500' : 'bg-emerald-500'}`}
              />
            </div>
            <span className={`font-mono text-xs font-bold ${isThreat ? 'text-rose-400' : 'text-emerald-400'}`}>{confPct}%</span>
          </div>
        </div>
      </div>

      {/* Risk Signals */}
      {risks.length > 0 && (
        <div className="space-y-1.5">
          {risks.slice(0, 5).map((r: any, i: number) => (
            <motion.div
              key={r.code ?? i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-[10px] font-mono ${
                r.severity === 'high' ? 'bg-rose-500/5 border-rose-500/20 text-rose-300'
                : r.severity === 'medium' ? 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                : 'bg-[#110d24] border-[#1e1735] text-[#7a8599]'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current" />
              <span className="font-semibold">{r.code}</span>
              <span className="flex-1 text-[9px] opacity-70">{r.evidence?.slice(0, 80) ?? ''}</span>
              <span className="opacity-50">{Math.round((r.confidence ?? 0) * 100)}%</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Parent Share', value: `${Math.round((ownership.clusterAdjustedConcentration ?? 0) * 100)}%`, warn: (ownership.clusterAdjustedConcentration ?? 0) > 0.4 },
          { label: 'Fresh Wallets', value: `${Math.round((ownership.freshWalletRatio ?? 0) * 100)}%`, warn: (ownership.freshWalletRatio ?? 0) > 0.5 },
          { label: 'Insider Share', value: `${Math.round((ownership.insiderShareEstimate ?? 0) * 100)}%`, warn: (ownership.insiderShareEstimate ?? 0) > 0.3 },
          { label: 'Holders', value: `${ownership.holderCount ?? 0}`, warn: false },
        ].map((m) => (
          <div key={m.label} className="px-2.5 py-2 rounded-lg bg-[#110d24] border border-[#1e1735]/50">
            <p className="font-mono text-[8px] text-[#64748b] uppercase tracking-wider mb-0.5">{m.label}</p>
            <p className={`font-mono text-sm font-bold ${m.warn ? 'text-amber-400' : 'text-white'}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 pt-2 border-t border-[#1e1735]/50 font-mono text-[9px] text-[#64748b]">
        <span>{(meta.mint ?? '').slice(0, 6)}...{(meta.mint ?? '').slice(-4)}</span>
        <span className="text-[#4a5568]">·</span>
        <span>{meta.regime}</span>
        <SourceBadge value={meta.tradesSource} />
      </div>
    </div>
  );
}

export function ScanReport({ uaim, trades, meta }: Props) {
  const [openPanel, setOpenPanel] = useState<string | null>('behavior');
  const toggle = (k: string) => setOpenPanel((prev) => (prev === k ? null : k));
  if (!uaim) return <p className="font-mono text-[11px] text-[#4a5568]">no data</p>;
  return (
    <div className="shrink-0 grid gap-2 mt-3">
      <Panel title="Funding relation graph" icon={Network} open={openPanel === 'graph'} onToggle={() => toggle('graph')} accent="#f59e0b">
        <FundingGraph uaim={uaim} source={meta.fundingSource} />
      </Panel>
      <Panel title="Launch buy uniformity" icon={BarChart3} open={openPanel === 'uniformity'} onToggle={() => toggle('uniformity')} accent="#10b981">
        <Uniformity uaim={uaim} trades={trades} source={meta.tradesSource} unit={meta.chain === 'evm' ? 'tokens' : 'SOL'} />
      </Panel>
      <Panel title="Deployer profile history" icon={User} open={openPanel === 'deployer'} onToggle={() => toggle('deployer')} accent="#7c3aed">
        <DeployerProfile uaim={uaim} creatorSource={meta.creatorSource} />
      </Panel>
      <Panel title="Behavior analysis verdict" icon={Brain} open={openPanel === 'behavior'} onToggle={() => toggle('behavior')} accent={uaim?.score?.verdict === 'CAP' ? '#f43f5e' : '#10b981'}>
        <BehaviorVerdict uaim={uaim} meta={meta} />
      </Panel>
    </div>
  );
}
