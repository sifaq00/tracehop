'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Crosshair, Users, Network, Layers, ShieldAlert, Lock,
  FileCheck, UserCheck, History, Shield,
} from 'lucide-react';
import { gsap } from '@/lib/gsap';

const STEPS = [
  { num: '01', title: 'Deployer Located', icon: Crosshair },
  { num: '02', title: 'First 20 Buyers', icon: Users },
  { num: '03', title: 'Funding Graph', icon: Network },
  { num: '04', title: 'Wallet Clusters', icon: Layers },
  { num: '05', title: 'Risk Patterns', icon: ShieldAlert },
  { num: '06', title: 'LP Lock & Liquidity', icon: Lock },
  { num: '07', title: 'Honeypot Check', icon: FileCheck },
  { num: '08', title: 'Known Entity Match', icon: UserCheck },
  { num: '09', title: 'Similar Token History', icon: History },
  { num: '10', title: 'Verdict Generated', icon: Shield, isHighlight: true },
];

// Sparkle Star Component
function SparkleStar({ x, y, size = 10, delay = 0 }: { x: number; y: number; size?: number; delay?: number }) {
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
        className="drop-shadow-[0_0_6px_rgba(255,179,71,0.8)]"
      />
    </motion.svg>
  );
}

function EngineStepUnit({ step, index }: { step: typeof STEPS[number]; index: number }) {
  const IconComp = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center group shrink-0"
    >
      {/* Top Card Box */}
      <motion.div
        whileHover={{ scale: 1.08, y: -4 }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        className={`relative w-[78px] sm:w-[88px] lg:w-[94px] h-[78px] sm:h-[88px] lg:h-[94px] rounded-2xl flex items-center justify-center border transition-all duration-300 ${
          step.isHighlight
            ? 'bg-gradient-to-b from-[#25150a] via-[#1a0f07] to-[#120a05] border-[#ff7a29] shadow-[0_0_18px_rgba(255,122,41,0.35)]'
            : 'bg-[#0d0926]/90 border-[#261c4a] hover:border-[#9333ea]/70 hover:shadow-[0_0_14px_rgba(147,51,234,0.25)]'
        }`}
      >
        {/* Glow overlay */}
        <div className={`absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 ${
          step.isHighlight
            ? 'bg-[radial-gradient(ellipse_at_center,rgba(255,122,41,0.2)_0%,transparent_70%)]'
            : 'group-hover:bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.18)_0%,transparent_70%)]'
        }`} />

        {/* Animated Icon */}
        <motion.div
          animate={step.isHighlight ? { scale: [1, 1.06, 1] } : undefined}
          transition={step.isHighlight ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : undefined}
          className="relative z-10 flex items-center justify-center"
        >
          {step.isHighlight ? (
            <div className="relative">
              <Shield className="w-8 sm:w-9 h-8 sm:h-9 text-[#ff7a29] stroke-[1.75] drop-shadow-[0_0_8px_rgba(255,122,41,0.6)]" />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#ff7a29]">
                ★
              </span>
            </div>
          ) : (
            <IconComp
              className="w-7 sm:w-8 h-7 sm:h-8 text-[#d8b4fe] group-hover:text-white stroke-[1.65] drop-shadow-[0_0_6px_rgba(192,132,252,0.4)] transition-colors duration-200"
            />
          )}
        </motion.div>
      </motion.div>

      {/* Number Badge */}
      <div className="my-2.5">
        <div
          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold tracking-tight shadow-md border ${
            step.isHighlight
              ? 'bg-[#ff7a29] text-white border-[#ff9e58] shadow-[0_0_8px_rgba(255,122,41,0.5)]'
              : 'bg-gradient-to-b from-[#7c3aed] to-[#4c1d95] text-[#f8fafc] border-[#a855f7]/50 shadow-[0_0_6px_rgba(124,58,237,0.3)]'
          }`}
        >
          {step.num}
        </div>
      </div>

      {/* Step Title */}
      <span
        className={`text-[11px] sm:text-xs text-center leading-snug w-[78px] sm:w-[88px] lg:w-[94px] line-clamp-2 select-none ${
          step.isHighlight
            ? 'font-bold text-white'
            : 'font-medium text-[#cbd5e1] group-hover:text-white transition-colors duration-200'
        }`}
      >
        {step.title}
      </span>
    </motion.div>
  );
}

// Dotted Arrow between Cards
function DottedConnector({ index }: { index: number }) {
  return (
    <div className="flex items-center justify-center w-5 sm:w-6 lg:w-7 shrink-0 -mt-14 select-none pointer-events-none">
      <motion.svg
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.35, delay: index * 0.05 + 0.03 }}
        className="w-full h-4 overflow-visible"
        viewBox="0 0 28 12"
        fill="none"
      >
        {/* Dotted line */}
        <line
          x1="0"
          y1="6"
          x2="22"
          y2="6"
          stroke="#ff7a29"
          strokeWidth="1.5"
          strokeDasharray="2.5 2.5"
          strokeLinecap="round"
          className="opacity-80"
        />
        {/* Arrow head */}
        <path
          d="M20 3L25 6L20 9"
          stroke="#ff7a29"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
      </motion.svg>
    </div>
  );
}

export function Engine() {
  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const barLabelRef = useRef<HTMLSpanElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(flowRef, { once: true, amount: 0.25 });

  // Progress bar GSAP scrub
  useEffect(() => {
    if (!isInView) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          barRef.current,
          { width: '20%' },
          {
            width: '100%',
            ease: 'none',
            duration: 1,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 65%',
              end: 'center 35%',
              scrub: true,
              onUpdate: (self) => {
                if (barLabelRef.current) {
                  barLabelRef.current.textContent = `${Math.round(20 + self.progress * 80)}%`;
                }
              },
            },
          }
        );
      }, sectionRef);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, [isInView]);

  return (
    <section ref={sectionRef} id="engine" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative">

        {/* ================= HEADER ================= */}
        <div className="text-center max-w-2xl mx-auto mb-16 relative z-10">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2.5">
            TRACEHOP ENGINE
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            We <span className="text-[#ff7a29] italic">follow</span> the money.
          </h2>
          <p className="text-[#94a3b8] text-sm sm:text-base leading-relaxed">
            Our engine analyzes 12+ dimensions to deliver one clear verdict.
          </p>
        </div>

        {/* ================= CARDS FLOW WRAPPER WITH ATTACHED RABBIT & TRAIL ================= */}
        <div className="relative mb-14">
          <div ref={flowRef} className="w-full overflow-x-auto pb-6 pt-16 px-2 scrollbar-none">
            <div className="flex items-center justify-start xl:justify-center min-w-max mx-auto gap-0 relative">

              {/* ================= LEAPING RABBIT & LOOPING TRAIL (ATTACHED TO CARD 01) ================= */}
              <div className="relative w-[130px] sm:w-[155px] lg:w-[170px] h-[190px] shrink-0 -mt-14 mr-1 pointer-events-none select-none">
                {/* SVG Looping Trail */}
                <svg
                  className="absolute inset-0 w-full h-full overflow-visible"
                  viewBox="0 0 170 190"
                  fill="none"
                >
                  <defs>
                    <filter id="trailStarGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* Looping dashed trajectory starting behind rabbit, curling into card 01 */}
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.95 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    d="M 28 35 C 68 45, 96 70, 82 112 C 68 145, 22 140, 18 112 C 14 78, 52 145, 92 145 L 160 145"
                    stroke="#ff7a29"
                    strokeWidth="1.8"
                    strokeDasharray="3.5 3.5"
                    strokeLinecap="round"
                  />

                  {/* Entry arrow pointing into Card 01 */}
                  <path
                    d="M 152 140 L 162 145 L 152 150"
                    stroke="#ff7a29"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Sparkling Stars along the trajectory */}
                <SparkleStar x={24} y={30} size={11} delay={0} />
                <SparkleStar x={85} y={65} size={13} delay={0.3} />
                <SparkleStar x={78} y={115} size={10} delay={0.6} />
                <SparkleStar x={16} y={115} size={12} delay={0.9} />
                <SparkleStar x={52} y={142} size={14} delay={0.4} />
                <SparkleStar x={120} y={142} size={10} delay={0.7} />

                {/* Floating Leaping Rabbit positioned at the crest of the loop */}
                <motion.div
                  className="absolute -top-12 left-1 sm:left-4 z-30 pointer-events-auto cursor-pointer"
                  animate={{
                    y: [-4, 4, -4],
                    rotate: [-1, 1.5, -1],
                  }}
                  transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  whileHover={{
                    scale: 1.12,
                    rotate: 4,
                    transition: { duration: 0.2 },
                  }}
                >
                  <img
                    src="/assets/rabbit-leaping.webp"
                    alt="Tracehop Leaping Rabbit Mascot"
                    className="w-20 sm:w-24 lg:w-28 h-auto object-contain drop-shadow-[0_0_16px_rgba(255,122,41,0.45)] drop-shadow-[0_0_28px_rgba(124,58,237,0.35)] select-none"
                  />
                </motion.div>
              </div>

              {/* 10 Step Cards */}
              {STEPS.map((step, idx) => (
                <div key={step.num} className="flex items-center shrink-0">
                  <EngineStepUnit step={step} index={idx} />
                  {idx < STEPS.length - 1 && <DottedConnector index={idx} />}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= LIVE SCAN PROGRESS BAR ================= */}
        <div className="max-w-4xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-[#0d0924]/90 border border-[#261c4a] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs relative z-10">
          <div className="flex items-center gap-3 shrink-0">
            <span className="px-2.5 py-1 rounded bg-[#7c3aed] text-white font-bold text-[10px] uppercase tracking-wider shadow-[0_0_8px_rgba(124,58,237,0.4)]">
              LIVE SCAN
            </span>
            <span className="text-[#cbd5e1] font-medium">Building funding graph...</span>
          </div>

          <div className="w-full sm:w-1/2 flex items-center gap-3">
            <div className="w-full h-1.5 bg-[#1b143f] rounded-full overflow-hidden">
              <div
                ref={barRef}
                style={{ width: '62%' }}
                className="h-full bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#ff7a29] rounded-full shadow-[0_0_8px_rgba(255,122,41,0.4)]"
              />
            </div>
            <span ref={barLabelRef} className="text-white font-bold text-xs shrink-0">62%</span>
          </div>
        </div>

      </div>
    </section>
  );
}

