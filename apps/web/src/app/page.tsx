'use client';

import { useRef } from 'react';
import { CyberBackgroundCanvas } from '@/components/CyberBackgroundCanvas';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Demo } from '@/components/landing/Demo';
import { Engine } from '@/components/landing/Engine';
import { Why } from '@/components/landing/Why';
import { Stats } from '@/components/landing/Stats';
import { Cta } from '@/components/landing/Cta';
import { Footer } from '@/components/landing/Footer';
import { PRESET_TOKENS, scrollToSection } from '@/lib/landing';
import type { PresetToken } from '@/lib/landing';

export default function Home() {
  const scannerRef = useRef<((token?: PresetToken) => void) | null>(null);

  const startDemo = (token?: PresetToken) => {
    scrollToSection('demo');
    scannerRef.current?.(token ?? PRESET_TOKENS[0]);
  };

  return (
    <div className="relative min-h-screen bg-[#06040d] text-white selection:bg-[#7c3aed]/30 overflow-x-hidden font-sans">
      <CyberBackgroundCanvas />
      <Navbar />
      <main id="top" className="relative z-10 flex flex-col">
        <Hero onStartDemo={startDemo} />
        <Demo registerScanner={(fn) => { scannerRef.current = fn; }} />
        <Engine />
        <Why />
        <Stats />
        <Cta />
        <Footer />
      </main>
    </div>
  );
}
