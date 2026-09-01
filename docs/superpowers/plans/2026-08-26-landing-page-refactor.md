# Landing Page Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the 2019-line `apps/web/src/app/page.tsx` monolith into focused landing components, delete dead code, and add GSAP ScrollTrigger scroll-driven animations — with the hero section preserved pixel-for-pixel.

**Architecture:** Bottom-up extraction (leaf sections first, hero/navbar last) so `page.tsx` compiles after every task. Shared data + utilities live in `lib/landing.ts`; a `lib/gsap.ts` module registers ScrollTrigger once. Framer Motion keeps micro-interactions; GSAP owns scroll-driven animation only. Every GSAP effect is gated behind `prefers-reduced-motion: no-preference` via `gsap.matchMedia()`.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, framer-motion 12 (installed), GSAP + ScrollTrigger (new), three.js (existing, untouched).

## Global Constraints

- **HERO IS FROZEN:** hero markup/DOM structure/styling/existing SVG animations preserved exactly. Extraction = verbatim move. New hero effects touch only wrapper transforms (`yPercent`, `opacity`) and a one-time entrance that ends at natural state.
- No redesign, no copy changes, no new sections.
- All scroll animations gated: `mm.add('(prefers-reduced-motion: no-preference)', ...)`.
- Transform/opacity-only tweens (exception: engine progress bar width, small element).
- Every `useEffect` creating ScrollTriggers kills them on unmount.
- Work happens in the **current working tree** (uncommitted user changes exist — never `git checkout`/`git restore` anything).
- Anchor-based extraction: locate JSX blocks by their unique comment markers (listed per task), NOT line numbers (lines shift between tasks).
- Verify each task: `pnpm --filter @tracehop/web build` must pass before commit. Commits from repo root.
- Spec: `docs/superpowers/specs/2026-08-26-landing-page-refactor-design.md`

---

### Task 1: Foundation — gsap install, `lib/gsap.ts`, `lib/landing.ts`

**Files:**
- Modify: `apps/web/package.json` (via pnpm add)
- Create: `apps/web/src/lib/gsap.ts`
- Create: `apps/web/src/lib/landing.ts`

**Interfaces:**
- Produces: `gsap`, `ScrollTrigger` (registered) from `@/lib/gsap`; `scrollToSection(id: string): void`, `triggerCelebration(): void`, types `NodeInfo`, `PresetToken`, arrays `HERO_NODES`, `PRESET_TOKENS`, `NAV_LINKS` from `@/lib/landing`.

- [ ] **Step 1: Install gsap**

Run from repo root:
```bash
pnpm --filter @tracehop/web add gsap
```

- [ ] **Step 2: Create `apps/web/src/lib/gsap.ts`**

```ts
'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
```

- [ ] **Step 3: Create `apps/web/src/lib/landing.ts`**

Cut from `page.tsx`: the entire `// ================= TYPES & MOCK DATA =================` block containing `interface NodeInfo`, `HERO_NODES`, `interface PresetToken`, `PRESET_TOKENS` (ends before `const KNOWN_ENTITIES`), plus the `NAV_LINKS` array (starts at `const NAV_LINKS = [` — note it references `HomeIcon`/`Terminal`/`Network`/`Sparkles`/`FaTelegramPlane`/`Flame`/`Code2` icons; move those imports too). **Do NOT move `KNOWN_ENTITIES` — delete it (dead code).**

Add `export` keyword to every moved declaration. Append shared utilities:

```ts
import { FaTelegramPlane } from 'react-icons/fa';
import {
  Terminal, Network, Sparkles, Flame, Code2,
  Home as HomeIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ...moved NodeInfo, HERO_NODES, PresetToken, PRESET_TOKENS, NAV_LINKS here (all exported)...

export function scrollToSection(id: string) {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const elem = document.getElementById(id);
  if (elem) {
    const yOffset = -76;
    const y = elem.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }
}

export function triggerCelebration() {
  confetti({
    particleCount: 50,
    spread: 60,
    origin: { y: 0.75 },
    colors: ['#7c3aed', '#ff7a29', '#38bdf8', '#c084fc'],
  });
}
```

In `page.tsx`: delete the moved/deleted blocks, import from `@/lib/landing` (`import { HERO_NODES, NAV_LINKS, PRESET_TOKENS, triggerCelebration } from '@/lib/landing'; import type { NodeInfo, PresetToken } from '@/lib/landing';`). Delete now-unused local `triggerCelebration` and old `scrollToSection` body — replace `page.tsx`'s local `scrollToSection` with a re-export-free thin version that still clears `mobileMenuOpen`/`activeNav` state (keep existing signature, call the lib one internally):

