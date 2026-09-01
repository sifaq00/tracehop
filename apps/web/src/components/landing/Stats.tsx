'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView, useMotionValue, animate } from 'framer-motion';

const STATS = [
  { value: 12842, suffix: '+', decimals: 0, label: 'Tokens Scanned' },
  { value: 98.7, suffix: '%', decimals: 1, label: 'Accuracy Rate' },
  { value: 3.1, suffix: 's', decimals: 1, label: 'Avg Scan Time' },
  { value: 24, suffix: '/7', decimals: 0, label: 'Always Scanning' },
];

function StatCounter({ value, decimals, suffix }: { value: number; decimals: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionVal = useMotionValue(0);
  const isInView = useInView(ref, { once: false, amount: 0.2 });

  useEffect(() => {
    if (isInView) {
      const controls = animate(motionVal, value, {
        duration: 1.6,
        ease: [0.25, 1, 0.5, 1],
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent =
              latest.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
              }) + suffix;
          }
        },
      });
      return () => controls.stop();
    } else {
      motionVal.set(0);
      if (ref.current) {
        ref.current.textContent = '0' + suffix;
      }
    }
  }, [isInView, value, decimals, suffix, motionVal]);

  return (
    <span
      ref={ref}
      className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-[#c084fc] tracking-tight mb-2 font-mono"
    >
      0{suffix}
    </span>
  );
}

export function Stats() {
  return (
    <section id="stats" className="relative pt-20 pb-2 sm:pt-28 sm:pb-3 overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative">

        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-14 relative z-10"
        >
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2.5">
            ACCURACY &amp; TRACK RECORD
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
            Numbers <span className="text-[#c084fc] italic">don&apos;t lie.</span>
          </h2>
        </motion.div>

        {/* ================= 4 STAT CARDS ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4 lg:mr-40 xl:mr-48 relative z-10">
          {STATS.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 28, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ scale: 1.04, y: -3 }}
              className="p-4 sm:p-6 rounded-2xl bg-[#0c0822]/90 border border-[#261c4a] hover:border-[#7c3aed]/50 shadow-xl text-center flex flex-col items-center justify-center min-h-[135px] sm:min-h-[155px] transition-all"
            >
              <StatCounter value={stat.value} decimals={stat.decimals} suffix={stat.suffix} />
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
