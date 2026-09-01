'use client';

import { motion } from 'framer-motion';
import { Zap, FileText } from 'lucide-react';

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

export function Cta() {
  return (
    <section id="api" className="relative pt-3 pb-20 sm:pt-4 sm:pb-28 overflow-visible">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 relative">
        
        {/* Card Wrapper with exact bottom-full positioning for the mascot */}
        <div className="relative">

          {/* ================= COOL SUNGLASSES RABBIT WITH EXACT LOOPING TRAIL ================= */}
          <div className="hidden lg:flex absolute bottom-full -right-2 lg:-right-4 xl:-right-6 items-end z-20 select-none pointer-events-none mb-0">
            <div className="relative flex items-end">
              {/* Curved Dotted Trail looping behind Cool Rabbit */}
              <svg
                className="absolute inset-0 w-72 h-64 overflow-visible pointer-events-none -left-28 -top-12"
                viewBox="0 0 240 200"
                fill="none"
              >
                {/* Looping trail around Cool Rabbit */}
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.95 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.8, ease: 'easeOut' }}
                  d="M 10,130 C 40,155 90,140 130,90 C 160,50 175,10 135,15 C 95,20 60,70 100,120 C 140,170 190,140 225,120 C 245,110 260,135 280,180"
                  stroke="#ff7a29"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />
              </svg>

              {/* Sparkle Stars along the Cool Rabbit's trail */}
              <SparkleStar x={-30} y={120} size={11} delay={0} />
              <SparkleStar x={105} y={15} size={14} delay={0.4} />
              <SparkleStar x={65} y={80} size={11} delay={0.8} />
              <SparkleStar x={185} y={115} size={13} delay={0.2} />

              {/* Cool Sunglasses Mascot (Enlarged) */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex items-end"
              >
                <img
                  src="/assets/rabbit-cool.webp"
                  alt="Cool Detective Rabbit Mascot"
                  className="w-40 sm:w-48 lg:w-52 xl:w-56 h-auto object-contain drop-shadow-[0_12px_36px_rgba(124,58,237,0.45)] drop-shadow-[0_0_25px_rgba(255,122,41,0.35)] block align-bottom mb-0 pb-0"
                />
              </motion.div>
            </div>
          </div>

          <div className="relative p-8 sm:p-12 lg:p-14 rounded-3xl bg-[#09061a]/95 border border-[#261c4a] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 overflow-hidden group hover:border-[#7c3aed]/40 transition-colors z-10">
          
          {/* ================= LEFT: LEAPING RABBIT WITH EXACT LOOP-DE-LOOP & STARS ================= */}
          <div className="relative w-56 sm:w-64 h-36 sm:h-40 shrink-0 flex items-center justify-center select-none">
            {/* Exact Loop-de-loop Dotted SVG */}
            <svg
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
              viewBox="0 0 220 160"
              fill="none"
            >
              {/* Loop-de-loop curve exactly matching screenshot */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.95 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
                d="M 15,125 C 20,70 45,25 75,35 C 100,45 95,105 65,115 C 40,120 30,85 55,65 C 80,45 110,80 145,105 C 165,118 185,122 205,120"
                stroke="#ff7a29"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </svg>

            {/* Twinkling Diamond Stars positioned on the loop */}
            <SparkleStar x={18} y={80} size={11} delay={0} />
            <SparkleStar x={65} y={25} size={13} delay={0.4} />
            <SparkleStar x={75} y={115} size={11} delay={0.8} />
            <SparkleStar x={125} y={85} size={12} delay={0.2} />
            <SparkleStar x={180} y={115} size={10} delay={0.6} />

            {/* Leaping Rabbit Image */}
            <motion.div
              animate={{
                y: [-4, 4, -4],
                rotate: [-1, 2, -1],
              }}
              transition={{
                duration: 3.4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              whileHover={{ scale: 1.1, rotate: 4 }}
              className="relative z-10 cursor-pointer ml-12 sm:ml-16"
            >
              <img
                src="/assets/rabbit-leaping.webp"
                alt="Tracehop Leaping Rabbit"
                className="w-28 sm:w-36 h-auto object-contain drop-shadow-[0_0_20px_rgba(255,122,41,0.4)] drop-shadow-[0_0_30px_rgba(124,58,237,0.3)] select-none"
              />
            </motion.div>
          </div>

          {/* ================= CENTER: TITLE, SUBTITLE & BUTTONS ================= */}
          <div className="text-center lg:text-left flex-1 relative z-10">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
              Stop <span className="italic text-[#c084fc]">gambling</span>. Start <span className="italic text-[#ff7a29]">tracing</span>.
            </h2>
            <p className="text-[#94a3b8] text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Get Tracehop API and build with the best onchain intelligence engine.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 font-sans">
              <a
                href="#api"
                className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#9333ea] hover:to-[#7c3aed] text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_16px_rgba(124,58,237,0.4)] hover:shadow-[0_0_24px_rgba(124,58,237,0.6)] transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>GET API ACCESS</span>
              </a>

              <a
                href="#api"
                className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-[#120d2b] hover:bg-[#1c1442] border border-[#2e215c] hover:border-[#7c3aed]/60 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <FileText className="w-4 h-4 text-[#c4b5fd]" />
                <span>VIEW API DOCS</span>
              </a>
            </div>
          </div>

          {/* ================= RIGHT: CONTINUOUS WAVING DOTTED TRAIL WITH SPARKLES ================= */}
          <div className="hidden lg:block relative w-48 h-32 shrink-0 pointer-events-none select-none">
            <svg
              className="w-full h-full overflow-visible"
              viewBox="0 0 200 120"
              fill="none"
            >
              {/* Waving sinusoidal trail looping across the right side */}
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 0.95 }}
                viewport={{ once: true }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
                d="M -10,80 C 15,110 40,115 65,80 C 95,35 125,20 150,55 C 170,85 190,95 215,60"
                stroke="#ff7a29"
                strokeWidth="1.8"
                strokeDasharray="4 4"
                strokeLinecap="round"
              />
            </svg>
            <SparkleStar x={55} y={75} size={12} delay={0.2} />
            <SparkleStar x={135} y={25} size={14} delay={0.6} />
            <SparkleStar x={195} y={55} size={11} delay={0.9} />
          </div>

        </div>
        </div>
      </div>
    </section>
  );
}
