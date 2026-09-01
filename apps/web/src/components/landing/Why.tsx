'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTelegramPlane } from 'react-icons/fa';
import { AlertTriangle } from 'lucide-react';

// ================= 6 FEATURE CARDS DATA =================
const WHY_CARDS = [
  {
    title: 'Deep Onchain Intelligence',
    desc: 'We analyze beyond the surface.',
    renderIcon: () => (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" />
        <path d="M2 17L12 22L22 17" />
        <path d="M2 12L12 17L22 12" />
        <path d="M12 22V12" />
      </svg>
    ),
  },
  {
    title: 'Real-time Analysis',
    desc: 'Live data. No delays. No old snapshots.',
    renderIcon: () => (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" />
        <circle cx="19" cy="4" r="1.5" fill="#ff7a29" stroke="none" className="animate-pulse" />
      </svg>
    ),
  },
  {
    title: 'Risk First Approach',
    desc: 'We protect you from what others miss.',
    renderIcon: () => (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22S4 18 4 12V5L12 2L20 5V12C20 18 12 22 12 22Z" />
        <path d="M12 8V12" stroke="#ff7a29" />
        <circle cx="12" cy="16" r="1" fill="#ff7a29" stroke="none" />
      </svg>
    ),
  },
  {
    title: 'Clear Verdicts',
    desc: 'Safe, Caution, or Cap. No fluff.',
    renderIcon: () => (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M8 13L10 15L16 9" stroke="#34d399" strokeWidth="1.8" />
        <line x1="9" y1="18" x2="15" y2="18" stroke="#a855f7" />
      </svg>
    ),
  },
  {
    title: 'Developer Friendly',
    desc: 'Powerful API, simple integration.',
    renderIcon: () => (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="14" y1="4" x2="10" y2="20" stroke="#ff7a29" />
      </svg>
    ),
  },
  {
    title: 'Privacy Focused',
    desc: 'You stay anon. We don\'t track you.',
    renderIcon: () => (
      <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="#c084fc" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 10H22" />
        <path d="M5 10L7 4H17L19 10" />
        <circle cx="7.5" cy="15.5" r="2.5" />
        <circle cx="16.5" cy="15.5" r="2.5" />
        <path d="M10 15.5H14" />
      </svg>
    ),
  },
];

// ================= GRAPH NODES & EDGES =================
interface GraphNode {
  id: string;
  type: 'deployer' | 'intermediary' | 'eoa' | 'cex' | 'liquidity';
  label: string;
  address: string;
  role: string;
  balance: string;
  cx: number;
  cy: number;
}

const GRAPH_NODES: GraphNode[] = [
  { id: 'n1', type: 'intermediary', label: 'Relay Alpha', address: '0x8f...11a2', role: 'Sybil Relay', balance: '42.5 SOL', cx: 55, cy: 115 },
  { id: 'n2', type: 'eoa', label: 'Sniper Wallet 1', address: '4vJ9...8Kmn', role: 'First 20 Buyer', balance: '12.0 SOL', cx: 80, cy: 60 },
  { id: 'n3', type: 'eoa', label: 'Sniper Wallet 2', address: '9wQz...2bPx', role: 'First 20 Buyer', balance: '8.4 SOL', cx: 85, cy: 155 },
  { id: 'n4', type: 'intermediary', label: 'Cluster Hub A', address: '7xLm...99pQ', role: 'Sub-Relay', balance: '65.2 SOL', cx: 125, cy: 130 },
  { id: 'n5', type: 'eoa', label: 'Dormant Wallet', address: '1aBc...33dE', role: 'Cluster Member', balance: '5.1 SOL', cx: 110, cy: 185 },

  // Center Deployer
  { id: 'deployer', type: 'deployer', label: 'Origin Deployer Hub', address: '0x38...9f42', role: 'Genesis Funder', balance: '1,420.5 SOL', cx: 175, cy: 115 },

  // Right branch
  { id: 'n6', type: 'intermediary', label: 'Relay Beta', address: '5yTx...88zZ', role: 'Distribution', balance: '110.0 SOL', cx: 220, cy: 75 },
  { id: 'n7', type: 'cex', label: 'Binance Hot 14', address: '0xBi...4444', role: 'CEX Deposit', balance: '2,800.0 SOL', cx: 250, cy: 35 },
  { id: 'n8', type: 'liquidity', label: 'Raydium LP', address: '675k...F78q', role: 'Locked Pool', balance: '850.0 SOL', cx: 295, cy: 55 },
  { id: 'n9', type: 'intermediary', label: 'Cluster Hub B', address: '2zMM...9Bou', role: 'Sybil Pool', balance: '88.0 SOL', cx: 255, cy: 125 },
  { id: 'n10', type: 'eoa', label: 'Dev Multi-sig', address: '3kFw...11aa', role: 'Dev Hold', balance: '18.4 SOL', cx: 295, cy: 110 },
  { id: 'n11', type: 'intermediary', label: 'Relay Gamma', address: '8bNm...3qWe', role: 'Intermediary', balance: '50.0 SOL', cx: 225, cy: 165 },
  { id: 'n12', type: 'eoa', label: 'Dump Target', address: '1xRUG...DEAD', role: 'Mixer Outflow', balance: '280.0 SOL', cx: 225, cy: 215 },
  { id: 'n13', type: 'eoa', label: 'Wash Trader', address: '7qQq...22vv', role: 'Volume Bot', balance: '15.3 SOL', cx: 255, cy: 185 },
  { id: 'n14', type: 'eoa', label: 'Retail Buyer', address: '9pLm...88xx', role: 'Verified EOA', balance: '2.5 SOL', cx: 285, cy: 190 },
];

