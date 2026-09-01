'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from '@/lib/gsap';

const STATS = [
  { value: 12842, suffix: '+', decimals: 0, label: 'Tokens Scanned' },
  { value: 98.7, suffix: '%', decimals: 1, label: 'Accuracy Rate' },
  { value: 3.1, suffix: 's', decimals: 1, label: 'Avg Scan Time' },
  { value: 24, suffix: '/7', decimals: 0, label: 'Always Scanning' },
];

function SparkleStar({ x, y, size = 11, delay = 0 }: { x: number; y: number; size?: number; delay?: number }) {
  return (
    <motion.svg
      className="absolute pointer-events-none overflow-visible z-20"
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
    <section ref={sectionRef} id="stats" className="relative pt-20 pb-2 sm:pt-28 sm:pb-3 overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative">

        {/* ================= HEADER ================= */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 relative z-10">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2.5">
            ACCURACY &amp; TRACK RECORD
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            Numbers <span className="text-[#c084fc] italic">don&apos;t lie.</span>
          </h2>
        </div>

        {/* ================= 4 STAT CARDS (Positioned to the left of the right mascot) ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 lg:mr-40 xl:mr-48 relative z-10">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04, y: -3 }}
              className="p-4 sm:p-6 rounded-2xl bg-[#0c0822]/90 border border-[#261c4a] hover:border-[#7c3aed]/50 shadow-xl text-center flex flex-col items-center justify-center min-h-[135px] sm:min-h-[155px] transition-all"
            >
              <span
                data-stat-value
                className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#c084fc] tracking-tight mb-2 font-mono"
              >
                {stat.value}{stat.suffix}
              </span>
              <span className="text-xs sm:text-sm font-medium text-[#94a3b8]">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
