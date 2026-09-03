'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Zap,
  Terminal,
  ArrowDown,
  Layers,
} from 'lucide-react';
import { PRESET_TOKENS, scrollToSection } from '@/lib/landing';
import type { PresetToken } from '@/lib/landing';
import { HeroConstellation } from './HeroConstellation';

interface HeroProps {
  onStartDemo: (token?: PresetToken) => void;
}

export function Hero({ onStartDemo }: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);
  const rabbitMoveX = useTransform(smoothX, [-0.5, 0.5], [-10, 10]);
  const rabbitMoveY = useTransform(smoothY, [-0.5, 0.5], [-7, 7]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <>
      {/* ================= 2. HERO SECTION ================= */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative min-h-[92vh] flex flex-col justify-between pt-26 sm:pt-28 pb-4 overflow-hidden"
        aria-label="Hero Section"
      >
        {/* Main Grid Container */}
        <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline & CTA */}
          <div
            data-hero="copy"
            className="lg:col-span-5 flex flex-col items-start text-left z-10"
          >
            {/* Eyebrow Badge */}
            <motion.div
              data-hero="badge"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#150d36]/90 border border-[#7c3aed]/40 shadow-[0_0_8px_rgba(124,58,237,0.12)] mb-4 text-xs font-mono select-none"
            >
              <img
                src="/assets/rabbit-minimal.webp"
                alt="TraceHop Mark"
                className="w-4 h-4 object-contain drop-shadow-[0_0_4px_rgba(255,122,41,0.3)] shrink-0"
              />
              <span className="font-bold tracking-wider text-[11px] text-[#e2e8f0] uppercase">
                Multi-chain wallet intelligence
              </span>
              <span className="text-[#7c3aed]/60">·</span>
              <span className="text-[#c084fc] font-semibold text-[11px]">Solana & EVM</span>
            </motion.div>

            <motion.h1
              data-hero="headline"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="font-display font-extrabold text-[48px] sm:text-[60px] lg:text-[68px] xl:text-[72px] tracking-[-0.035em] leading-[1.03] text-white"
            >
              Know before <br />
              you{' '}
              <motion.span
                whileHover={{ scale: 1.05 }}
                className="inline-block text-[#ff7a29] italic cursor-default drop-shadow-[0_0_10px_rgba(255,122,41,0.35)] transition-all"
              >
                ape
              </motion.span>
              <span className="text-[#38bdf8] drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">.</span>
            </motion.h1>

            <motion.p
              data-hero="subtext"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="font-sans text-[#94a3b8] text-[15px] sm:text-[16px] leading-[1.6] max-w-[480px] mt-4 mb-6"
            >
              Tracehop scans every angle of a token&apos;s onchain footprint so you can move with <span className="text-white font-semibold italic">clarity</span>, not luck.
            </motion.p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-6 font-sans">
              <motion.a
                data-hero="cta"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="#demo"
                onClick={() => onStartDemo(PRESET_TOKENS[0])}
                className="inline-flex items-center gap-2 h-[48px] px-6.5 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white font-extrabold text-xs sm:text-[13px] tracking-wider uppercase shadow-[0_0_12px_rgba(124,58,237,0.35)] hover:shadow-[0_0_18px_rgba(124,58,237,0.5)] transition-all duration-200 whitespace-nowrap cursor-pointer"
              >
                <Zap className="w-4.5 h-4.5 fill-current shrink-0" />
                <span>Run Live Demo</span>
              </motion.a>

              <motion.a
                data-hero="cta"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.58, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="#api"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('api');
                }}
                className="inline-flex items-center gap-2 h-[48px] px-6.5 rounded-xl bg-[#120d2b] hover:bg-[#1b143f] border border-[#2c2054] hover:border-[#7c3aed]/60 text-white font-bold text-xs sm:text-[13px] tracking-wider uppercase shadow-sm transition-all duration-200 whitespace-nowrap cursor-pointer"
              >
                <Terminal className="w-4 h-4 text-[#c4b5fd] shrink-0" />
                <span>Get API Access</span>
              </motion.a>
            </div>

            {/* Product Facts */}
            <motion.div
              data-hero="badges"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06, delayChildren: 0.7 } } }}
              className="flex flex-wrap items-center gap-2 font-sans text-[11.5px] text-[#64748b]"
            >
              <motion.span variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>Live on Solana & EVM</motion.span>
              <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }} className="text-[#2a1e4a]">·</motion.span>
              <motion.span variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>No API key required</motion.span>
              <motion.span variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.2 } } }} className="text-[#2a1e4a]">·</motion.span>
              <motion.span variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>Privacy first</motion.span>
            </motion.div>
          </div>

          {/* Right Column: 3D Parallax Mascot & Constellation Network */}
          <motion.div
            data-hero="visual"
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="lg:col-span-7 relative flex items-center justify-center min-h-[460px]"
          >
            <div className="relative w-full max-w-[860px] aspect-[860/460] flex items-center justify-center">
              <HeroConstellation rabbitMoveX={rabbitMoveX} rabbitMoveY={rabbitMoveY} />
            </div>
          </motion.div>
        </div>

        {/* Bottom Ribbon */}
        <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12 mt-8 pt-4 border-t border-[#7c3aed]/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#64748b]">
          <div className="flex items-center gap-1.5 shrink-0">
            <Layers className="w-3.5 h-3.5 text-[#38bdf8] shrink-0" />
            <span className="text-[#cbd5e1] font-semibold">Solana</span>
            <span className="text-[#2a1e4a]">&</span>
            <span className="text-[#cbd5e1] font-semibold">EVM</span>
            <span className="text-[#2a1e4a] ml-2">·</span>
            <span>Real-time analysis</span>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
            <span>Scroll for live scan</span>
            <ArrowDown className="w-3 h-3 text-[#ff7a29]" />
          </div>
        </div>
      </section>
    </>
  );
}
