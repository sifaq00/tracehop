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
                {/* Interactive SVG Constellation Network & Looping Hop Trail Matching Screenshot 2026-08-22 200606.png */}
                <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none" viewBox="0 0 860 460" preserveAspectRatio="none" fill="none">
                  <defs>
                    {/* Glowing Filters for Moving Light Particles */}
                    <filter id="glowLight" x="-100%" y="-100%" width="300%" height="300%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur1" />
                      <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
                      <feMerge>
                        <feMergeNode in="blur2" />
                        <feMergeNode in="blur1" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <filter id="portalBlur" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
                    </filter>
                    <linearGradient id="amberLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff7a29" stopOpacity="0.85" />
                      <stop offset="50%" stopColor="#ffb347" stopOpacity="1" />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity="0.9" />
                    </linearGradient>
                    <radialGradient id="portalGlowGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ff7a29" stopOpacity="0.55" />
                      <stop offset="45%" stopColor="#7c3aed" stopOpacity="0.38" />
                      <stop offset="85%" stopColor="#38bdf8" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#06040d" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="portalCoreGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                      <stop offset="35%" stopColor="#ffb347" stopOpacity="0.85" />
                      <stop offset="70%" stopColor="#ff7a29" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="radarLineBeam" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
                      <stop offset="40%" stopColor="#c084fc" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
                    </linearGradient>
                    <linearGradient id="radarSweepWedge" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                      <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.16" />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="solGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00FFA3" />
                      <stop offset="100%" stopColor="#DC1FFF" />
                    </linearGradient>
                  </defs>

                  {/* ===== 1. WARP PORTAL & COSMIC AURA BEHIND RABBIT ===== */}
                  <g id="rabbitPortalAura">
                    {/* Deep Cosmic Aura Halo */}
                    <ellipse cx="180" cy="235" rx="170" ry="110" fill="url(#portalGlowGrad)" filter="url(#portalBlur)" />

                    {/* Orbiting Tech Warp Rings */}
                    <ellipse cx="175" cy="240" rx="125" ry="68" fill="none" stroke="#ff7a29" strokeWidth="1.6" strokeDasharray="5 7" strokeOpacity="0.65" transform="rotate(-18 175 240)">
                      <animateTransform attributeName="transform" type="rotate" from="-18 175 240" to="342 175 240" dur="24s" repeatCount="indefinite" />
                    </ellipse>
                    <ellipse cx="175" cy="240" rx="90" ry="46" fill="none" stroke="#c084fc" strokeWidth="1.6" strokeDasharray="4 6" strokeOpacity="0.75" transform="rotate(22 175 240)">
                      <animateTransform attributeName="transform" type="rotate" from="22 175 240" to="-338 175 240" dur="16s" repeatCount="indefinite" />
                    </ellipse>

                    {/* Luminous Core Star */}
                    <circle cx="175" cy="240" r="28" fill="url(#portalCoreGrad)">
                      <animate attributeName="r" values="22; 34; 22" dur="3.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.7; 0.95; 0.7" dur="3.5s" repeatCount="indefinite" />
                    </circle>

                    {/* Floating Forensic Micro Tags */}
                    <text x="110" y="165" fill="#ffb347" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.65" letterSpacing="0.08em">HOP:ORIGIN</text>
                    <text x="240" y="170" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.65" letterSpacing="0.08em">TX_BURST</text>
                    <text x="75" y="325" fill="#c084fc" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.55" letterSpacing="0.08em">0x38b...9f42</text>
                  </g>

                  {/* ===== 2. ONCHAIN RADAR SONAR RINGS & BACKGROUND SWEEP ===== */}
                  <g id="radarSonarBackdrop">
                    {/* Radar Center Pulse */}
                    <circle cx="640" cy="220" r="4" fill="#38bdf8" opacity="0.9" filter="url(#glowLight)" />
                    <circle cx="640" cy="220" r="10" fill="none" stroke="#38bdf8" strokeWidth="1.5" opacity="0.6">
                      <animate attributeName="r" values="4; 30; 4" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8; 0; 0.8" dur="3s" repeatCount="indefinite" />
                    </circle>

                    {/* Concentric Dashed Sonar Rings (Vivid & Crisp) */}
                    <circle cx="640" cy="220" r="80" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="4 5" strokeOpacity="0.48" fill="none" />
                    {/* Pentagon Orbit Ring (r=155) */}
                    <circle cx="640" cy="220" r="155" stroke="#38bdf8" strokeWidth="1.6" strokeDasharray="6 6" strokeOpacity="0.55" fill="none" className="drop-shadow-[0_0_4px_rgba(56,189,248,0.2)]" />
                    <circle cx="640" cy="220" r="230" stroke="#a855f7" strokeWidth="1.4" strokeDasharray="7 9" strokeOpacity="0.38" fill="none" />
                    <circle cx="640" cy="220" r="305" stroke="#7c3aed" strokeWidth="1.3" strokeDasharray="9 12" strokeOpacity="0.28" fill="none" />

                    {/* 5 Pentagon Radar Radial Spokes connecting center directly to the 5 vertices */}
                    <line x1="640" y1="220" x2="640" y2="-65" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.4" />
                    <line x1="640" y1="220" x2="911" y2="132" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.4" />
                    <line x1="640" y1="220" x2="808" y2="451" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.4" />
                    <line x1="640" y1="220" x2="472" y2="451" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.4" />
                    <line x1="640" y1="220" x2="369" y2="132" stroke="#38bdf8" strokeWidth="1" strokeDasharray="4 6" strokeOpacity="0.4" />

                    {/* Crosshair Horizontal & Vertical Axes */}
                    <line x1="330" y1="220" x2="950" y2="220" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="3 7" strokeOpacity="0.25" />

                    {/* HOP Range Distance Labels */}
                    <text x="646" y="145" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.7" letterSpacing="0.1em">1-HOP</text>
                    <text x="646" y="72" fill="#c084fc" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.6" letterSpacing="0.1em">2-HOP (ORBIT)</text>
                    <text x="646" y="-2" fill="#a855f7" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.5" letterSpacing="0.1em">3-HOP</text>

                    {/* Smooth 360° Rotating Radar Sweep (Beam & Wedge Fan) */}
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 640 220"
                        to="360 640 220"
                        dur="6.2s"
                        repeatCount="indefinite"
                      />
                      {/* Radar Fan Wedge */}
                      <path
                        d="M 640 220 L 910 110 A 305 305 0 0 1 945 220 Z"
                        fill="url(#radarSweepWedge)"
                      />
                      {/* Leading Radar Beam Line */}
                      <line
                        x1="640"
                        y1="220"
                        x2="945"
                        y2="220"
                        stroke="url(#radarLineBeam)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        className="drop-shadow-[0_0_6px_#38bdf8]"
                      />
                      {/* Blip Dot at Leading Edge */}
                      <circle
                        cx="945"
                        cy="220"
                        r="3.2"
                        fill="#ffffff"
                        filter="url(#glowLight)"
                      />
                    </g>

                    {/* Background Forensic Matrix Floating Chips */}
                    <text x="815" y="90" fill="#34d399" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.6" letterSpacing="0.08em">AMM:RAYDIUM</text>
                    <text x="760" y="325" fill="#f43f5e" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.6" letterSpacing="0.08em">FLAG:EXPLOIT</text>
                    <text x="480" y="95" fill="#c084fc" fontSize="8" fontFamily="monospace" fontWeight="bold" opacity="0.6" letterSpacing="0.08em">CLUSTER:PENTAGON</text>
                  </g>

                  {/* ===== REGULAR PENTAGON (SEGI-5) CONSTELLATION GRAPH LINES ===== */}
                  {/* Outer Pentagon Perimeter Segments */}
                  <line x1="493" y1="172" x2="640" y2="65" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.8" />
                  <line x1="640" y1="65" x2="787" y2="172" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.8" />
                  <line x1="787" y1="172" x2="731" y2="345" stroke="#ff4d4d" strokeWidth="2.2" strokeOpacity="0.85" />
                  <line x1="731" y1="345" x2="549" y2="345" stroke="#ff4d4d" strokeWidth="2.2" strokeOpacity="0.85" />
                  <line x1="549" y1="345" x2="493" y2="172" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.8" />

                  {/* Internal Spokes to Center Node D (640, 220) */}
                  <line x1="640" y1="220" x2="640" y2="65" stroke="#7c3aed" strokeWidth="1.6" strokeOpacity="0.5" />
                  <line x1="640" y1="220" x2="787" y2="172" stroke="#7c3aed" strokeWidth="1.6" strokeOpacity="0.5" />
                  <line x1="640" y1="220" x2="731" y2="345" stroke="#ff4d4d" strokeWidth="1.8" strokeOpacity="0.7" />
                  <line x1="640" y1="220" x2="549" y2="345" stroke="#7c3aed" strokeWidth="1.6" strokeOpacity="0.5" />
                  <line x1="640" y1="220" x2="493" y2="172" stroke="#7c3aed" strokeWidth="1.6" strokeOpacity="0.5" />

                  {/* Inflow Connectors from Node A (390, 300) into Pentagon */}
                  <line x1="390" y1="300" x2="493" y2="172" stroke="#c084fc" strokeWidth="2" strokeOpacity="0.8" />
                  <line x1="390" y1="300" x2="549" y2="345" stroke="#ff7a29" strokeWidth="2" strokeOpacity="0.8" />

                  {/* ===== 1. AMBER HOP TRAIL (SOLID LINE - Clean Flow from Rabbit to Node A) ===== */}
                  <path
                    id="hopTrailStart"
                    d="M 30 270 C 30 335, 75 345, 105 345 C 135 345, 150 275, 170 240 C 190 210, 210 305, 255 305 C 295 305, 335 275, 390 300"
                    stroke="url(#amberLineGrad)"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    className="opacity-95 drop-shadow-[0_0_6px_rgba(255,122,41,0.4)]"
                  />

                  {/* Sparkle Vector Behind Rabbit Rear Paws */}
                  <g transform="translate(170, 240)">
                    <path
                      d="M 0 -8 L 2.5 -2.5 L 8 0 L 2.5 2.5 L 0 8 L -2.5 2.5 L -8 0 L -2.5 -2.5 Z"
                      fill="#ffb347"
                      className="animate-pulse drop-shadow-[0_0_4px_#ff7a29]"
                    />
                  </g>

                  {/* ===== EXACTLY 3 SYNCHRONIZED MOVING LIGHT PACKETS PER CYCLE ===== */}
                  {/* Light Packet 1 (Upper Pentagon Perimeter: Rabbit -> A [1.665s] -> B [2.205s] -> C [2.804s] -> G [3.402s] -> Danger F [4.000s/0.000s]) */}
                  <g>
                    {/* Outer Glow Halo */}
                    <circle r="10" fill="#ff7a29" opacity="0.85" filter="url(#glowLight)">
                      <animateMotion
                        path="M 30 270 C 30 335, 75 345, 105 345 C 135 345, 150 275, 170 240 C 190 210, 210 305, 255 305 C 295 305, 335 275, 390 300 L 493 172 L 640 65 L 787 172 L 731 345"
                        dur="4.0s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Inner Intense White Core */}
                    <circle r="4.5" fill="#ffffff" filter="url(#glowLight)">
                      <animateMotion
                        path="M 30 270 C 30 335, 75 345, 105 345 C 135 345, 150 275, 170 240 C 190 210, 210 305, 255 305 C 295 305, 335 275, 390 300 L 493 172 L 640 65 L 787 172 L 731 345"
                        dur="4.0s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>

                  {/* Branch Packet 3 (Cross-Hub Probe: Node B [2.205s] -> CENTER NODE D [2.705s] -> Node G [3.205s]) */}
                  <g>
                    <circle r="8" fill="#38bdf8" opacity="0.9" filter="url(#glowLight)">
                      <animateMotion
                        path="M 493 172 L 640 220 L 787 172"
                        dur="4.0s"
                        begin="2.205s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle r="3.8" fill="#ffffff" filter="url(#glowLight)">
                      <animateMotion
                        path="M 493 172 L 640 220 L 787 172"
                        dur="4.0s"
                        begin="2.205s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>

                  {/* Light Packet 2 (Central Infiltration: Rabbit -> Node A [0.065s] -> Node E [0.739s] -> CENTER NODE D [1.369s] -> Danger Node F [2.000s]) */}
                  <g>
                    <circle r="10" fill="#c084fc" opacity="0.85" filter="url(#glowLight)">
                      <animateMotion
                        path="M 30 270 C 30 335, 75 345, 105 345 C 135 345, 150 275, 170 240 C 190 210, 210 305, 255 305 C 295 305, 335 275, 390 300 L 549 345 L 640 220 L 731 345"
                        dur="4.0s"
                        begin="2.0s"
                        repeatCount="indefinite"
                      />
                    </circle>
                    <circle r="4.5" fill="#ffffff" filter="url(#glowLight)">
                      <animateMotion
                        path="M 30 270 C 30 335, 75 345, 105 345 C 135 345, 150 275, 170 240 C 190 210, 210 305, 255 305 C 295 305, 335 275, 390 300 L 549 345 L 640 220 L 731 345"
                        dur="4.0s"
                        begin="2.0s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>

                  {/* ===== SYNCHRONIZED SVG GLOW SHOCKWAVES (EXACT TIMING CALIBRATION) ===== */}
                  {/* Node A (390, 300) - Shockwave hit at 0.065s [Light 2] & 1.665s [Light 1] */}
                  <circle cx="390" cy="300" r="22" fill="none" stroke="#c084fc" strokeWidth="2.8" opacity="0">
                    <animate attributeName="r" values="22; 22; 38; 54; 22; 38; 54; 22" keyTimes="0; 0.009; 0.036; 0.104; 0.409; 0.436; 0.504; 1" dur="4.0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0; 0; 1; 0; 0; 1; 0; 0" keyTimes="0; 0.009; 0.036; 0.104; 0.409; 0.436; 0.504; 1" dur="4.0s" repeatCount="indefinite" />
                  </circle>

                  {/* Node E Sybil (549, 345) - Shockwave hit at 0.739s [Light 2] */}
                  <circle cx="549" cy="345" r="22" fill="none" stroke="#ff7a29" strokeWidth="2.8" opacity="0">
                    <animate attributeName="r" values="22; 22; 38; 54; 22" keyTimes="0; 0.177; 0.205; 0.272; 1" dur="4.0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0; 0; 1; 0; 0" keyTimes="0; 0.177; 0.205; 0.272; 1" dur="4.0s" repeatCount="indefinite" />
                  </circle>

                  {/* Danger Node F ⚠️ (731, 345) - Dual Shockwave hit at 0.000s/4.000s [Light 1] and 2.000s [Light 2] */}
                  <circle cx="731" cy="345" r="28" fill="none" stroke="#f43f5e" strokeWidth="3.8" opacity="0">
                    <animate attributeName="r" values="28; 50; 72; 28; 50; 72; 28" keyTimes="0; 0.020; 0.087; 0.492; 0.520; 0.588; 1" dur="4.0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0; 1; 0; 0; 1; 0; 0" keyTimes="0; 0.020; 0.087; 0.492; 0.520; 0.588; 1" dur="4.0s" repeatCount="indefinite" />
                  </circle>

                  {/* Node B (493, 172) - Shockwave hit at 2.205s [Light 1] */}
                  <circle cx="493" cy="172" r="22" fill="none" stroke="#c084fc" strokeWidth="2.8" opacity="0">
                    <animate attributeName="r" values="22; 22; 38; 54; 22" keyTimes="0; 0.544; 0.571; 0.639; 1" dur="4.0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0; 0; 1; 0; 0" keyTimes="0; 0.544; 0.571; 0.639; 1" dur="4.0s" repeatCount="indefinite" />
                  </circle>

                  {/* Node D Center (640, 220) - Dual Shockwave hit at 1.369s [Light 2] & 2.705s [Branch 3] */}
                  <circle cx="640" cy="220" r="26" fill="none" stroke="#a855f7" strokeWidth="3.4" opacity="0">
                    <animate attributeName="r" values="26; 26; 45; 64; 26; 45; 64; 26" keyTimes="0; 0.335; 0.362; 0.430; 0.669; 0.696; 0.764; 1" dur="4.0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0; 0; 1; 0; 0; 1; 0; 0" keyTimes="0; 0.335; 0.362; 0.430; 0.669; 0.696; 0.764; 1" dur="4.0s" repeatCount="indefinite" />
                  </circle>

                  {/* Node C Top (640, 65) - Shockwave hit at 2.804s [Light 1] */}
                  <circle cx="640" cy="65" r="22" fill="none" stroke="#c084fc" strokeWidth="2.8" opacity="0">
                    <animate attributeName="r" values="22; 22; 38; 54; 22" keyTimes="0; 0.694; 0.721; 0.788; 1" dur="4.0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0; 0; 1; 0; 0" keyTimes="0; 0.694; 0.721; 0.788; 1" dur="4.0s" repeatCount="indefinite" />
                  </circle>

                  {/* Node G Right (787, 172) - Shockwave hit at 3.205s [Branch 3] / 3.402s [Light 1] */}
                  <circle cx="787" cy="172" r="22" fill="none" stroke="#c084fc" strokeWidth="2.8" opacity="0">
                    <animate attributeName="r" values="22; 22; 38; 54; 22" keyTimes="0; 0.818; 0.845; 0.912; 1" dur="4.0s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0; 0; 1; 0; 0" keyTimes="0; 0.818; 0.845; 0.912; 1" dur="4.0s" repeatCount="indefinite" />
                  </circle>

                  {/* Fixed Accent Dots along U-curve */}
                  <circle cx="30" cy="270" r="3" fill="#ff7a29" className="drop-shadow-[0_0_8px_#ff7a29]" />
                  <circle cx="105" cy="345" r="3.5" fill="#ff7a29" className="drop-shadow-[0_0_8px_#ff7a29]" />
                  <circle cx="255" cy="305" r="4" fill="#ff7a29" className="drop-shadow-[0_0_8px_#ff7a29]" />
                  <circle cx="335" cy="275" r="3.5" fill="#ff7a29" className="drop-shadow-[0_0_8px_#ff7a29]" />
                </svg>

                {/* ===== LEAPING RABBIT MASCOT (Rendered in background layer z-15) ===== */}
                <motion.div
                  style={{ x: rabbitMoveX, y: rabbitMoveY }}
                  animate={{
                    y: isHoveringRabbit ? [-3, 3, -3] : [0, -10, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 4.2,
                    ease: 'easeInOut',
                  }}
                  onMouseEnter={() => setIsHoveringRabbit(true)}
                  onMouseLeave={() => setIsHoveringRabbit(false)}
                  className="absolute left-[3%] sm:left-[4%] -top-[2%] sm:-top-[3%] z-15 w-[215px] sm:w-[240px] md:w-[260px] cursor-pointer select-none pointer-events-auto"
                >
                  <img
                    src="/assets/rabbit-leaping.webp"
                    alt="Tracehop Leaping Rabbit Mascot"
                    className="w-full h-auto object-contain drop-shadow-[0_12px_25px_rgba(124,58,237,0.25)] transition-transform duration-300 hover:scale-105"
                  />
                </motion.div>

                {/* ===== INTERACTIVE WALLET NODES (Foreground layer z-30, 100% Accessible) ===== */}
                {HERO_NODES.map((node) => {
                  const isDanger = node.risk === 'DANGER';
                  const isCenter = node.id === 'node-d-center';

                  // Dynamic high-fidelity official Web3 protocol logos & wallet badges
                  let discBorderClass = 'w-10 h-10 sm:w-12 sm:h-12 bg-[#150d36]/90 border-[#7c3aed] shadow-[0_0_8px_rgba(124,58,237,0.3)]';
                  let NodeEmblem: React.ReactNode = null;

                  if (isDanger) {
                    // Official Tornado Cash Mixer Vortex Emblem
                    discBorderClass = 'w-14 h-14 sm:w-16 sm:h-16 bg-[#2b0c16]/95 border-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]';
                    NodeEmblem = (
                      <svg viewBox="0 0 24 24" className="w-8 h-8 drop-shadow-[0_0_7px_rgba(244,63,94,0.55)]" fill="none">
                        <circle cx="12" cy="12" r="10" fill="#2B0C16" stroke="#F43F5E" strokeWidth="2" />
                        <path d="M12 4C7.58 4 4 7.58 4 12C4 13.78 4.58 15.42 5.57 16.75L7.02 15.3C6.38 14.39 6 13.24 6 12C6 8.69 8.69 6 12 6C13.24 6 14.39 6.38 15.3 7.02L16.75 5.57C15.42 4.58 13.78 4 12 4ZM18.43 7.25L16.98 8.7C17.62 9.61 18 10.76 18 12C18 15.31 15.31 18 12 18C10.76 18 9.61 17.62 8.7 16.98L7.25 18.43C8.58 19.42 10.22 20 12 20C16.42 20 20 16.42 20 12C20 10.22 19.42 8.58 18.43 7.25Z" fill="#F43F5E" />
                        <circle cx="12" cy="12" r="2.5" fill="#FBBF24" />
                      </svg>
                    );
                  } else if (isCenter) {
                    // Official TraceHop Core Mascot Emblem
                    discBorderClass = 'w-13 h-13 sm:w-15 sm:h-15 bg-[#1b0d38]/95 border-fuchsia-400/90 shadow-[0_0_10px_rgba(192,132,252,0.45)]';
                    NodeEmblem = (
                      <img
                        src="/assets/rabbit-minimal.webp"
                        alt="TraceHop Core"
                        className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-[0_0_6px_rgba(192,132,252,0.5)] pointer-events-none"
                      />
                    );
                  } else if (node.id === 'node-c-top') {
                    // Official Binance CEX Logo
                    discBorderClass = 'w-10 h-10 sm:w-12 sm:h-12 bg-[#171408]/95 border-[#F0B90B] shadow-[0_0_8px_rgba(240,185,11,0.35)]';
                    NodeEmblem = (
                      <svg viewBox="0 0 124 124" className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_0_5px_rgba(240,185,11,0.5)]" fill="none">
                        <path d="M62 0L35.6 26.4L49.9 40.7L62 28.6L74.1 40.7L88.4 26.4L62 0Z" fill="#F0B90B" />
                        <path d="M0 62L26.4 35.6L40.7 49.9L28.6 62L40.7 74.1L26.4 88.4L0 62Z" fill="#F0B90B" />
                        <path d="M62 124L88.4 97.6L74.1 83.3L62 95.4L49.9 83.3L35.6 97.6L62 124Z" fill="#F0B90B" />
                        <path d="M124 62L97.6 88.4L83.3 74.1L95.4 62L83.3 49.9L97.6 35.6L124 62Z" fill="#F0B90B" />
                        <path d="M62 47.7L47.7 62L62 76.3L76.3 62L62 47.7Z" fill="#F0B90B" />
                      </svg>
                    );
                  } else if (node.id === 'node-g-right') {
                    // Official Raydium DEX AMM Logo
                    discBorderClass = 'w-10 h-10 sm:w-12 sm:h-12 bg-[#09152b]/95 border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.35)]';
                    NodeEmblem = (
                      <svg viewBox="0 0 100 100" className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_0_5px_rgba(34,211,238,0.5)]" fill="none">
                        <path d="M50 10L15 30L50 50L85 30L50 10Z" fill="#22D3EE" />
                        <path d="M15 45L50 65L85 45" stroke="#818CF8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M15 65L50 85L85 65" stroke="#C084FC" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    );
                  } else if (node.id === 'node-b') {
                    // Official Solana Protocol Logo (Speed Slants)
                    discBorderClass = 'w-10 h-10 sm:w-12 sm:h-12 bg-[#12082b]/95 border-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.35)]';
                    NodeEmblem = (
                      <svg viewBox="0 0 397 311" className="w-5 h-5 sm:w-6 sm:h-6 drop-shadow-[0_0_5px_rgba(20,241,149,0.5)]" fill="none">
                        <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#solGrad)" />
                        <path d="M64.6 3.8C67 1.4 70.3 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#solGrad)" />
                        <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#solGrad)" />
                      </svg>
                    );
                  } else if (node.id === 'node-a') {
                    // Official Phantom Origin Wallet
                    discBorderClass = 'w-10 h-10 sm:w-12 sm:h-12 bg-[#181335]/95 border-[#AB9FF2] shadow-[0_0_8px_rgba(171,159,242,0.35)]';
                    NodeEmblem = (
                      <img
                        src="/wallets/phantom.svg"
                        alt="Phantom Wallet"
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-md object-contain drop-shadow-[0_0_4px_rgba(171,159,242,0.5)] pointer-events-none"
                      />
                    );
                  } else if (node.id === 'node-e') {
                    // Official Backpack Sybil Relay Wallet
                    discBorderClass = 'w-10 h-10 sm:w-12 sm:h-12 bg-[#200e04]/95 border-[#e24a4a] shadow-[0_0_8px_rgba(226,74,74,0.35)]';
                    NodeEmblem = (
                      <img
                        src="/wallets/backpack.svg"
                        alt="Backpack Wallet"
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-md object-contain drop-shadow-[0_0_4px_rgba(226,74,74,0.5)] pointer-events-none"
                      />
                    );
                  }

                  const isRightEdge = node.x > 750; // e.g. node-g-right
                  const isLeftEdge = node.x < 420; // e.g. node-a

                  const tooltipHorizontalClass = isRightEdge
                    ? 'right-0 -translate-x-2'
                    : isLeftEdge
                    ? 'left-0 translate-x-2'
                    : 'left-1/2 -translate-x-1/2';

                  const caretHorizontalClass = isRightEdge
                    ? 'right-4'
                    : isLeftEdge
                    ? 'left-4'
                    : 'left-1/2 -translate-x-1/2';

                  return (
                    <div
                      key={node.id}
                      style={{
                        left: `${(node.x / 860) * 100}%`,
                        top: `${(node.y / 460) * 100}%`,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto"
                    >
                      {/* Interactive Hover Sonar Pulse (Option C) */}
                      {activeNode?.id === node.id && (
                        <>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0.9 }}
                            animate={{ scale: [0.8, 1.8, 2.3], opacity: [0.9, 0.4, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
                            className={`absolute inset-0 rounded-full border-2 pointer-events-none ${
                              isDanger
                                ? 'border-rose-500 shadow-[0_0_8px_#f43f5e]'
                                : isCenter
                                ? 'border-fuchsia-400 shadow-[0_0_8px_#e879f9]'
                                : 'border-sky-400 shadow-[0_0_8px_#38bdf8]'
                            }`}
                          />
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0.9 }}
                            animate={{ scale: [0.8, 1.5, 1.9], opacity: [0.9, 0.3, 0] }}
                            transition={{ duration: 1.2, delay: 0.3, repeat: Infinity, ease: 'easeOut' }}
                            className={`absolute inset-0 rounded-full border pointer-events-none ${
                              isDanger ? 'border-amber-400' : 'border-[#c084fc]'
                            }`}
                          />
                        </>
                      )}

                      {/* Node Trigger Button (Option A: Auto-Dismiss on Mouse Leave, Generous Hit Area) */}
                      <button
                        onClick={() => setActiveNode(activeNode?.id === node.id ? null : node)}
                        onMouseEnter={() => setActiveNode(node)}
                        onMouseLeave={() => setActiveNode(null)}
                        type="button"
                        className="relative p-2 -m-2 group cursor-pointer focus:outline-none flex items-center justify-center select-none"
                      >
                        {/* Node Outer Disc */}
                        <motion.div
                          whileHover={{ scale: 1.15 }}
                          className={`rounded-full flex items-center justify-center border-2 transition-all duration-200 ${discBorderClass}`}
                        >
                          {NodeEmblem}
                        </motion.div>
                      </button>

                      {/* Pixel-Perfect Directly Attached Hover Inspector Card (Always Above Node) */}
                      <AnimatePresence>
                        {activeNode?.id === node.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.92, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.92, y: 6 }}
                            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                            className={`absolute bottom-full mb-3.5 ${tooltipHorizontalClass} z-50 w-52 sm:w-56 p-2.5 sm:p-3 rounded-xl bg-[#0d0921]/98 border border-[#7c3aed]/50 backdrop-blur-2xl shadow-[0_12px_28px_rgba(0,0,0,0.9),0_0_18px_rgba(124,58,237,0.4)] pointer-events-none text-left`}
                          >
                            {/* Sleek Beak Pointer Caret Pointing Down */}
                            <div
                              className={`absolute ${caretHorizontalClass} -bottom-1.5 w-2.5 h-2.5 bg-[#0d0921] border-r border-b border-[#7c3aed]/50 rotate-45`}
                            />

                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <span className="font-display font-bold text-[11.5px] sm:text-xs text-white truncate">
                                {node.label}
                              </span>
                              <span
                                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded leading-none ${
                                  node.risk === 'DANGER'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : node.risk === 'WARN'
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                }`}
                              >
                                {node.risk}
                              </span>
                            </div>
                            <div className="text-[10px] font-mono text-[#94a3b8] mb-1">
                              {node.address} · <span className="text-[#cbd5e1] font-medium">{node.balance}</span>
                            </div>
                            <p className="text-[10px] sm:text-[10.5px] text-[#cbd5e1] leading-snug line-clamp-2">
                              {node.details}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
    </>
  );
}