const GRAPH_EDGES = [
  { from: 'n1', to: 'n2' },
  { from: 'n1', to: 'n3' },
  { from: 'n2', to: 'n4' },
  { from: 'n3', to: 'n4' },
  { from: 'n4', to: 'n5' },
  { from: 'n4', to: 'deployer' },
  { from: 'n2', to: 'deployer' },
  { from: 'deployer', to: 'n6' },
  { from: 'n6', to: 'n7' },
  { from: 'n7', to: 'n8' },
  { from: 'n6', to: 'n9' },
  { from: 'n9', to: 'n10' },
  { from: 'deployer', to: 'n11' },
  { from: 'n11', to: 'n9' },
  { from: 'n11', to: 'n12' },
  { from: 'n11', to: 'n13' },
  { from: 'n13', to: 'n14' },
  { from: 'n9', to: 'n14' },
];

function SparkleStar({ x, y, size = 11, delay = 0 }: { x: number; y: number; size?: number; delay?: number }) {
  return (
    <motion.svg
      className="absolute pointer-events-none overflow-visible"
      style={{ left: x, top: y, width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
      initial={{ scale: 0.6, opacity: 0.3 }}
      animate={{
        scale: [0.6, 1.25, 0.6],
        opacity: [0.3, 1, 0.3],
        rotate: [0, 90, 180],
      }}
      transition={{
        duration: 2.2,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    >
      <path
        d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z"
        fill="#ffb347"
        className="drop-shadow-[0_0_6px_rgba(255,179,71,0.85)]"
      />
    </motion.svg>
  );
}

export function Why() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  const handleSpotlight = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <section id="why" ref={sectionRef} className="relative py-20 sm:py-28 overflow-hidden">
      {/* Anchor for nav #features */}
      <div id="features" className="absolute top-1/2" />

      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative">

        {/* ================= HEADER ================= */}
        <div className="text-center max-w-2xl mx-auto mb-14 relative z-10">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2.5">
            WHY TRACEHOP
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            Built to remove the <span className="text-[#c084fc] italic">guesswork.</span>
          </h2>
        </div>

        {/* ================= TOP: 6 CONNECTED FEATURE CARDS & LEAPING RABBIT ================= */}
        <div className="relative mb-14">

          {/* Waving Dotted Line behind Cards + Looping Trail at top right */}
          <div className="hidden lg:block absolute inset-0 pointer-events-none select-none z-0">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 1200 220"
              preserveAspectRatio="none"
              fill="none"
            >
              {/* Sinusoidal Wave through the 6 cards and looping UP at the right edge */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.85 }}
                viewport={{ once: true }}
                transition={{ duration: 2, ease: 'easeInOut' }}
                d="M 50 110 C 120 70, 200 150, 280 110 C 360 70, 440 150, 520 110 C 600 70, 680 150, 760 110 C 840 70, 920 150, 1000 110 C 1060 80, 1100 40, 1140 10 C 1170 -20, 1190 -50, 1180 -70 C 1170 -90, 1140 -80, 1130 -60 C 1120 -30, 1160 0, 1200 -20"
                stroke="#ff7a29"
                strokeWidth="1.6"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Floating Leaping Rabbit at Top-Right Corner */}
          <div className="hidden lg:block absolute -top-24 right-0 z-30 pointer-events-none">
            {/* Sparkles around rabbit */}
            <SparkleStar x={-30} y={40} size={12} delay={0} />
            <SparkleStar x={20} y={0} size={14} delay={0.4} />
            <SparkleStar x={70} y={60} size={10} delay={0.8} />

            <motion.div
              className="pointer-events-auto cursor-pointer"
              animate={{
                y: [-4, 4, -4],
                rotate: [-1, 2, -1],
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{
                scale: 1.12,
                rotate: 5,
                transition: { duration: 0.2 },
              }}
            >
              <img
                src="/assets/rabbit-leaping.webp"
                alt="Tracehop Mascot"
                className="w-24 lg:w-28 h-auto object-contain drop-shadow-[0_0_16px_rgba(255,122,41,0.45)] drop-shadow-[0_0_28px_rgba(124,58,237,0.35)] select-none"
              />
            </motion.div>
          </div>

          {/* 6 Feature Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 relative z-10">
            {WHY_CARDS.map((card, idx) => {
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ scale: 1.04, y: -4 }}
                  onMouseMove={handleSpotlight}
                  className="spotlight-card relative p-5 rounded-2xl bg-[#0d0924]/90 border border-[#261c4a] hover:border-[#9333ea]/60 shadow-xl flex flex-col items-center text-center justify-between min-h-[195px] transition-all duration-200 group"
                >
                  {/* Icon Area with Glow */}
                  <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/25 flex items-center justify-center mb-3 group-hover:bg-[#7c3aed]/20 group-hover:border-[#a855f7]/50 transition-all shadow-[0_0_12px_rgba(124,58,237,0.2)]">
                    {card.renderIcon()}
                  </div>

                  {/* Text Content */}
                  <div>
                    <h4 className="font-display font-bold text-xs sm:text-sm text-white mb-1.5 leading-snug">
                      {card.title}
                    </h4>
                    <p className="text-[11px] text-[#94a3b8] leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ================= BOTTOM: 2 BIG FEATURE CARDS ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch relative z-10">

          {/* LEFT: TELEGRAM INTEGRATION WITH REALISTIC SMARTPHONE MOCKUP */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#0c0822]/90 border border-[#261c4a] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#7c3aed]/40 transition-colors"
          >
            {/* Left Copy & CTA */}
            <div className="flex-1 flex flex-col justify-between self-stretch">
              <div>
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2.5">
                  TELEGRAM INTEGRATION
                </div>
                <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-2.5">
                  Scan <span className="italic text-[#38bdf8]">anywhere</span>, anytime.
                </h3>
                <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed mb-6">
                  Drop a token in Telegram. Tracehop does the rest.
                </p>
              </div>

              <a
                href="https://t.me/TraceHopAgentBot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 h-11 px-5 rounded-xl bg-[#120d2b] hover:bg-[#7c3aed] text-white font-bold text-xs uppercase tracking-wider border border-[#7c3aed]/50 shadow-[0_0_12px_rgba(124,58,237,0.3)] transition-all w-fit"
              >
                <FaTelegramPlane className="w-4 h-4 text-[#2AABEE]" />
                <span>OPEN TELEGRAM BOT</span>
              </a>
            </div>

            {/* Right: Realistic iPhone 15 Pro Device Frame Mockup */}
            <div className="w-[250px] sm:w-[275px] shrink-0 relative select-none">
              {/* Outer Shadow & Titanium Shell */}
              <div className="relative mx-auto rounded-[44px] p-[3px] bg-gradient-to-b from-[#4a3b75] via-[#231b47] to-[#120d2b] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_20px_rgba(124,58,237,0.25)] ring-1 ring-white/15">
                
                {/* Hardware Volume & Action Buttons on Left */}
                <div className="absolute -left-[5px] top-[70px] w-[3px] h-[22px] bg-[#4a3b75] rounded-l-md" />
                <div className="absolute -left-[5px] top-[102px] w-[3px] h-[34px] bg-[#4a3b75] rounded-l-md" />
                <div className="absolute -left-[5px] top-[144px] w-[3px] h-[34px] bg-[#4a3b75] rounded-l-md" />
                
                {/* Hardware Power Button on Right */}
                <div className="absolute -right-[5px] top-[95px] w-[3px] h-[48px] bg-[#4a3b75] rounded-r-md" />

                {/* Inner Bezel Border */}
                <div className="rounded-[41px] p-[6px] bg-[#070514] border border-[#1b143a]">
                  
                  {/* Screen Container */}
                  <div className="relative rounded-[35px] bg-[#090618] border border-white/5 p-3.5 font-sans overflow-hidden text-white shadow-inner">
                    
                    {/* Glass Specular Glare Reflection Overlay */}
                    <div className="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-bl from-white/[0.06] via-transparent to-transparent pointer-events-none rounded-tr-[35px]" />

                    {/* Top Status Bar with Dynamic Island */}
                    <div className="relative z-10 flex items-center justify-between text-[9px] text-[#94a3b8] px-1 mb-2">
                      <span className="font-bold text-white tracking-tight">9:41</span>
                      
                      {/* Dynamic Island with Camera Lens */}
                      <div className="w-[72px] h-[14px] bg-black rounded-full mx-auto flex items-center justify-end px-1.5 border border-white/10 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-[#0a0a20] border border-blue-950/80 flex items-center justify-center">
                          <div className="w-1 h-1 rounded-full bg-[#1e293b]" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 text-[8px]">
                        <span>5G</span>
                        <div className="w-3 h-1.5 border border-white/70 rounded-xs p-[1px] flex items-center">
                          <div className="w-1.5 h-full bg-white rounded-2xs" />
                        </div>
                      </div>
                    </div>

                    {/* Telegram Bot Header */}
                    <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-[#a855f7] font-bold">&lt;</span>
                        <div>
                          <div className="text-[11px] font-bold leading-none">Tracehop Bot</div>
                          <div className="text-[8px] text-emerald-400 font-mono">bot (online)</div>
                        </div>
                      </div>
                    </div>

                    {/* User Command Bubble */}
                    <div className="relative z-10 flex justify-end mb-2">
                      <div className="px-2.5 py-1 rounded-xl rounded-br-xs bg-[#2563eb] text-white text-[10px] font-mono shadow-sm">
                        /scan So111...1112
                      </div>
                    </div>

                    {/* Bot Response Bubble Card */}
                    <div className="relative z-10 p-2.5 rounded-2xl rounded-tl-xs bg-[#130e2e]/95 border border-[#2e215c] text-[10px] font-mono shadow-md">
                      <div className="text-[#a855f7] font-bold text-[10px] mb-1.5 flex items-center justify-between">
                        <span>Analyzing token:</span>
                        <span className="text-white">So111...1112</span>
                      </div>

                      {/* Step Checklist */}
                      <div className="space-y-1 my-1.5 text-[9px] text-[#cbd5e1]">
                        {[
                          'Deployer Located',
                          'Funding Graph',
                          'Risk Patterns',
                          'LP Lock Check',
                          'Honeypot Check',
                          'Known Entity Match',
                          'Verdict',
                        ].map((item) => (
                          <div key={item} className="flex items-center justify-between">
                            <span>{item}</span>
                            <span className="text-emerald-400 font-bold text-[10px]">✓</span>
                          </div>
                        ))}
                      </div>

                      {/* Caution Badge */}
                      <div className="mt-2 p-1.5 rounded-xl bg-[#2a1708] border border-[#ff7a29]/40 text-[#ffb347]">
                        <div className="flex items-center gap-1 font-bold text-[9px] text-[#ff7a29] uppercase">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span>CAUTION</span>
                        </div>
                        <p className="text-[8px] text-[#fde047]/90 leading-tight mt-0.5">
                          High cluster concentration &amp; dev wallet activity.
                        </p>
                      </div>

                      <span className="text-[8px] text-[#64748b] block text-right mt-1">12:30</span>
                    </div>

                    {/* Bottom iOS Home Indicator Bar */}
                    <div className="w-20 h-1 bg-white/30 rounded-full mx-auto mt-2 relative z-10" />

                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: FUNDING GRAPH PREVIEW WITH INTERACTIVE CANVAS GRAPH */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#0c0822]/90 border border-[#261c4a] shadow-2xl flex flex-col justify-between hover:border-[#7c3aed]/40 transition-colors"
          >
            {/* Header */}
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2.5">
                FUNDING GRAPH PREVIEW
              </div>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-4">
                We map the flow. You see the <span className="italic text-[#ff7a29]">truth.</span>
              </h3>
            </div>

            {/* Graph Visual Area with Interactive SVG */}
            <div className="relative w-full h-[240px] sm:h-[260px] rounded-2xl bg-[#080518] border border-[#241a4a] overflow-hidden flex items-center justify-center my-3 shadow-inner">
              {/* Grid backdrop */}
              <div className="absolute inset-0 bg-[radial-gradient(#2c2054_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 350 250">
                <defs>
                  <radialGradient id="deployerGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ff7a29" stopOpacity="0.8" />
                    <stop offset="60%" stopColor="#ff7a29" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ff7a29" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Edges with Animated Flowing Dashes */}
                {GRAPH_EDGES.map((edge, i) => {
                  const src = GRAPH_NODES.find((n) => n.id === edge.from)!;
                  const dst = GRAPH_NODES.find((n) => n.id === edge.to)!;
                  return (
                    <g key={i}>
                      <line
                        x1={src.cx}
                        y1={src.cy}
                        x2={dst.cx}
                        y2={dst.cy}
                        stroke="#6b21a8"
                        strokeWidth="1.2"
                        strokeOpacity="0.5"
                      />
                      {/* Flowing particle along line */}
                      <motion.circle
                        r="1.4"
                        fill="#ff7a29"
                        animate={{
                          cx: [src.cx, dst.cx],
                          cy: [src.cy, dst.cy],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2.4,
                          repeat: Infinity,
                          delay: (i * 0.18) % 2.4,
                          ease: 'easeInOut',
                        }}
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {GRAPH_NODES.map((node) => {
                  const isDeployer = node.type === 'deployer';
                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredNode(node)}
                      onMouseLeave={() => setHoveredNode(null)}
                    >
                      {/* Radiating radar wave for deployer */}
                      {isDeployer && (
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="18"
                          fill="url(#deployerGlow)"
                          className="animate-ping opacity-60"
                        />
                      )}

                      {/* Node Shapes based on type */}
                      {node.type === 'deployer' && (
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="8"
                          fill="#ff7a29"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="drop-shadow-[0_0_8px_#ff7a29]"
                        />
                      )}

                      {node.type === 'intermediary' && (
                        <rect
                          x={node.cx - 5}
                          y={node.cy - 5}
                          width="10"
                          height="10"
                          rx="2.5"
                          fill="#a855f7"
                          stroke="#c084fc"
                          strokeWidth="1"
                          className="drop-shadow-[0_0_5px_#a855f7]"
                        />
                      )}

                      {node.type === 'eoa' && (
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="4.5"
                          fill="#ffffff"
                          stroke="#a855f7"
                          strokeWidth="1"
                          className="drop-shadow-[0_0_4px_rgba(255,255,255,0.7)]"
                        />
                      )}

                      {node.type === 'cex' && (
                        <rect
                          x={node.cx - 4.5}
                          y={node.cy - 4.5}
                          width="9"
                          height="9"
                          transform={`rotate(45 ${node.cx} ${node.cy})`}
                          fill="#38bdf8"
                          stroke="#ffffff"
                          strokeWidth="1"
                          className="drop-shadow-[0_0_6px_#38bdf8]"
                        />
                      )}

                      {node.type === 'liquidity' && (
                        <circle
                          cx={node.cx}
                          cy={node.cy}
                          r="5"
                          fill="#06b6d4"
                          stroke="#38bdf8"
                          strokeWidth="1"
                          className="drop-shadow-[0_0_6px_#06b6d4]"
                        />
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Hover Tooltip Overlay */}
              <AnimatePresence>
                {hoveredNode && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute top-2 left-2 z-30 p-2.5 rounded-xl bg-[#140e33]/95 border border-[#7c3aed] text-[10px] font-mono text-white shadow-2xl backdrop-blur-md pointer-events-none"
                  >
                    <div className="font-bold text-[#ff7a29]">{hoveredNode.label}</div>
                    <div className="text-[#94a3b8]">{hoveredNode.address}</div>
                    <div className="text-emerald-400 mt-1">Role: {hoveredNode.role}</div>
                    <div className="text-white">Balance: {hoveredNode.balance}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Graph Legend (Matching Screenshot) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 pt-2 border-t border-[#241a4a] text-[11px] font-mono text-[#94a3b8]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a29] shadow-[0_0_4px_#ff7a29]" />
                <span>Deployer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#a855f7] shadow-[0_0_4px_#a855f7]" />
                <span>Intermediary</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white border border-purple-400" />
                <span>EOA Wallet</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rotate-45 bg-[#38bdf8] shadow-[0_0_4px_#38bdf8]" />
                <span>Exchange / CEX</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4] shadow-[0_0_4px_#06b6d4]" />
                <span>Liquidity</span>
              </div>
              <div className="flex items-center gap-2 text-[#ff7a29]">
                <span>--&gt;</span>
                <span>Flow Direction</span>
              </div>
            </div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