```tsx
const scrollToSection = (id: string) => {
  setActiveNav(id);
  setMobileMenuOpen(false);
  scrollToId(id);
};
```
(import the lib fn as `scrollToId`).

- [ ] **Step 4: Build**

Run: `pnpm --filter @tracehop/web build`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/package.json apps/web/src/lib/gsap.ts apps/web/src/lib/landing.ts apps/web/src/app/page.tsx pnpm-lock.yaml
git commit -m "refactor: extract landing data and add gsap foundation"
```

---

### Task 2: Footer extraction

**Files:**
- Create: `apps/web/src/components/landing/Footer.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `scrollToSection` from `@/lib/landing`.
- Produces: `export function Footer(): JSX.Element` — zero props.

- [ ] **Step 1: Create `Footer.tsx`**

Skeleton (all JSX moved verbatim):

```tsx
'use client';

import { FaTelegramPlane, FaGithub, FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { scrollToSection } from '@/lib/landing';

export function Footer() {
  return (
    // PASTE VERBATIM: the entire <footer>...</footer> block from page.tsx,
    // anchored from "{/* ================= SECTION 8: COMPREHENSIVE FOOTER ================= */}"
    // through "</footer>" inclusive.
  );
}
```

The pasted block includes its wrapping `<footer className="relative py-14 ...">` element. Adjust indentation only.

- [ ] **Step 2: Rewire `page.tsx`**

Replace the footer block with `<Footer />`. Add import. Remove imports now used only by footer (`FaGithub`, `FaDiscord` if unreferenced elsewhere — check with Grep first).

- [ ] **Step 3: Build**

Run: `pnpm --filter @tracehop/web build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/landing/Footer.tsx apps/web/src/app/page.tsx
git commit -m "refactor: extract Footer to landing component"
```

---

### Task 3: CTA banner extraction + glow pulse

**Files:**
- Create: `apps/web/src/components/landing/Cta.tsx`
- Modify: `apps/web/src/app/page.tsx`, `apps/web/src/app/globals.css`

**Interfaces:**
- Produces: `export function Cta(): JSX.Element` — zero props.

- [ ] **Step 1: Add glow pulse CSS to `globals.css`** (append):

```css
@keyframes ctaGlow {
  0%, 100% { box-shadow: 0 0 60px rgba(124, 58, 237, 0.25); }
  50% { box-shadow: 0 0 90px rgba(124, 58, 237, 0.45); }
}

.animate-ctaGlow {
  animation: ctaGlow 4s ease-in-out infinite;
}
```

- [ ] **Step 2: Create `Cta.tsx`**

```tsx
'use client';

import { Zap, FileText } from 'lucide-react';

export function Cta() {
  return (
    // PASTE VERBATIM: section block anchored from
    // "{/* ================= SECTION 7: CTA BANNER (STOP GAMBLING. START TRACING.) ================= */}"
    // through its closing "</section>" inclusive.
    //
    // ONE EDIT inside the pasted block: on the rounded-3xl gradient card div,
    // append class "animate-ctaGlow" to its className.
  );
}
```

- [ ] **Step 3: Rewire `page.tsx`** — replace block with `<Cta />`, add import, prune orphaned lucide imports (Grep each before removing).

- [ ] **Step 4: Build** — Run: `pnpm --filter @tracehop/web build`. Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/landing/Cta.tsx apps/web/src/app/page.tsx apps/web/src/app/globals.css
git commit -m "refactor: extract CTA banner with subtle glow pulse"
```

---

### Task 4: Stats extraction + count-up

**Files:**
- Create: `apps/web/src/components/landing/Stats.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger` from `@/lib/gsap`.
- Produces: `export function Stats(): JSX.Element` — zero props.

- [ ] **Step 1: Create `Stats.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

const STATS = [
  { value: 12842, suffix: '+', decimals: 0 },
  { value: 98.7, suffix: '%', decimals: 1 },
  { value: 3.1, suffix: 's', decimals: 1 },
  { value: 24, suffix: '/7', decimals: 0 },
];

