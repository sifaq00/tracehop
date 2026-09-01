'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Crosshair, Users, Network, Layers, ShieldAlert, Lock,
  FileCheck, UserCheck, History, ShieldCheck, ArrowRight,
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
  { num: '10', title: 'Verdict Generated', icon: ShieldCheck, isHighlight: true },
];

function EngineCard({ step, index }: { step: typeof STEPS[number]; index: number }) {
  const IconComp = step.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.06, y: -4 }}
      className={`relative p-3 sm:p-3.5 rounded-xl flex flex-col items-center text-center justify-between min-h-[130px] w-[110px] sm:w-[120px] border transition-colors ${
        step.isHighlight
          ? 'bg-gradient-to-b from-[#2a1a0f] to-[#1a100a] border-[#ff7a29] shadow-[0_0_8px_rgba(255,122,41,0.2)]'
          : 'bg-[#0f0b24]/90 border-[#2c2054] hover:border-[#7c3aed]/50'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${
        step.isHighlight ? 'bg-[#ff7a29]/15' : 'bg-white/5'
      }`}>
        <IconComp className={`w-4 h-4 ${step.isHighlight ? 'text-[#ff7a29]' : 'text-[#c4b5fd]'}`} />
      </div>
      <span className="text-[11px] font-bold text-white leading-snug line-clamp-2">
        {step.title}
      </span>
      <span className={`text-[10px] font-mono font-bold mt-2 ${step.isHighlight ? 'text-[#ff7a29]' : 'text-[#64748b]'}`}>
        {step.num}
      </span>
    </motion.div>
  );
}

function EngineArrow({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -4 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.3, delay: index * 0.06 + 0.04, ease: 'easeOut' }}
      className="flex items-center justify-center w-5 sm:w-7 shrink-0"
    >
      <ArrowRight className="w-3 h-3 text-[#7c3aed]/60" />
    </motion.div>
  );
}

export function Engine() {
  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const barLabelRef = useRef<HTMLSpanElement>(null);
  const flowRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(flowRef, { once: true, amount: 0.3 });

  // Progress bar GSAP scrub (only reliable GSAP use case)
  useEffect(() => {
    if (!isInView) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.fromTo(barRef.current, { width: '20%' }, {
          width: '100%', ease: 'none', duration: 1,
          scrollTrigger: {
            trigger: sectionRef.current, start: 'top 60%', end: 'center 40%', scrub: true,
            onUpdate: (self) => {
              if (barLabelRef.current) {
                barLabelRef.current.textContent = `${Math.round(20 + self.progress * 80)}%`;
              }
            },
          },
        });
      }, sectionRef);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, [isInView]);

  return (
    <section ref={sectionRef} id="engine" className="relative py-20 sm:py-28">
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 relative">
        {/* Rabbit mascot */}
        <div className="relative mb-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3"
          >
            <img
              src="/assets/rabbit-minimal.webp"
              alt="Tracehop Mascot"
              className="w-11 h-11 object-contain drop-shadow-[0_0_8px_rgba(255,122,41,0.3)]"
            />
            <svg className="w-28 h-6 overflow-visible pointer-events-none hidden sm:block" viewBox="0 0 100 24" fill="none">
              <path d="M5 18 C30 2, 70 24, 95 6" stroke="#ff7a29" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" />
              <circle cx="95" cy="6" r="2" fill="#ff7a29" className="animate-pulse" />
            </svg>
          </motion.div>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#ff7a29] mb-2.5">
            TRACEHOP ENGINE
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            We <span className="text-[#ff7a29] italic">follow</span> the money.
          </h2>
          <p className="text-[#94a3b8] text-sm sm:text-base leading-relaxed">
            Our engine analyzes 12+ dimensions to deliver one clear verdict.
          </p>
        </div>

        {/* Flow: Cards + Arrows — py-4 gives room for hover scale */}
        <div ref={flowRef} className="flex items-center justify-center py-4 px-2 mb-10">
          <div className="flex items-center overflow-x-auto gap-0 scrollbar-none">
            {STEPS.map((step, idx) => (
              <div key={idx} className="flex items-center shrink-0">
                <EngineCard step={step} index={idx} />
                {idx < STEPS.length - 1 && <EngineArrow index={idx} />}
              </div>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto p-3.5 sm:p-4 rounded-2xl bg-[#0e0a22]/90 border border-[#2c2054] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
          <div className="flex items-center gap-3 shrink-0">
            <span className="px-2.5 py-1 rounded bg-[#7c3aed] text-white font-bold text-[10px] uppercase tracking-wider">
              LIVE SCAN
            </span>
            <span className="text-[#cbd5e1]">Building funding graph...</span>
          </div>

          <div className="w-full sm:w-1/2 flex items-center gap-3">
            <div className="w-full h-1.5 bg-[#1b143f] rounded-full overflow-hidden">
              <div
                ref={barRef}
                style={{ width: '62%' }}
                className="h-full bg-gradient-to-r from-[#7c3aed] to-[#ff7a29] rounded-full"
              />
            </div>
            <span ref={barLabelRef} className="text-white font-bold text-xs shrink-0">62%</span>
          </div>
        </div>
      </div>
    </section>
  );
}
