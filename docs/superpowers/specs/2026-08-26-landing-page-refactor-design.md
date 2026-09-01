# Landing Page Refactor — TraceHop (NoCap)

**Date:** 2026-08-26
**Status:** Approved
**Scope:** `apps/web/src/app/page.tsx` and new files under `apps/web/src/components/landing/`

## Goal

Clean up the 2019-line monolithic landing page and upgrade it with scroll-driven animations (GSAP ScrollTrigger) while keeping the existing dark violet/amber cyber design language intact.

## Hard Constraints

1. **HERO IS FROZEN.** The user hand-crafted the hero section (SVG constellation, interactive wallet nodes, rabbit mascots, portal/radar effects, telemetry ribbon). Its markup, DOM structure, styling, and all existing SVG/CSS animations must be preserved pixel-for-pixel. Moving it to a component file must be a verbatim copy.
2. No visual redesign of any section. Layout, copy, colors stay as-is.
3. Existing framer-motion micro-interactions (hover/tap, AnimatePresence modals, navbar layoutId capsule) keep working.

## Tech Decisions

- **GSAP (+ ScrollTrigger)**: scroll-driven animation only (parallax, reveals, staggers, scrub, count-up). New dependency (~70KB gzipped core; ScrollTrigger included in npm package `gsap`).
- **Framer Motion 12**: stays for hover/tap micro-interactions, presence animations, layout animations. No overlap of responsibilities between the two libraries.
- **Three.js background (`CyberBackgroundCanvas`)**: untouched.

## File Structure

```
apps/web/src/
├── app/page.tsx                  # thin composer + minimal shared state
├── components/landing/
│   ├── Navbar.tsx               # existing nav + hide-on-scroll-down
│   ├── Hero.tsx                 # headline column, CTA, trust badges, telemetry ribbon, scroll indicator
│   ├── HeroConstellation.tsx    # VERBATIM move: giant SVG + nodes + rabbit (frozen)
│   ├── Demo.tsx                 # scanner input, preset chips, result terminal
│   ├── Engine.tsx               # 10-step pipeline cards + live scan bar
│   ├── Why.tsx                  # 6 cards
│   ├── Features.tsx             # telegram mockup + funding graph preview
│   ├── Stats.tsx                # 4 metric cards
│   ├── Cta.tsx                  # API banner
│   └── Footer.tsx
└── lib/
    ├── landing-data.ts          # HERO_NODES, PRESET_TOKENS, NAV_LINKS, pipeline steps, card data
    └── sound-fx.ts              # existing, untouched
```

### Shared state

Lives in `page.tsx`, passed via props:

- `activeNav` / `scrollToSection` — used by Navbar, Hero CTA buttons, Footer links.
- Scan trigger: Hero "Run Live Demo" button scrolls to Demo and starts a preset scan. Implemented by lifting `handleStartScan` trigger into a small shared ref/callback prop (`onStartScan(token?)`) that `page.tsx` forwards to `Demo.tsx`. Demo owns its scan state.

## Dead Code Removal

Delete from current page.tsx (verified unused):

- `KNOWN_ENTITIES` array + `entityFilter`, `entitySearch` states + `filteredEntities` computation (never rendered)
- Code tab feature: `codeTab`, `isCopiedCode`, `getCodeSnippet` (never rendered)
- `copiedAddress`, `handleCopy` (unused)
- `pulseStep` state + its interval (not referenced in JSX)
- Unused lucide-react imports (~15 icons), duplicate comments (e.g. lines 561–562)

## Animation Specification

All GSAP work registers `gsap.registerPlugin(ScrollTrigger)` once in a client-side module. Each section sets up its triggers inside `useEffect` / `useGSAP`-equivalent cleanup pattern (plain `useEffect` return that kills its ScrollTriggers).

| Section | Animation | Library |
|---|---|---|
| Navbar | Hide on scroll down, reveal on scroll up (translateY, no layout shift) | GSAP ScrollTrigger |
| Hero entrance | One-time timeline: badge → headline → subtext → CTAs → badges stagger. Only opacity/transform on existing elements; every element ends at its natural state, so the frozen hero is untouched once settled | GSAP |
| Hero scroll-out | Wrapper-level parallax as hero leaves viewport: constellation layer drifts slower, rabbit layer faster, glows drift; transforms applied to existing wrapper divs only | GSAP ScrollTrigger scrub |
| Demo | Two columns reveal from left/right on enter | GSAP ScrollTrigger |
| Engine | 10 pipeline cards stagger up (ScrollTrigger batch); "62%" progress bar width scrubs 20%→100% while section in view (text label syncs to tween value) | GSAP |
| Why | Cards stagger; spotlight hover: radial gradient follows cursor per card (CSS custom properties + one mousemove handler per card — aceternity-style spotlight, no new dep) | GSAP + CSS |
| Features | Telegram card slides from left, graph card from right; funding-graph SVG lines draw-on via stroke-dashoffset tween | GSAP |
| Stats | Numbers count up when scrolled into view (12,842+ / 98.7% / 3.1s / 24/7 — suffix strings preserved) | GSAP |
| CTA | Subtle glow pulse loop | CSS keyframes |

Framer Motion keeps: all `whileHover`/`whileTap`, node tooltip AnimatePresence, mobile menu, confetti trigger, demo scan log interval.

## Performance & Accessibility

- `gsap.matchMedia()` gate: all scroll/entrance animations registered only when `(prefers-reduced-motion: no-preference)`.
- Transform/opacity-only tweens; no width/height/top/left animation except the progress bar (small element).
- Every `useEffect` that creates ScrollTriggers kills them on unmount (no leaks on HMR/navigation).
- Three.js canvas and hero untouched → no regression to LCP path.

## Verification

1. `pnpm --filter @tracehop/web build` passes.
2. `pnpm --filter @tracehop/web lint` passes.
3. Visual check in browser (dev server): hero identical to current screenshots (`screenshot_hero*.png` at repo root as reference); scroll animations fire once per direction; reduced-motion emulation shows static page.
4. Mobile viewport spot-check: no horizontal overflow introduced.

## Out of Scope

- Any redesign or copy changes
- New sections
- Aceternity component library installation (only the lightweight spotlight-card pattern is hand-implemented)
- Backend/API changes
