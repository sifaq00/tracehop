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

function EngineStepUnit({
  step,
  index,
  isLast,
}: {
  step: typeof STEPS[number];
  index: number;
  isLast: boolean;
}) {
  const IconComp = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.45, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start shrink-0"
    >
      {/* Step Column: Card Box + Badge + Title */}
      <div className="w-[78px] sm:w-[86px] lg:w-[90px] flex flex-col items-center group shrink-0">
        {/* Top Card Box */}
        <motion.div
          whileHover={{ scale: 1.08, y: -4 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className={`relative w-[78px] sm:w-[86px] lg:w-[90px] h-[78px] sm:h-[86px] lg:h-[90px] shrink-0 aspect-square rounded-2xl flex items-center justify-center border transition-all duration-300 ${
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
        <div className="my-2.5 shrink-0">
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
        <div className="h-9 sm:h-10 flex items-start justify-center text-center w-full">
          <span
            className={`text-[11px] sm:text-xs text-center leading-tight line-clamp-2 select-none ${
              step.isHighlight
                ? 'font-bold text-white'
                : 'font-medium text-[#cbd5e1] group-hover:text-white transition-colors duration-200'
            }`}
          >
            {step.title}
          </span>
        </div>
      </div>

      {/* Dotted Arrow Connector - Centered strictly to the Card Box height */}
      {!isLast && (
        <div className="h-[78px] sm:h-[86px] lg:h-[90px] w-4 sm:w-5 lg:w-6 flex items-center justify-center shrink-0 select-none pointer-events-none">
          <motion.svg
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.35, delay: index * 0.05 + 0.03 }}
            className="w-full h-4 overflow-visible"
            viewBox="0 0 24 12"
            fill="none"
          >
            <line
              x1="0"
              y1="6"
              x2="18"
              y2="6"
              stroke="#ff7a29"
              strokeWidth="1.5"
              strokeDasharray="2.5 2.5"
              strokeLinecap="round"
              className="opacity-80"
            />
            <path
              d="M16 3L21 6L16 9"
              stroke="#ff7a29"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90"
            />
          </motion.svg>
        </div>
      )}
    </motion.div>
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

        {/* ================= CARDS FLOW WRAPPER WITH FLOATING RABBIT & TRAIL ================= */}
        <div className="relative mb-14">

          {/* Independent Floating Leaping Rabbit & Sparkle Trail */}
          <div className="hidden lg:block absolute -top-28 left-0 pointer-events-none z-30 w-72 h-44">
            {/* Curved Dotted Trail SVG */}
            <svg
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
              viewBox="0 0 280 180"
              fill="none"
            >
              <defs>
                <filter id="engineStarGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Looping trajectory behind the rabbit connecting to Card 01 */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                d="M 12 110 C 10 70, 48 30, 85 42 C 120 54, 88 128, 48 118 C 24 112, 18 84, 52 70 C 95 52, 138 98, 160 148 C 172 174, 186 195, 204 202"
                stroke="#ff7a29"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />

              {/* Connecting entry arrow pointing to card 01 */}
              <path
                d="M 198 198 L 208 202 L 202 208"
                stroke="#ff7a29"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Twinkling Sparkles along trail */}
            <SparkleStar x={20} y={90} size={11} delay={0} />
            <SparkleStar x={56} y={34} size={13} delay={0.4} />
            <SparkleStar x={88} y={115} size={10} delay={0.8} />
            <SparkleStar x={126} y={78} size={14} delay={0.2} />
            <SparkleStar x={165} y={150} size={12} delay={0.6} />

            {/* The Floating Leaping Rabbit */}
            <motion.div
              className="absolute left-10 top-0 select-none cursor-pointer pointer-events-auto"
              animate={{
                y: [-5, 5, -5],
                rotate: [-1, 2, -1],
              }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{
                scale: 1.1,
                rotate: 5,
                transition: { duration: 0.25 },
              }}
            >
              <img
                src="/assets/rabbit-leaping.webp"
                alt="Tracehop Leaping Rabbit Mascot"
                className="w-24 h-auto object-contain drop-shadow-[0_0_16px_rgba(255,122,41,0.4)] drop-shadow-[0_0_30px_rgba(124,58,237,0.3)] select-none"
              />
            </motion.div>
          </div>

          {/* Cards Pipeline: 10 connected steps */}
          <div ref={flowRef} className="w-full overflow-x-auto pb-4 pt-6 px-2 scrollbar-none">
            <div className="flex items-start justify-start lg:justify-center min-w-max mx-auto gap-0">
              {/* Entry arrow from rabbit trail on larger screens */}
              <div className="hidden lg:flex items-center h-[78px] sm:h-[86px] lg:h-[90px] mr-1.5 opacity-80 shrink-0 select-none pointer-events-none">
                <motion.svg
                  initial={{ opacity: 0, x: -6 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="w-5 h-4 overflow-visible"
                  viewBox="0 0 20 12"
                  fill="none"
                >
                  <line x1="0" y1="6" x2="16" y2="6" stroke="#ff7a29" strokeWidth="1.5" strokeDasharray="2.5 2.5" strokeLinecap="round" />
                  <path d="M14 3L18 6L14 9" stroke="#ff7a29" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </motion.svg>
              </div>

              {STEPS.map((step, idx) => (
                <EngineStepUnit
                  key={step.num}
                  step={step}
                  index={idx}
                  isLast={idx === STEPS.length - 1}
                />
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