export function Stats() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const counters = gsap.utils.toArray<HTMLElement>('[data-stat-value]', sectionRef.current);

      const tweens = counters.map((el, i) => {
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
    // PASTE VERBATIM: section block anchored from
    // "{/* ================= SECTION 6: ACCURACY & TRACK RECORD (NUMBERS DON'T LIE.) ================= */}"
    // through its closing "</section>" inclusive.
    //
    // EDITS inside the pasted block:
    // 1. Add ref={sectionRef} to the <section id="stats" ...> tag.
    // 2. Replace the inline array-of-stat-objects .map() with STATS.map((stat, idx) => ...)
    //    keeping the EXACT same JSX output, but the <span> that rendered {stat.value}
    //    becomes: <span data-stat-value className="font-display font-extrabold ...">
    //    0</span>  (initial text "0"; reduced-motion users see 0 replaced instantly by
    //    the fallback below).
  );
}
```

**Fallback for reduced-motion / JS-off correctness:** after the `mm.add(...)` setup, add unconditionally:

```tsx
// Ensure final values are always present even if animations are skipped
counters not needed — instead: on mount, immediately set final text if matchMedia fails:
```
Concretely, restructure the effect: compute `el.textContent` final value assignment BEFORE creating the tween (set finals first, then tween from 0 only when allowed). Implement as:

```tsx
useEffect(() => {
  const els = gsap.utils.toArray<HTMLElement>('[data-stat-value]', sectionRef.current);
  const setFinal = () => els.forEach((el, i) => {
    const s = STATS[i]!;
    el.textContent = s.value.toLocaleString('en-US', { minimumFractionDigits: s.decimals, maximumFractionDigits: s.decimals }) + s.suffix;
  });

  const mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: reduce)', setFinal);
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    /* tween code from above, but start obj.val at 0 and overwrite textContent */
  });
  return () => mm.revert();
}, []);
```

- [ ] **Step 2: Rewire `page.tsx`** — replace block with `<Stats />`, prune imports.

- [ ] **Step 3: Build** — Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/landing/Stats.tsx apps/web/src/app/page.tsx
git commit -m "refactor: extract Stats with scroll-triggered count-up"
```

---

### Task 5: Features extraction + graph draw-on

**Files:**
- Create: `apps/web/src/components/landing/Features.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger` from `@/lib/gsap`.
- Produces: `export function Features(): JSX.Element` — zero props.

- [ ] **Step 1: Create `Features.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { FaTelegramPlane } from 'react-icons/fa';
import { Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { gsap } from '@/lib/gsap';

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        // Cards slide in from opposite sides
        gsap.from('[data-feature-card="left"]', {
          x: -40, opacity: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '[data-feature-grid]', start: 'top 78%', once: true },
        });
        gsap.from('[data-feature-card="right"]', {
          x: 40, opacity: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: '[data-feature-grid]', start: 'top 78%', once: true },
        });

        // Funding-graph lines draw on
        const lines = gsap.utils.toArray<SVGLineElement>('[data-funding-line]');
        lines.forEach((line) => {
          const len = line.getTotalLength();
          gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
          gsap.to(line, {
            strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut', delay: 0.4,
            scrollTrigger: { trigger: '[data-feature-grid]', start: 'top 70%', once: true },
          });
        });

        // Nodes pop after lines
        gsap.from('[data-funding-node]', {
          scale: 0, opacity: 0, duration: 0.4, ease: 'back.out(2)',
          stagger: 0.08, delay: 1.1,
          scrollTrigger: { trigger: '[data-feature-grid]', start: 'top 70%', once: true },
        });
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    // PASTE VERBATIM: section block anchored from
    // "{/* ================= SECTION 5: TELEGRAM INTEGRATION & FUNDING GRAPH PREVIEW ================= */}"
    // through its closing "</section>" inclusive.
    //
    // EDITS inside the pasted block:
    // 1. ref={sectionRef} on the <section id="features" ...> tag.
    // 2. data-feature-grid on the "grid grid-cols-1 lg:grid-cols-12 ..." wrapper div.
    // 3. data-feature-card="left" on the Telegram column div ("lg:col-span-6 p-6 sm:p-8 rounded-3xl..." first one).
    // 4. data-feature-card="right" on the Funding Graph column div (second "lg:col-span-6 ...").
    // 5. data-funding-line on all six <line> elements inside the preview SVG.
    // 6. data-funding-node on all seven <circle> node elements in that SVG.
  );
}
```

- [ ] **Step 2: Rewire `page.tsx`** — replace with `<Features />`, prune imports.

