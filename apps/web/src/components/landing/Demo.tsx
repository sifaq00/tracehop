'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, ShieldAlert, ShieldCheck, Wallet } from 'lucide-react';
import { PRESET_TOKENS } from '@/lib/landing';
import type { PresetToken } from '@/lib/landing';
import { playClick } from '@/lib/sound-fx';
import { ScanReport } from './ScanReport';
import { WalletModal } from '../WalletModal';
import type { WalletOption } from '../WalletModal';

interface DemoProps {
  registerScanner: (fn: (token?: PresetToken) => void) => void;
}

interface GateStatus {
  mode: string;
  wallet: string | null;
  tier: number;
  balance: string;
  formattedBalance: string;
  anonUsed: number;
  anonRemaining: number;
  anonAllowed: boolean;
  required: number;
  symbol: string;
  chain: string;
  access: boolean;
  accessReason: 'holder' | 'anon_free' | 'insufficient_hold' | 'anon_exhausted' | 'invalid_wallet';
}

interface PaywallData {
  error: string;
  message: string;
  required: number;
  current: string;
  symbol: string;
  chain: string;
  reason: string;
  used?: number;
  total?: number;
}


// ponytail: 9 stages mirror the engine SSE pipeline, driven by live events
const STAGES = [
  { key: 'deployer', label: 'Deployer located' },
  { key: 'buyers', label: 'First 20 buyers buffered' },
  { key: 'funding_graph', label: 'Funding graph built' },
  { key: 'clusters', label: 'Wallet clusters resolved' },
  { key: 'similarity', label: 'Behavior similarity scored' },
  { key: 'known', label: 'Known wallets cross referenced' },
  { key: 'history', label: 'Deployer history pulled' },
  { key: 'bundle', label: 'Bundle detection' },
  { key: 'verdict', label: 'Verdict generated' },
];

