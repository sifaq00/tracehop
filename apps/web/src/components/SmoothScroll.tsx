'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // High-performance snappy Lenis configuration matching Sisy
    const lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1.15,
      touchMultiplier: 1.0,
      smoothWheel: true,
    });

    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let animationFrameId: number;
    let running = true;

    function raf(time: number) {
      if (!running) return;
      // ponytail: skip lenis.raf while tab hidden — same visuals, less CPU
      if (!document.hidden) {
        lenis.raf(time);
      }
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      running = false;
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return null;
}