- [ ] **Step 3: Build** — Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/landing/Features.tsx apps/web/src/app/page.tsx
git commit -m "refactor: extract Features with slide-in cards and graph draw-on"
```

---

### Task 6: Why extraction + spotlight hover cards

**Files:**
- Create: `apps/web/src/components/landing/Why.tsx`
- Modify: `apps/web/src/app/page.tsx`, `apps/web/src/app/globals.css`

**Interfaces:**
- Consumes: `gsap` from `@/lib/gsap`.
- Produces: `export function Why(): JSX.Element` — zero props.

- [ ] **Step 1: Add spotlight CSS to `globals.css`** (append):

```css
.spotlight-card {
  position: relative;
  overflow: hidden;
}

.spotlight-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    260px circle at var(--mx, 50%) var(--my, 50%),
    rgba(124, 58, 237, 0.22),
    transparent 65%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.spotlight-card:hover::before {
  opacity: 1;
}
```

- [ ] **Step 2: Create `Why.tsx`**

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Box, Activity, ShieldCheck, FileText, Code2, EyeOff } from 'lucide-react';
import { gsap } from '@/lib/gsap';

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

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.from('[data-why-card]', {
          y: 28, opacity: 0, duration: 0.55, ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: { trigger: '[data-why-grid]', start: 'top 80%', once: true },
        });
      }, sectionRef);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  const handleSpotlight = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    // PASTE VERBATIM: section block anchored from
    // "{/* ================= SECTION 4: WHY TRACEHOP (BUILT TO REMOVE THE GUESSWORK.) ================= */}"
    // through its closing "</section>" inclusive.
    //
    // EDITS inside the pasted block:
    // 1. ref={sectionRef} on <section id="why" ...>.
    // 2. data-why-grid on the "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 ..." div.
    // 3. Replace the inline card-array .map() with CARDS.map(...) producing identical JSX;
    //    on each card motion.div: add className "spotlight-card" (merged into existing
    //    classes) and onMouseMove={handleSpotlight}.
  );
}
```

- [ ] **Step 3: Rewire `page.tsx`** — replace with `<Why />`, prune imports.

- [ ] **Step 4: Build** — Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/landing/Why.tsx apps/web/src/app/page.tsx apps/web/src/app/globals.css
git commit -m "refactor: extract Why section with spotlight hover cards"
```

---

### Task 7: Engine extraction + stagger pipeline + scrub progress bar

**Files:**
- Create: `apps/web/src/components/landing/Engine.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `gsap` from `@/lib/gsap`.
- Produces: `export function Engine(): JSX.Element` — zero props.

- [ ] **Step 1: Create `Engine.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Crosshair, Users, Network, Layers, ShieldAlert, Lock,
  FileCheck, UserCheck, History, ShieldCheck,
} from 'lucide-react';
import { gsap } from '@/lib/gsap';

const STEPS = [
  { num: '01', title: 'Deployer Located', icon: Crosshair },
  { num: '02', title: 'First 20 Buyers', icon: Users },
  { num: '03', title: 'Funding Graph', icon: Network },
  { num: '04', title: 'Wallet Clusters', icon: Layers },
  { num: '05', title: 'Risk Patterns', icon: ShieldAlert },
  { num: '06', title: 'LP Lock & Liquidity', icon: Lock },
  { num: '07', title: 'Honeypot Check', icon: FileCheck },
  { num: '08', title: 'Known Entity Match', icon: UserCheck },
  { num: '09', title: 'Similar Token History', icon: History },
  { num: '10', title: 'Verdict Generated', icon: ShieldCheck, isHighlight: true },
];

export function Engine() {
  const sectionRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const barLabelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.from('[data-engine-card]', {
          y: 24, opacity: 0, duration: 0.45, ease: 'power3.out',
          stagger: 0.05,
          scrollTrigger: { trigger: '[data-engine-grid]', start: 'top 82%', once: true },
        });

        // Live scan progress bar scrubs with scroll: 20% -> 100%
        gsap.fromTo(barRef.current, { width: '20%' }, {
          width: '100%', ease: 'none',
          scrollTrigger: {
            trigger: sectionRef.current, start: 'top 60%', end: 'center 40%', scrub: true,
            onUpdate: (self) => {
              if (barLabelRef.current) {
                barLabelRef.current.textContent = `${Math.round(20 + self.progress * 80)}%`;
              }
            },
          },
        });
      }, sectionRef);
      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    // PASTE VERBATIM: section block anchored from
    // "{/* ================= SECTION 3: TRACEHOP ENGINE (WE FOLLOW THE MONEY.) ================= */}"
    // through its closing "</section>" inclusive.
    //
    // EDITS inside the pasted block:
    // 1. ref={sectionRef} on <section id="engine" ...>.
    // 2. data-engine-grid on the "grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 ..." div;
    //    replace its inline steps array with STEPS.map(...) producing identical JSX, and
    //    add data-engine-card to each card motion.div.
    // 3. Progress bar: on the inner motion.div that animated width ['40%','62%','62%'],
    //    REMOVE the animate/transition props, add ref={barRef} and keep all classes
    //    (h-full bg-gradient...). Give it an inline style={{ width: '62%' }} so the
    //    static state matches today's look before scrubbing.
    // 4. On the "<span className=\"text-white font-bold text-xs shrink-0\">62%</span>"
    //    label: add ref={barLabelRef} (text stays 62%).
  );
}
```

