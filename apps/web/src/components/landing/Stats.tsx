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
    <section ref={sectionRef} id="stats" className="relative pt-20 pb-10 sm:pt-28 sm:pb-14 overflow-hidden">
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

        {/* ================= 4 STAT CARDS + COOL RABBIT ROW ================= */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative">
          
          {/* 4 Stat Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 flex-1 w-full relative z-10">
            {STATS.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.04, y: -3 }}
                className="p-5 sm:p-7 rounded-2xl bg-[#0c0822]/90 border border-[#261c4a] hover:border-[#7c3aed]/50 shadow-xl text-center flex flex-col items-center justify-center min-h-[140px] sm:min-h-[160px] transition-all"
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

          {/* Cool Sunglasses Hoodie Rabbit Mascot on Right with Looping Sparkle Trail */}
          <div className="shrink-0 relative w-36 sm:w-44 h-40 sm:h-44 flex items-center justify-center">
            {/* Curved Dotted Trail behind Cool Rabbit */}
            <svg
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
              viewBox="0 0 160 160"
              fill="none"
            >
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.9 }}
                viewport={{ once: true }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                d="M -20 130 C 20 150, 70 140, 110 110 C 145 80, 155 30, 120 15 C 85 0, 45 40, 75 85 C 105 130, 160 120, 190 140"
                stroke="#ff7a29"
                strokeWidth="1.6"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </svg>

            {/* Twinkling Sparkles */}
            <SparkleStar x={10} y={120} size={11} delay={0} />
            <SparkleStar x={125} y={20} size={13} delay={0.4} />
            <SparkleStar x={55} y={80} size={10} delay={0.8} />

            {/* Cool Sunglasses Mascot */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.08, rotate: 2 }}
              className="relative z-10 select-none cursor-pointer"
            >
              <img
                src="/assets/rabbit-cool.webp"
                alt="Cool Detective Rabbit Mascot"
                className="w-28 sm:w-36 h-auto object-contain drop-shadow-[0_10px_30px_rgba(124,58,237,0.4)] drop-shadow-[0_0_20px_rgba(255,122,41,0.25)] select-none"
              />
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}
