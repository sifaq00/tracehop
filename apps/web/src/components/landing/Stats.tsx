'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from '@/lib/gsap';

const STATS = [
  { value: 12842, suffix: '+', decimals: 0 },
  { value: 98.7, suffix: '%', decimals: 1 },
  { value: 3.1, suffix: 's', decimals: 1 },
  { value: 24, suffix: '/7', decimals: 0 },
];

const LABELS = [
  'Tokens Scanned',
  'Accuracy Rate',
  'Avg Scan Time',
  'Always Scanning',
];

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const els = gsap.utils.toArray<HTMLElement>('[data-stat-value]', sectionRef.current);

    const setFinal = () => els.forEach((el, i) => {
      const s = STATS[i]!;
      el.textContent =
        s.value.toLocaleString('en-US', {
          minimumFractionDigits: s.decimals,
          maximumFractionDigits: s.decimals,
        }) + s.suffix;
    });

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: reduce)', setFinal);
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tweens = els.map((el, i) => {
        const stat = STATS[i]!;
        const obj = { val: 0 };
        return gsap.to(obj, {
          val: stat.value,
          duration: 1.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          onUpdate: () => {
            el.textContent =
              obj.val.toLocaleString('en-US', {
                minimumFractionDigits: stat.decimals,
                maximumFractionDigits: stat.decimals,
              }) + stat.suffix;
          },
        });
      });
      return () => tweens.forEach((t) => t.scrollTrigger?.kill());
    });
    return () => mm.revert();
  }, []);

  return (
    // ================= SECTION 6: ACCURACY & TRACK RECORD (NUMBERS DON'T LIE.) =================
    <section ref={sectionRef} id="stats" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 relative">
        {/* Right Side Cool Detective Rabbit with Sunglasses */}
        <div className="flex justify-end mb-2">
          <motion.img
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            src="/assets/rabbit-cool.webp"
            alt="Cool Detective Rabbit"
            className="w-24 sm:w-32 h-auto object-contain drop-shadow-[0_6px_20px_rgba(124,58,237,0.3)] select-none"
          />
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2.5">
            ACCURACY &amp; TRACK RECORD
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            Numbers <span className="text-[#a855f7] italic">don&apos;t lie.</span>
          </h2>
        </div>

        {/* 4 Stat Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.04, y: -2 }}
              className="p-6 sm:p-8 rounded-2xl bg-[#0e0a22]/90 border border-[#2c2054] shadow-xl text-center flex flex-col items-center justify-center transition-all"
            >
              <span
                data-stat-value
                className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-2"
              >
                0
              </span>
              <span className="text-xs sm:text-sm font-mono text-[#94a3b8]">
                {LABELS[idx]}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