- [ ] **Step 2: Rewire `page.tsx`** — replace with `<Engine />`, prune imports (`RefreshCw` stays — used by Demo).

- [ ] **Step 3: Build** — Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/landing/Engine.tsx apps/web/src/app/page.tsx
git commit -m "refactor: extract Engine with staggered pipeline and scrub progress"
```

---

### Task 8: Demo extraction + reveal + scanner registration

**Files:**
- Create: `apps/web/src/components/landing/Demo.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `PRESET_TOKENS`, `PresetToken`, `triggerCelebration` from `@/lib/landing`; `gsap` from `@/lib/gsap`.
- Produces: `export function Demo({ registerScanner }: { registerScanner: (fn: (token?: PresetToken) => void) => void }): JSX.Element`.

- [ ] **Step 1: Create `Demo.tsx`**

Move ALL scanner state and logic verbatim from `page.tsx`: `selectedToken`, `inputMint`, `hasScanned`, `isScanning`, `scanProgress`, `visibleLogs`, and `handleStartScan` (minus its `scrollToSection('demo')` call — scrolling is the caller's job now; keep everything else identical, including `triggerCelebration` on SAFE verdict, now imported from lib). Also move the `copiedAddress`/`setCopiedAddress` decision: they are DEAD (never rendered) — delete here, do not carry over.

```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRESET_TOKENS, triggerCelebration } from '@/lib/landing';
import type { PresetToken } from '@/lib/landing';
import { gsap } from '@/lib/gsap';

interface DemoProps {
  registerScanner: (fn: (token?: PresetToken) => void) => void;
}

export function Demo({ registerScanner }: DemoProps) {
  const sectionRef = useRef<HTMLElement>(null);
  // ...moved scanner state (selectedToken, inputMint, hasScanned, isScanning,
  //    scanProgress, visibleLogs)...

  const handleStartScan = (tokenToScan?: PresetToken) => {
    // IDENTICAL logic to current page.tsx handleStartScan, but WITHOUT the
    // scrollToSection('demo') first line.
  };

  useEffect(() => {
    registerScanner(handleStartScan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.from('[data-demo-left]', {
          x: -40, opacity: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
        });
        gsap.from('[data-demo-right]', {
          x: 40, opacity: 0, duration: 0.7, ease: 'power3.out',
          scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', once: true },
        });
      }, sectionRef);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    // PASTE VERBATIM: section block anchored from
    // "{/* ================= SECTION 2: LIVE DEMO (INTERROGATE ANY TOKEN. INSTANTLY.) ================= */}"
    // through its closing "</section>" inclusive.
    //
    // EDITS inside the pasted block:
    // 1. ref={sectionRef} on <section id="demo" ...>.
    // 2. data-demo-left on the left-column motion.div (lg:col-span-5, detective rabbit),
    //    data-demo-right on the right-column div (lg:col-span-7).
    // 3. Left column keeps its floating-rabbit motion.img loop; REMOVE its outer
    //    initial={{ opacity: 0, x: -30 }} whileInView props (GSAP owns the reveal now,
    //    prevents double animation). Same removal on any whileInView entrance in the
    //    right column if present.
  );
}
```

Note: `scanProgress` state is currently written by the interval but the progress number is not rendered in the terminal card (only logs are). Keep the state writes verbatim (behavior-preserving); do not add UI.

- [ ] **Step 2: Rewire `page.tsx`** — replace with `<Demo registerScanner={...} />` wiring prepared for Task 11:

```tsx
const scannerRef = useRef<((token?: PresetToken) => void) | null>(null);
const startDemo = (token?: PresetToken) => {
  scrollToSection('demo');
  scannerRef.current?.(token ?? PRESET_TOKENS[0]);
};
```
render: `<Demo registerScanner={(fn) => { scannerRef.current = fn; }} />`

- [ ] **Step 3: Build** — Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add apps/web/src/components/landing/Demo.tsx apps/web/src/app/page.tsx
git commit -m "refactor: extract Demo scanner with registered scan entrypoint"
```

---

### Task 9: HeroConstellation verbatim extraction (FROZEN)

**Files:**
- Create: `apps/web/src/components/landing/HeroConstellation.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `HERO_NODES`, `NodeInfo` from `@/lib/landing`.
- Produces: `export function HeroConstellation({ rabbitMoveX, rabbitMoveY }: { rabbitMoveX: MotionValue<number>; rabbitMoveY: MotionValue<number> }): JSX.Element`.

- [ ] **Step 1: Create `HeroConstellation.tsx`**

```tsx
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import { HERO_NODES } from '@/lib/landing';
import type { NodeInfo } from '@/lib/landing';

interface HeroConstellationProps {
  rabbitMoveX: MotionValue<number>;
  rabbitMoveY: MotionValue<number>;
}

export function HeroConstellation({ rabbitMoveX, rabbitMoveY }: HeroConstellationProps) {
  const [activeNode, setActiveNode] = useState<NodeInfo | null>(null);
  const [isHoveringRabbit, setIsHoveringRabbit] = useState(false);

  return (
    <>
      {/* PASTE VERBATIM: from page.tsx, the ENTIRE right-column content — anchored from
          "{/* ===== LEAPING RABBIT MASCOT" ... wait: paste the FULL inner container:

          From:   <div className="relative w-full max-w-[860px] aspect-[860/460] flex items-center justify-center">
          Through:the matching closing </div> just before "</motion.div>" of the right column
                  (i.e., everything inside the right-column motion.div, lines ~811-1323 in the
                  original file: giant <svg> defs/filters/portal/radar/pentagon/light packets/
                  shockwaves, rabbit motion.div, and the HERO_NODES.map interactive nodes).

          ZERO changes. Not one class, not one attribute. */}
    </>
  );
}
```

Also move verbatim: the per-node emblem logic (discBorderClass/NodeEmblem if/else chains), `isRightEdge`/`isLeftEdge`/tooltip class computations — they live inside the `HERO_NODES.map` being moved.

- [ ] **Step 2: Rewire `page.tsx`** — in the hero right column, replace the pasted range with:

```tsx
<div className="relative w-full max-w-[860px] aspect-[860/460] flex items-center justify-center">
  <HeroConstellation rabbitMoveX={rabbitMoveX} rabbitMoveY={rabbitMoveY} />
</div>
```
(outer wrapper div stays in Hero so DOM depth is identical).

- [ ] **Step 3: Build** — Expected: PASS

- [ ] **Step 4: Visual spot-check** — `pnpm --filter @tracehop/web dev`, open http://localhost:3000, compare hero against `screenshot_hero.png` at repo root. Nodes hover tooltips + light packets animating.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/landing/HeroConstellation.tsx apps/web/src/app/page.tsx
git commit -m "refactor: extract HeroConstellation verbatim (frozen hero)"
```

---

### Task 10: Hero extraction + entrance timeline + scroll parallax

**Files:**
- Create: `apps/web/src/components/landing/Hero.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `PRESET_TOKENS`, `scrollToSection` from `@/lib/landing`; `HeroConstellation` from Task 9.
- Produces: `export function Hero({ onStartDemo }: { onStartDemo: (token?: PresetToken) => void }): JSX.Element`.

- [ ] **Step 1: Create `Hero.tsx`**

Owns verbatim: the fixed nebula-glow layer (`{/* FIXED AMBIENT BACKGROUND NEBULA */}` block), the hero `<section>` with mouse handlers (`heroRef`, `mouseX/mouseY`, springs, `rotateX/rotateY`, `rabbitMoveX/Y`, `bgGlowX/Y`, `handleMouseMove/handleMouseLeave`), left column, right column (now embedding `HeroConstellation`), telemetry ribbon, scroll indicator.

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Zap, Terminal, Activity, Network, ShieldCheck, EyeOff, ArrowDown, Cpu, ShieldAlert, Layers } from 'lucide-react';
import { PRESET_TOKENS, scrollToSection } from '@/lib/landing';
import type { PresetToken } from '@/lib/landing';
import { HeroConstellation } from './HeroConstellation';
import { gsap } from '@/lib/gsap';

