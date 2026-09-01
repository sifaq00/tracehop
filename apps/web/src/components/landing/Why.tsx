'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Box, Activity, ShieldCheck, FileText, Code2, EyeOff } from 'lucide-react';

const CARDS = [
  { title: 'Deep Onchain Intelligence', desc: 'We analyze beyond the surface.', icon: Box },
  { title: 'Real-time Analysis', desc: 'Live data. No delays. No old snapshots.', icon: Activity },
  { title: 'Risk First Approach', desc: 'We protect you from what others miss.', icon: ShieldCheck },
  { title: 'Clear Verdicts', desc: 'Safe, Caution, or Cap. No fluff.', icon: FileText },
  { title: 'Developer Friendly', desc: 'Powerful API, simple integration.', icon: Code2 },
  { title: 'Privacy Focused', desc: "You stay anon. We don't track you.", icon: EyeOff },
];

export function Why() {
  const sectionRef = useRef<HTMLElement>(null);

  const handleSpotlight = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    // ================= SECTION 4: WHY TRACEHOP (BUILT TO REMOVE THE GUESSWORK.) =================
    <section id="why" ref={sectionRef} className="relative py-20 sm:py-28 overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 relative">
        {/* Top Right Leaping Rabbit Mascot with Dotted Trail */}
        <div className="flex justify-end mb-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3"
          >
            <svg className="w-28 h-6 overflow-visible pointer-events-none hidden sm:block" viewBox="0 0 100 24" fill="none">
              <path d="M5 6 C30 24, 70 2, 95 18" stroke="#ff7a29" strokeWidth="1.5" strokeDasharray="3 3" strokeLinecap="round" />
              <circle cx="5" cy="6" r="2" fill="#ff7a29" className="animate-pulse" />
            </svg>
            <img
              src="/assets/rabbit-minimal.webp"
              alt="Tracehop Mascot"
              className="w-11 h-11 object-contain drop-shadow-[0_0_8px_rgba(124,58,237,0.3)]"
            />
          </motion.div>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2.5">
            WHY TRACEHOP
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            Built to remove the <span className="text-[#a855f7] italic">guesswork.</span>
          </h2>
        </div>

        {/* 6 Connected Feature Cards */}
        <div data-why-grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4 relative">
          {CARDS.map((card, idx) => {
            const CardIcon = card.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.04, y: -3 }}
                onMouseMove={handleSpotlight}
                className="spotlight-card p-5 rounded-2xl bg-[#0e0a22]/90 border border-[#2c2054] hover:border-[#7c3aed]/60 shadow-lg flex flex-col items-start justify-between min-h-[175px] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/15 border border-[#7c3aed]/30 flex items-center justify-center text-[#c4b5fd] mb-3.5">
                  <CardIcon className="w-5 h-5 text-[#a855f7]" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white mb-1.5 leading-snug">
                    {card.title}
                  </h4>
                  <p className="text-xs text-[#94a3b8] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
