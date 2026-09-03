'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Lenis smooth scroll with responsive lerp
    const lenis = new Lenis({
      lerp: 0.14, // Swift, responsive smoothing without floaty drag
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.35, // Light, effortless scroll feel per wheel tick
      touchMultiplier: 1.2,
      syncTouch: false, // native touch on mobile for optimal battery & performance
    });

    // Attach to window for global access (e.g. scrollToSection)
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let animId: number;
    function raf(time: number) {
      lenis.raf(time);
      animId = requestAnimationFrame(raf);
    }
    animId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animId);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