interface HeroProps {
  onStartDemo: (token?: PresetToken) => void;
}

export function Hero({ onStartDemo }: HeroProps) {
  // ...moved mouse-parallax system verbatim (heroRef, mouseX, mouseY, springs,
  //    rotateX, rotateY, rabbitMoveX/Y, bgGlowX/Y, handleMouseMove, handleMouseLeave)...

  // Entrance timeline (replaces the two framer-motion entrance props on the left
  // column + badge — REMOVE initial/animate/transition from those motion.divs and
  // give them data-hero attributes instead):
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('[data-hero="badge"]', { y: -8, opacity: 0, duration: 0.5 })
          .from('[data-hero="headline"]', { y: 24, opacity: 0, duration: 0.7 }, '-=0.25')
          .from('[data-hero="subtext"]', { y: 16, opacity: 0, duration: 0.5 }, '-=0.4')
          .from('[data-hero="cta"]', { y: 14, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.3')
          .from('[data-hero="badges"] > *', { y: 10, opacity: 0, duration: 0.4, stagger: 0.05 }, '-=0.25');
      }, heroRef);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  // Scroll-out parallax — WRAPPER LEVEL ONLY, hero internals untouched
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        gsap.to('[data-hero="copy"]', {
          yPercent: -8, opacity: 0.45, ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
        });
        gsap.to('[data-hero="visual"]', {
          yPercent: 10, opacity: 0.35, scale: 0.96, ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
        });
      }, heroRef);
      return () => ctx.revert();
    });
    return () => mm.revert();
  }, []);

  return (
    <>
      {/* nebula glow layer verbatim */}
      {/* hero <section> verbatim with these attribute edits:
          1. left column motion.div: remove initial/animate/transition entrance props,
             add data-hero="copy"
          2. badge motion.div: remove initial/animate/transition, add data-hero="badge"
          3. h1 gets data-hero="headline"; <p> gets data-hero="subtext";
             each CTA motion.a gets data-hero="cta"; trust-badges wrapper gets
             data-hero="badges"
          4. right column motion.div gets data-hero="visual"
          5. "Run Live Demo" button onClick={() => onStartDemo(PRESET_TOKENS[0])}
             (was handleStartScan(PRESET_TOKENS[0]))
          6. inner constellation area replaced by <HeroConstellation
             rabbitMoveX={rabbitMoveX} rabbitMoveY={rabbitMoveY} /> per Task 9 */}
    </>
  );
}
```

All other hero JSX — eyebrow badge content, headline, subtext, buttons, trust badges, telemetry ribbon items, scroll indicator — verbatim.

- [ ] **Step 2: Rewire `page.tsx`** — replace nebula + hero section with `<Hero onStartDemo={startDemo} />`.

- [ ] **Step 3: Build** — Expected: PASS

- [ ] **Step 4: Visual spot-check** — dev server: hero identical at rest; entrance staggers on load; scrolling out fades/drifting layers; mouse tilt + rabbit float intact.

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/landing/Hero.tsx apps/web/src/app/page.tsx
git commit -m "refactor: extract Hero with entrance timeline and scroll parallax"
```