export function Demo({ registerScanner }: DemoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const [selectedToken, setSelectedToken] = useState<PresetToken>(PRESET_TOKENS[0]);
  const [inputMint, setInputMint] = useState('');
  const [hasScanned, setHasScanned] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<string[]>([]);
  const [showVerdict, setShowVerdict] = useState(false);
  // ponytail: live API result, not preset mock
  const [liveResult, setLiveResult] = useState<{ verdict: string; confidence: number; subclass: string; reasons: { code: string; text: string }[] } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [paywallData, setPaywallData] = useState<PaywallData | null>(null);
  const [doneStages, setDoneStages] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState<string | null>(null);

  // Robinhood EVM wallet and Gating status
  const [userWallet, setUserWallet] = useState<string | null>(null);
  const [gateStatus, setGateStatus] = useState<GateStatus | null>(null);
  const [isGateLoading, setIsGateLoading] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const fetchGateStatus = useCallback(async (walletParam?: string | null) => {
    try {
      setIsGateLoading(true);
      const activeWallet =
        walletParam !== undefined
          ? walletParam
          : typeof window !== 'undefined'
          ? localStorage.getItem('tracehop-wallet-connected')
          : null;

      const url = activeWallet
        ? `/api/v1/gate?wallet=${encodeURIComponent(activeWallet)}`
        : '/api/v1/gate';

      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const data: GateStatus = await res.json();
        setGateStatus(data);
      }
    } catch (err) {
      console.warn('[Demo] Failed to fetch gate status:', err);
    } finally {
      setIsGateLoading(false);
    }
  }, []);

  // Sync wallet state and gate status
  useEffect(() => {
    const syncWallet = () => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('tracehop-wallet-connected') : null;
      setUserWallet(saved);
      fetchGateStatus(saved);
    };

    syncWallet();
    window.addEventListener('storage', syncWallet);
    window.addEventListener('tracehop-wallet-changed', syncWallet);
    return () => {
      window.removeEventListener('storage', syncWallet);
      window.removeEventListener('tracehop-wallet-changed', syncWallet);
    };
  }, [fetchGateStatus]);

  const markStage = (key: string) => {
    setActiveStage(key);
    setDoneStages((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const handleStartScan = async (tokenToScan?: PresetToken) => {
    const mint = (tokenToScan?.mint || inputMint || PRESET_TOKENS[0].mint).trim();
    const targetToken = tokenToScan || {
      ...PRESET_TOKENS[0],
      name: 'Live Scan Target',
      ticker: mint.slice(0, 4) + '...' + mint.slice(-4),
      mint,
    };

    // Anonymous scan allowed without connected wallet
    const currentWallet =
      userWallet ||
      (typeof window !== 'undefined' ? localStorage.getItem('tracehop-wallet-connected') : null);

    setSelectedToken(targetToken);
    setInputMint(mint);
    setHasScanned(true);
    setIsScanning(true);
    setScanProgress(5);
    setVisibleLogs([]);
    setShowVerdict(false);
    setLiveResult(null);
    setScanError(null);
    setPaywallData(null);
    setDoneStages([]);
    setActiveStage(null);

    // Honest connecting line — all further logs come from live SSE events only
    setVisibleLogs([`> Connecting to scan engine for ${mint.slice(0, 8)}...`]);

    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 55000);
      // SSE stream: call scan API (without requiring userWallet if null)
      const qs = currentWallet
        ? `/api/v1/scan?mint=${encodeURIComponent(mint)}&stream=true&userWallet=${encodeURIComponent(currentWallet)}`
        : `/api/v1/scan?mint=${encodeURIComponent(mint)}&stream=true`;
      const res = await fetch(qs, { signal: ctrl.signal });
      if (res.status === 402) {
        let parsed: PaywallData = {
          error: 'ANON_EXHAUSTED',
          message: `Free scans exhausted (${gateStatus?.anonUsed ?? 0}/${(gateStatus?.anonUsed ?? 0) + (gateStatus?.anonRemaining ?? 0)}). Connect an EVM wallet holding 50,000+ $TRCHP ($ARDRILL) on Robinhood Chain to continue scanning.`,
          required: 50000,
          current: '0',
          symbol: 'ARDRILL',
          chain: 'Robinhood Chain',
          reason: 'anon_exhausted',
        };
        try {
          const j = await res.json();
          parsed = {
            error: j.error || 'HOLD_REQUIRED',
            message: j.message || '',
            required: typeof j.required === 'number' ? j.required : 50000,
            current: typeof j.current === 'string' ? j.current : String(j.current ?? '0'),
            symbol: j.symbol || 'ARDRILL',
            chain: j.chain || 'Robinhood Chain',
            reason: j.reason || '',
            used: typeof j.used === 'number' ? j.used : undefined,
            total: typeof j.total === 'number' ? j.total : undefined,
          };
        } catch { /* ignore */ }
                setIsScanning(false);
        setPaywallData(parsed);
        setScanError(null);
        fetchGateStatus(currentWallet);
        return;
      }
      if (!res.ok || !res.body) throw new Error(`Scan failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      let finished = false;
      while (!finished) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const parts = buf.split('\n\n');
        buf = parts.pop() || '';
        for (const part of parts) {
          const evMatch = part.match(/event: (\w+)/);
          const dataMatch = part.match(/data: ([\s\S]*)/);
          if (!evMatch || !dataMatch) continue;
          const ev = evMatch[1];
          let data: any = null;
          try { data = JSON.parse(dataMatch[1]); } catch { continue; }
          if (ev === 'progress') {
            const pct = data.pct || 0;
            setScanProgress(pct);
            if (data.step) {
              markStage(data.step);
              const message = data.log || `> ${data.step.toUpperCase()}... ${pct}%`;
              setVisibleLogs((prev) => [...prev, message]);
              try { playClick(); } catch { }
              // Derived stages from live events
              if (data.step === 'buyers') { markStage('history'); markStage('known'); }
              if (data.step === 'clustering') { markStage('clusters'); markStage('bundle'); }
              if (data.step === 'scoring') { markStage('similarity'); }
            }
          } else if (ev === 'cluster') {
            markStage('bundle');
            setVisibleLogs((prev) => [
              ...prev,
              data.log || `🚨 CLUSTER DETECTED: ${data.wallets} coordinated wallets share funding parent`,
            ]);
            try { playClick(); } catch { }
          } else if (ev === 'verdict') {
            clearTimeout(timeout);
                        markStage('verdict');
            setLiveResult(data);
            setScanProgress(100);
            const isCap = data.verdict === 'CAP';
            setVisibleLogs((prev) => [
              ...prev,
              `${isCap ? '🔴' : '🟢'} FINAL VERDICT: ${data.verdict} (${Math.round((data.confidence || 0) * 100)}% Confidence)`,
            ]);
            setIsScanning(false);
            setShowVerdict(true);
            finished = true;
            try { playClick(); } catch { }
            fetchGateStatus(currentWallet);
            break;
          } else if (ev === 'error') {
            throw new Error(data.message || data.error || 'Scan failed');
          }
        }
      }
      clearTimeout(timeout);
            if (!finished && !liveResult) {
        setIsScanning(false);
        setScanError('Stream closed before verdict. Try again or pick a quieter mint.');
      }
    } catch (err: any) {
            setIsScanning(false);
      setScanError(err?.name === 'AbortError'
        ? 'Scan timed out (>55s). Node network congested — try again or test another mint.'
        : (err?.message || 'Scan failed. Try again.'));
    }
  };

  useEffect(() => {
    registerScanner(handleStartScan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll terminal as logs appear
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLogs]);

  const renderGateBadge = () => {
    if (!gateStatus && isGateLoading) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-white/10 bg-white/5 font-mono text-[10.5px] text-[#94a3b8]">
          <RefreshCw className="w-2.5 h-2.5 animate-spin" />
          <span>Checking access...</span>
        </span>
      );
    }

    if (gateStatus?.wallet) {
      if (gateStatus.tier === 2 || gateStatus.accessReason === 'holder') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 font-mono text-[10.5px] font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Holder: {gateStatus.formattedBalance || '50,000+'} {gateStatus.symbol || 'ARDRILL'} (Active)</span>
          </span>
        );
      }
      if (gateStatus.accessReason === 'invalid_wallet') {
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 font-mono text-[10.5px] font-semibold text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Invalid EVM Address</span>
          </span>
        );
      }
      return (
        <button
          type="button"
          onClick={() => setIsWalletModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 font-mono text-[10.5px] font-semibold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span>Balance: {gateStatus.formattedBalance || '0'} / 50,000 {gateStatus.symbol || 'ARDRILL'} (Need 50k)</span>
        </button>
      );
    }

    const remaining = gateStatus?.anonRemaining ?? 3;
    const total = (gateStatus?.anonUsed ?? 0) + (gateStatus?.anonRemaining ?? 3);
    if (remaining > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-[#7c3aed]/30 bg-[#7c3aed]/15 font-mono text-[10.5px] font-medium text-[#c4b5fd]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]" />
          <span>Free Anonymous Scans: {remaining}/{total} remaining</span>
        </span>
      );
    }

    return (
      <button
        type="button"
        onClick={() => setIsWalletModalOpen(true)}
        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 font-mono text-[10.5px] font-semibold text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
        <span>Free Scans Exhausted ({total}/{total}) · Connect Wallet</span>
      </button>
    );
  };

  return (
    <section ref={sectionRef} id="demo" className="relative py-16 sm:py-24 overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Left Column: Detective Rabbit */}
          <motion.div
            data-demo-left
            initial={{ opacity: 0, x: -40, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex items-center justify-center relative select-none"
          >
            <div className="absolute inset-0 bg-[#7c3aed]/10 rounded-full blur-[60px] pointer-events-none" />
            {isScanning && (
              <>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.15, 0.45, 0.15] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute w-72 h-72 rounded-full border border-[#7c3aed]/40 bg-[#7c3aed]/5 pointer-events-none"
                />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-4 px-3.5 py-1 rounded-full bg-[#120d2b]/95 border border-[#7c3aed]/50 shadow-[0_0_15px_rgba(124,58,237,0.3)] flex items-center gap-2 font-mono text-[10.5px] font-bold text-[#c4b5fd] z-10 select-none"
                >
                  <span className="w-2 h-2 rounded-full bg-[#a855f7] animate-ping" />
                  <span>INTERROGATING ON-CHAIN</span>
                </motion.div>
              </>
            )}
            {!isScanning && showVerdict && liveResult && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`absolute -top-4 px-3.5 py-1 rounded-full border z-10 select-none flex items-center gap-2 font-mono text-[10.5px] font-bold ${
                  liveResult.verdict === 'CAP'
                    ? 'bg-rose-950/90 border-rose-500/60 text-rose-300 shadow-[0_0_18px_rgba(244,63,94,0.35)]'
                    : 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300 shadow-[0_0_18px_rgba(16,185,129,0.35)]'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${liveResult.verdict === 'CAP' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                <span>{liveResult.verdict === 'CAP' ? 'THREAT CONFIRMED' : 'CONTRACT VERIFIED'}</span>
              </motion.div>
            )}
            <motion.img
              animate={isScanning ? { y: [0, -3, 0], rotate: [-1, 1, -1] } : { y: [0, -6, 0] }}
              transition={isScanning ? { repeat: Infinity, duration: 0.8, ease: 'easeInOut' } : { repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              src="/assets/rabbit-detective.webp"
              alt="Tracehop Detective Rabbit"
              className="w-full max-w-[260px] sm:max-w-[295px] lg:max-w-[320px] max-h-[360px] h-auto object-contain drop-shadow-[0_12px_30px_rgba(124,58,237,0.3)] transition-transform duration-300 hover:scale-105"
            />
          </motion.div>

          {/* Right Column: Demo UI */}
          <motion.div
            data-demo-right
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 flex flex-col items-start text-left"
          >
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2.5">
              LIVE DEMO
            </div>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-[44px] text-white tracking-tight leading-[1.12] mb-3">
              Interrogate <span className="text-[#a855f7] italic">any token.</span> Instantly.
            </h2>
            <p className="text-[#94a3b8] text-sm sm:text-base mb-6 leading-relaxed max-w-xl">
              Paste a mint address. Tracehop will reveal what others try to hide. 3 free anonymous scans daily, or hold 50,000+ $TRCHP ($ARDRILL) on Robinhood Chain for unlimited access.
            </p>

            {/* Search Input Bar */}
            <div className="w-full mb-4.5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-mono font-medium text-[#94a3b8]">
                  Target Mint Address
                </span>
                {renderGateBadge()}
              </div>
              <div className={`relative flex items-center p-2 sm:p-2.5 rounded-2xl bg-[#0c081e] border transition-all duration-300 ${isScanning ? 'border-[#7c3aed] shadow-[0_0_20px_rgba(124,58,237,0.25)]' : 'border-[#2c2054] shadow-[0_0_12px_rgba(124,58,237,0.1)] focus-within:border-[#a855f7]'}`}>
                {/* Scanning sweep line */}
                {isScanning && (
                  <motion.div
                    animate={{ x: ['0%', '100%', '0%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-[#7c3aed]/20 to-transparent pointer-events-none rounded-2xl"
                  />
                )}
                <input
                  type="text"
                  value={inputMint}
                  onChange={(e) => setInputMint(e.target.value)}
                  placeholder="Paste token mint address..."
                  className="w-full bg-transparent px-4 sm:px-5 py-2.5 text-xs sm:text-sm text-white placeholder-[#64748b] font-sans focus:outline-none"
                />
                <button
                  onClick={() => handleStartScan()}
                  disabled={isScanning}
                  type="button"
                  className="inline-flex items-center gap-2 h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(124,58,237,0.3)] hover:shadow-[0_0_16px_rgba(124,58,237,0.45)] transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>SCANNING...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      <span>RUN SCAN</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Preset Chips */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-mono mb-1">
              <span className="text-[#94a3b8] font-medium mr-1">Try these:</span>
              {PRESET_TOKENS.map((token) => (
                <button
                  key={token.ticker}
                  onClick={() => handleStartScan(token)}
                  type="button"
                  className={`px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    hasScanned && selectedToken.ticker === token.ticker
                      ? 'bg-[#1b143d] border-[#7c3aed] text-white shadow-[0_0_6px_rgba(124,58,237,0.2)]'
                      : 'bg-[#100b26] border-[#2c2054] text-[#c4b5fd] hover:text-white hover:border-[#7c3aed]/60'
                  }`}
                >
                  {token.ticker}
                </button>
              ))}
            </div>

            {/* Stage Checklist — driven by live engine events */}
            <AnimatePresence>
              {hasScanned && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mt-3 overflow-hidden"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1.5 font-mono text-[11px]">
                    {STAGES.map((s) => {
                      const done = doneStages.includes(s.key);
                      const active = activeStage === s.key && isScanning;
                      return (
                        <div key={s.key} className="flex items-center gap-2">
                          <span className={done ? 'text-emerald-400' : active ? 'text-[#c4b5fd] animate-pulse' : 'text-[#475569]'}>
                            {done ? '✓' : active ? '◌' : '○'}
                          </span>
                          <span className={done ? 'text-[#cbd5e1]' : active ? 'text-white' : 'text-[#64748b]'}>
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scan Progress Bar */}
            <AnimatePresence>
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full mt-3 overflow-hidden"
                >
                  <div className="flex items-center justify-between text-[10.5px] font-mono text-[#94a3b8] mb-1.5">
                    <span className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-ping" />
                      <span>Investigating on-chain telemetry...</span>
                    </span>
                    <span className="text-[#c4b5fd] font-bold">{scanProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#170f38] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: scanProgress / 100 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      style={{ transformOrigin: 'left' }}
                      className="h-full w-full bg-gradient-to-r from-[#7c3aed] to-[#a855f7] rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terminal Card */}
            <AnimatePresence>
              {hasScanned && (
                <motion.div
                  data-lenis-prevent
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-2xl mt-4 rounded-2xl bg-[#090616] border border-[#241a45] p-4 sm:p-5 shadow-2xl font-mono text-xs flex flex-col max-h-[500px] overflow-hidden"
                >
                  {/* Terminal header */}
                  <div className="shrink-0 flex items-center justify-between pb-3 mb-3 border-b border-[#241a45]">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'animate-pulse bg-[#a855f7]' : liveResult ? (liveResult.verdict === 'CAP' ? 'bg-rose-500' : 'bg-emerald-500') : selectedToken.type === 'SAFE' ? 'bg-emerald-500' : selectedToken.type === 'WARN' ? 'bg-amber-400' : 'bg-rose-500'}`} />
                      <span className="font-bold text-white uppercase tracking-wide">{selectedToken.name}</span>
                      <span className="font-mono text-[#94a3b8] text-[11px]">({selectedToken.ticker})</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-[#64748b]">NETWORK:</span>
                      <span className="text-[#c4b5fd] font-semibold uppercase">{gateStatus?.chain || 'MULTI-CHAIN'}</span>
                    </div>
                  </div>

                  {/* Result renders in the separate card below */}


                  {/* Error */}
                  {!isScanning && scanError && (
                    <p className="shrink-0 text-rose-300 text-[11px] leading-relaxed mb-3">⚠️ {scanError}</p>
                  )}

                  {/* Paywall: 402 Gating Modal/Card */}
                  {!isScanning && paywallData && (
                    <div className="shrink-0 rounded-xl bg-[#120d2b] border border-[#7c3aed]/50 p-4 mb-3 font-sans shadow-[0_0_20px_rgba(124,58,237,0.2)]">
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                          <h4 className="text-white text-xs sm:text-sm font-extrabold tracking-wide">
                            {paywallData.error === 'ANON_EXHAUSTED' || paywallData.reason === 'anon_exhausted'
                              ? 'Free Scans Exhausted'
                              : paywallData.error === 'HOLD_REQUIRED' || paywallData.reason === 'insufficient_hold'
                              ? 'Token Holding Required'
                              : 'Access Gated'}
                          </h4>
                        </div>
                        <span className="font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#7c3aed]/20 text-[#c084fc] border border-[#7c3aed]/30">
                          {paywallData.chain || 'Robinhood Chain'}
                        </span>
                      </div>

                      <p className="text-[#cbd5e1] text-[11.5px] leading-relaxed mb-3">
                        {paywallData.error === 'ANON_EXHAUSTED' || paywallData.reason === 'anon_exhausted'
                          ? `Free scans exhausted (${paywallData.used ?? gateStatus?.anonUsed ?? 0}/${paywallData.total ?? (gateStatus?.anonUsed ?? 0) + (gateStatus?.anonRemaining ?? 0)}). Connect an EVM wallet holding 50,000+ $TRCHP ($ARDRILL) on Robinhood Chain to continue scanning.`
                          : paywallData.error === 'HOLD_REQUIRED' || paywallData.reason === 'insufficient_hold'
                          ? `Insufficient $TRCHP balance. Required: 50,000. Current: ${paywallData.current}.`
                          : paywallData.message}
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => setIsWalletModalOpen(true)}
                          type="button"
                          className="inline-flex items-center justify-center gap-2 h-9 px-4 rounded-xl bg-gradient-to-r from-[#ff7a29] to-[#ea580c] hover:from-[#ff9548] hover:to-[#ff7a29] text-white font-extrabold text-[11px] uppercase tracking-wider shadow-[0_0_15px_rgba(255,122,41,0.4)] transition-all cursor-pointer"
                        >
                          <Wallet className="w-3.5 h-3.5 shrink-0" />
                          <span>{userWallet ? 'Switch EVM Wallet' : 'Connect EVM Wallet'}</span>
                        </button>

                        {userWallet && (
                          <span className="font-mono text-[10.5px] text-[#94a3b8]">
                            Connected: <code className="text-[#c084fc]">{userWallet.slice(0, 4)}...{userWallet.slice(-4)}</code>
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Clean Forensic Streaming Logs Header */}
                  <div className="shrink-0 flex items-center justify-between pt-1 pb-2 font-mono text-[10px] text-[#64748b] border-t border-white/5">
                    <span>FORENSIC TELEMETRY LOG</span>
                    <span>{visibleLogs.length} EVENTS</span>
                  </div>

                  {/* Streaming logs */}
                  <div
                    ref={terminalRef}
                    data-lenis-prevent
                    className="space-y-1.5 text-[11px] overflow-y-auto overscroll-contain pr-1.5 flex-1 min-h-[120px] max-h-[220px] [scrollbar-width:thin] [scrollbar-color:rgba(124,58,237,0.3)_transparent]"
                  >
                    {visibleLogs.map((log, idx) => {
                      const isLast = idx === visibleLogs.length - 1 && isScanning;
                      let textColor = 'text-[#cbd5e1]';
                      let tagColor = 'text-[#7c3aed]';

                      if (log.includes('FINAL VERDICT') || log.includes('VERDICT:')) {
                        textColor = log.includes('CAP') ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold';
                        tagColor = log.includes('CAP') ? 'text-rose-500' : 'text-emerald-500';
                      } else if (log.includes('CLUSTER') || log.includes('🚨')) {
                        textColor = 'text-amber-300 font-semibold';
                        tagColor = 'text-amber-500';
                      }

                      return (
                        <div key={idx} className="flex items-start gap-2 select-text font-mono">
                          <span className={`${tagColor} shrink-0 font-bold`}>&gt;</span>
                          <span className={`${textColor} leading-relaxed`}>
                            {log}
                            {isLast && (
                              <span className="inline-block w-1.5 h-3 bg-[#a855f7] ml-1 animate-pulse align-middle" />
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result Card — separate from process terminal */}
            <AnimatePresence>
              {showVerdict && liveResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-2xl mt-4 rounded-2xl bg-[#090616] border border-[#241a45] p-4 sm:p-5 shadow-2xl font-mono text-xs"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#241a45]">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${liveResult.verdict === 'CAP' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                      <span className="font-bold text-white uppercase tracking-wide">{selectedToken.name}</span>
                      <span className="font-mono text-[#94a3b8] text-[11px]">({selectedToken.ticker})</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px]">
                      <span className="text-[#64748b]">SCAN REPORT</span>
                      <span className="text-[#c4b5fd] font-semibold uppercase">{gateStatus?.chain || 'MULTI-CHAIN'}</span>
                    </div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    className={`p-4 rounded-xl border relative overflow-hidden ${
                      liveResult.verdict === 'CAP'
                        ? 'bg-gradient-to-b from-rose-950/60 to-[#140b18] border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
                        : 'bg-gradient-to-b from-emerald-950/60 to-[#0b1614] border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-2.5">
                      <div className="flex items-center gap-3">
                        {liveResult.verdict === 'CAP' ? (
                          <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                            <ShieldAlert className="w-5 h-5 text-rose-400" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[#94a3b8]">AUDIT VERDICT</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              liveResult.verdict === 'CAP' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}>
                              {liveResult.subclass || 'UNKNOWN PATTERN'}
                            </span>
                          </div>
                          <h3 className={`text-base sm:text-lg font-black tracking-tight font-sans ${
                            liveResult.verdict === 'CAP' ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {liveResult.verdict === 'CAP' ? 'CAP DETECTED · HIGH RISK FRAUD' : 'NO CAP · VERIFIED ORGANIC'}
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-white/10 font-mono text-xs">
                        <span className="text-[#94a3b8] text-[10.5px]">CONFIDENCE:</span>
                        <span className={`font-black text-sm ${liveResult.verdict === 'CAP' ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {Math.round((liveResult.confidence || 0) * 100)}%
                        </span>
                      </div>
                    </div>

                    {liveResult.reasons && liveResult.reasons.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-white/10">
                        {liveResult.reasons.slice(0, 3).map((r, i) => (
                          <div key={i} className="flex items-start gap-2 text-[11.5px] leading-snug font-sans">
                            <span className={`shrink-0 font-bold ${liveResult.verdict === 'CAP' ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {liveResult.verdict === 'CAP' ? '✕' : '✓'}
                            </span>
                            <span className="text-[#e2e8f0]">{r.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any -- liveResult untyped SSE payload, narrowed via ?? fallbacks */}
                  <ScanReport uaim={(liveResult as any).uaim} trades={(liveResult as any).trades ?? []} meta={(liveResult as any).meta ?? { mint: selectedToken.mint, regime: 'REGIME W14' }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Wallet Modal for EVM Connection / Gating */}
      <AnimatePresence>
        {isWalletModalOpen && (
          <WalletModal
            isOpen={isWalletModalOpen}
            onClose={() => setIsWalletModalOpen(false)}
            onConnect={(_wallet, addr) => {
              setUserWallet(addr);
              setIsWalletModalOpen(false);
              fetchGateStatus(addr);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
