'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw } from 'lucide-react';
import { PRESET_TOKENS } from '@/lib/landing';
import type { PresetToken } from '@/lib/landing';

interface DemoProps {
  registerScanner: (fn: (token?: PresetToken) => void) => void;
}

const SCAN_LINES = [
  '> Initializing multi-chain tracer...',
  '> Connecting to Solana RPC cluster...',
  '> Resolving deployer wallet...',
  '> Mapping token holders...',
  '> Analyzing funding graph...',
  '> Checking LP lock status...',
  '> Scanning for honeypot patterns...',
  '> Cross-referencing known entities...',
  '> Evaluating risk patterns...',
  '> Generating verdict...',
];

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
  // ponytail: hasil real dari API, bukan kalengan preset
  const [liveResult, setLiveResult] = useState<{ verdict: string; confidence: number; subclass: string; reasons: { code: string; text: string }[] } | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [doneStages, setDoneStages] = useState<string[]>([]);
  const [activeStage, setActiveStage] = useState<string | null>(null);

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

    // Wallet wajib (gating server), baca dari koneksi Navbar
    const userWallet = typeof window !== 'undefined' ? localStorage.getItem('tracehop-wallet-connected') : null;

    setSelectedToken(targetToken);
    setInputMint(mint);
    setHasScanned(true);
    setIsScanning(true);
    setScanProgress(5);
    setVisibleLogs([]);
    setShowVerdict(false);
    setLiveResult(null);
    setScanError(null);
    setDoneStages([]);
    setActiveStage(null);

    if (!userWallet) {
      setIsScanning(false);
      setScanError('Connect a wallet via the Connect Wallet button above, then hit RUN SCAN again.');
      return;
    }

    // Animasi log sambil tunggu event SSE pertama
    let step = 0;
    const interval = setInterval(() => {
      if (step < 3) {
        const nextLog = SCAN_LINES[step];
        if (nextLog) setVisibleLogs((prev) => [...prev, nextLog]);
        step++;
      }
    }, 500);

    try {
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 65000);
      // SSE stream: progress nyata dari engine, bukan timer
      const res = await fetch(`/api/v1/scan?mint=${encodeURIComponent(mint)}&userWallet=${encodeURIComponent(userWallet)}&stream=true`, { signal: ctrl.signal });
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
              setVisibleLogs((prev) => [...prev, `> ${data.step}... ${pct}%`]);
              // Tahap turunan dari event nyata
              if (data.step === 'buyers') { markStage('history'); markStage('known'); }
              if (data.step === 'clustering') { markStage('clusters'); markStage('bundle'); }
              if (data.step === 'scoring') { markStage('similarity'); }
            }
          } else if (ev === 'cluster') {
            markStage('bundle');
            setVisibleLogs((prev) => [...prev, `> cluster C114: ${data.wallets} wallets share parent`]);
          } else if (ev === 'verdict') {
            clearTimeout(timeout);
            clearInterval(interval);
            markStage('verdict');
            setLiveResult(data);
            setScanProgress(100);
            setVisibleLogs((prev) => [...prev, `> Verdict: ${data.verdict} (${Math.round((data.confidence || 0) * 100)}%)`]);
            setIsScanning(false);
            setShowVerdict(true);
            finished = true;
            break;
          } else if (ev === 'error') {
            throw new Error(data.message || data.error || 'Scan failed');
          }
        }
      }
      clearTimeout(timeout);
      clearInterval(interval);
      if (!finished && !liveResult) {
        setIsScanning(false);
        setScanError('Stream closed before verdict. Try again or pick a quieter mint.');
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsScanning(false);
      setScanError(err?.name === 'AbortError'
        ? 'Scan timed out (>60s). High-volume mints (e.g. BONK) are too heavy — paste a fresh, quiet pump.fun mint instead.'
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
              Paste a mint address. Tracehop will reveal what others try to hide. Connect a wallet first — first 3 scans are free.
            </p>

            {/* Search Input Bar */}
            <div className="w-full mb-4.5">
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
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#94a3b8] mb-1.5">
                    <span>Tracing funding graph...</span>
                    <span className="text-[#7c3aed] font-bold">{scanProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-[#1b143f] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: scanProgress / 100 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      style={{ transformOrigin: 'left' }}
                      className="h-full w-full bg-gradient-to-r from-[#7c3aed] to-[#ff7a29] rounded-full"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terminal Card */}
            <AnimatePresence>
              {hasScanned && (
                <motion.div
                  ref={terminalRef}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full max-w-2xl mt-4 rounded-2xl bg-[#0a0718] border border-[#2c2054] p-4 sm:p-5 shadow-2xl font-mono text-xs overflow-hidden max-h-[320px] overflow-y-auto"
                >
                  {/* Terminal header */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#2c2054]">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'animate-pulse' : ''} ${liveResult ? (liveResult.verdict === 'CAP' ? 'bg-rose-400' : 'bg-emerald-400') : selectedToken.type === 'SAFE' ? 'bg-emerald-400' : selectedToken.type === 'WARN' ? 'bg-amber-400' : 'bg-rose-400'}`} />
                      <span className="font-bold text-white uppercase">{selectedToken.name} ({selectedToken.ticker})</span>
                    </div>
                    {showVerdict && liveResult && (
                      <motion.span
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          liveResult.verdict === 'CAP'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {liveResult.verdict} · {Math.round((liveResult.confidence || 0) * 100)}/100
                      </motion.span>
                    )}
                  </div>

                  {/* Summary */}
                  {showVerdict && liveResult && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mb-3 space-y-1.5"
                    >
                      <p className="text-[#cbd5e1] text-[11px] leading-relaxed">
                        Pattern: <span className="text-white font-semibold">{liveResult.subclass}</span>
                      </p>
                      {liveResult.reasons.slice(0, 3).map((r, i) => (
                        <p key={i} className="text-[#94a3b8] text-[11px] leading-relaxed">• {r.text}</p>
                      ))}
                    </motion.div>
                  )}

                  {/* Error */}
                  {!isScanning && scanError && (
                    <p className="text-rose-300 text-[11px] leading-relaxed mb-3">⚠️ {scanError}</p>
                  )}

                  {/* Streaming logs */}
                  <div className="space-y-1.5 text-[11px] text-[#94a3b8]">
                    {visibleLogs.map((log, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-start gap-2"
                      >
                        <span className="text-[#7c3aed] shrink-0">&gt;</span>
                        <span className={idx === visibleLogs.length - 1 && isScanning ? 'text-[#c4b5fd]' : ''}>
                          {log}
                          {idx === visibleLogs.length - 1 && isScanning && (
                            <span className="inline-block w-1.5 h-3 bg-[#7c3aed] ml-0.5 animate-pulse" />
                          )}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