---

### Task 11: Navbar extraction + hide-on-scroll + final page cleanup

**Files:**
- Create: `apps/web/src/components/landing/Navbar.tsx`
- Modify: `apps/web/src/app/page.tsx`

**Interfaces:**
- Consumes: `NAV_LINKS`, `scrollToSection`, `triggerCelebration` from `@/lib/landing`; `WalletButton` component.
- Produces: `export function Navbar(): JSX.Element` — zero props.

- [ ] **Step 1: Create `Navbar.tsx`**

Moves verbatim: `<header>` block (anchored `{/* ================= 1. NAVBAR ================= */}` through `</header>`), the scroll-spy `useEffect` (sectionIds list, resize handler), `activeNav` + `mobileMenuOpen` state, `WalletButton` import, sound-mute state initialization (`isMutedState` — NOTE: if `isMutedState`, `toggleSound`, `playClick`, `isSoundMuted` have no JSX references after extraction (verify with Grep — the mute button does not appear in the current header render), DELETE them and the `@/lib/sound-fx` import here).

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Menu, X, Terminal, Network, Sparkles, Flame, Code2, Home as HomeIcon } from 'lucide-react';
import { WalletButton } from '@/components/WalletButton';
import { NAV_LINKS, scrollToSection, triggerCelebration } from '@/lib/landing';
import { gsap, ScrollTrigger } from '@/lib/gsap';

export function Navbar() {
  const [activeNav, setActiveNav] = useState('top');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  // ...moved scroll-spy useEffect verbatim (reads section ids, sets activeNav)...

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const st = ScrollTrigger.create({
        start: 'top top',
        onUpdate: (self) => {
          const hidden = self.direction === 1 && window.scrollY > 140;
          gsap.to(headerRef.current, {
            yPercent: hidden ? -100 : 0,
            duration: 0.35,
            ease: 'power2.out',
            overwrite: true,
          });
        },
      });
      return () => st.kill();
    });
    return () => mm.revert();
  }, []);

  const navigate = (id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    scrollToSection(id);
  };

  return (
    // PASTE VERBATIM header block with these edits:
    // 1. ref={headerRef} on <header>.
    // 2. every onClick that called page-level scrollToSection(link.id) becomes
    //    navigate(link.id); the logo click keeps triggerCelebration() +
    //    scrollToSection('top').
  );
}
```

- [ ] **Step 2: Finalize `page.tsx`**

Final shape:

```tsx
'use client';

import { useRef } from 'react';
import { CyberBackgroundCanvas } from '@/components/CyberBackgroundCanvas';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { Demo } from '@/components/landing/Demo';
import { Engine } from '@/components/landing/Engine';
import { Why } from '@/components/landing/Why';
import { Features } from '@/components/landing/Features';
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
        <Features />
        <Stats />
        <Cta />
        <Footer />
      </main>
    </div>
  );
}
```

Delete every leftover unused import/state in page.tsx (should be none — file matches above).

- [ ] **Step 3: Dead-code sweep** — Grep `apps/web/src/app/page.tsx` for: `KNOWN_ENTITIES`, `entityFilter`, `codeTab`, `getCodeSnippet`, `pulseStep`, `copiedAddress`. Expected: zero matches. Grep `src/components/landing/*.tsx` for the same: zero matches.

Run: `pnpm --filter @tracehop/web exec eslint src/components/landing src/app/page.tsx src/lib`
Expected: no errors (warnings acceptable)

- [ ] **Step 4: Build** — `pnpm --filter @tracehop/web build`. Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add apps/web/src/components/landing/Navbar.tsx apps/web/src/app/page.tsx
git commit -m "refactor: extract Navbar with hide-on-scroll, finalize page composer"
```

---

### Task 12: Full verification pass

**Files:**
- Modify: only whatever the checks surface as broken

**Interfaces:** N/A (verification task)

- [ ] **Step 1: Build + lint**

```bash
pnpm --filter @tracehop/web build
pnpm --filter @tracehop/web exec eslint src/components/landing src/app/page.tsx src/lib
```
Expected: PASS both.

- [ ] **Step 2: Browser visual regression**

Start dev server. Using Playwright/browser tooling:
1. Load `/` — screenshot hero. Compare with `screenshot_hero.png` (repo root): layout identical (minor entrance-animation timing differences acceptable; resting state must match).
2. Scroll through all sections: navbar hides down/reveals up; demo columns reveal; engine cards stagger + bar scrubs 20%→100%; why cards spotlight on hover; features graph draws; stats count up; CTA glows.
3. Resize to 390px width: no horizontal scrollbar (`document.documentElement.scrollWidth <= window.innerWidth`).
4. Emulate `prefers-reduced-motion: reduce`, reload: page static but fully readable, stats show final values.

- [ ] **Step 3: Fix findings** — any visual/functional break found gets fixed in the owning component, rebuild, re-check.

- [ ] **Step 4: Commit fixes if any**

```bash
git add -A apps/web/src
git commit -m "fix: address landing refactor verification findings"
```

---

## Self-Review Notes

- **Spec coverage:** file split ✓ (Tasks 2–11), dead code ✓ (Tasks 1, 8, 11), GSAP per-section table ✓ (Tasks 3–11), reduced-motion ✓ (every effect), hero frozen ✓ (Tasks 9–10 wrapper-only + verbatim), verification ✓ (Task 12 + per-task builds).
- **Type consistency:** `PresetToken`/`NodeInfo` exported from `@/lib/landing` (Task 1) and consumed in Tasks 8–11 consistently; `registerScanner(fn)` signature identical in Task 8 definition and Task 11 usage; `MotionValue<number>` props defined Task 9, passed Task 10.
- **Deliberate deviation from strict TDD:** web app has no unit-test harness (tests live in `packages/core` only); per-task verification = production build + targeted greps + browser visual check. Adding a test framework for a one-shot visual refactor is out of scope per spec.
