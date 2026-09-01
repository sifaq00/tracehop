'use client';

import { useRef, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { FaTelegramPlane } from 'react-icons/fa';
import { Smartphone, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(graphRef, { once: true, amount: 0.3 });

  // SVG line draw-on when in view
  useEffect(() => {
    if (!isInView || !graphRef.current) return;
    const lines = graphRef.current.querySelectorAll<SVGLineElement>('line[data-funding-line]');
    lines.forEach((line, i) => {
      const len = line.getTotalLength();
      line.style.strokeDasharray = `${len}`;
      line.style.strokeDashoffset = `${len}`;
      line.style.transition = `stroke-dashoffset 0.9s ease-in-out ${0.4 + i * 0.1}s`;
      requestAnimationFrame(() => {
        line.style.strokeDashoffset = '0';
      });
    });
  }, [isInView]);

  return (
    <section ref={sectionRef} id="features" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Left Column: Telegram Integration */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#0e0a22]/90 border border-[#2c2054] shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2">
                TELEGRAM INTEGRATION
              </div>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-2">
                Scan <span className="italic text-[#38bdf8]">anywhere</span>, anytime.
              </h3>
              <p className="text-xs sm:text-sm text-[#94a3b8] mb-5">
                Drop a token in Telegram. Tracehop does the rest.
              </p>
            </div>

            <a
              href="https://t.me/TraceHopAgentBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-gradient-to-r from-[#2AABEE] to-[#229ED9] hover:from-[#38bdf8] hover:to-[#2AABEE] text-white font-bold text-xs uppercase tracking-wider shadow-[0_0_8px_rgba(42,171,238,0.25)] transition-all mb-6 w-fit"
            >
              <FaTelegramPlane className="w-4 h-4" />
              OPEN TELEGRAM BOT
            </a>

            <div className="relative p-4 rounded-2xl bg-[#0c081e] border border-[#1c2938] font-mono text-[11px] text-[#94a3b8]">
              <div className="text-[#7c3aed] mb-1">&lt; Tracehop Bot</div>
              <div className="text-white mb-3">/scan So111...1112</div>

              <div className="text-white mb-2 font-semibold">Analyzing token: So111...1112</div>
              <div className="space-y-1.5">
                {['Deployer Located', 'Funding Graph', 'Risk Patterns', 'LP Lock Check', 'Honeypot Check', 'Known Entity Match'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#1c2938]">
                <div className="text-[#94a3b8] text-[10px]">Verdict</div>
                <div className="inline-flex items-center gap-1.5 text-amber-400 font-bold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>CAUTION</span>
                </div>
                <p className="text-[10px] text-[#94a3b8] mt-0.5">High cluster concentration &amp; dev wallet activity.</p>
                <span className="text-[9px] text-[#64748b] block text-right mt-1">12:30</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Funding Graph Preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#0e0a22]/90 border border-[#2c2054] shadow-2xl flex flex-col justify-between"
          >
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#a855f7] mb-2">
                FUNDING GRAPH PREVIEW
              </div>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight mb-5">
                We map the flow. You see the <span className="italic text-[#ff7a29]">truth.</span>
              </h3>
            </div>

            {/* SVG Graph */}
            <div ref={graphRef} className="relative w-full h-[230px] sm:h-[250px] rounded-2xl bg-[#070514] border border-[#2c2054] overflow-hidden flex items-center justify-center mb-5">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 240">
                <line data-funding-line x1="120" y1="120" x2="220" y2="80" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.6" />
                <line data-funding-line x1="120" y1="120" x2="220" y2="160" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.6" />
                <line data-funding-line x1="220" y1="80" x2="340" y2="60" stroke="#ff7a29" strokeWidth="1.5" strokeOpacity="0.6" />
                <line data-funding-line x1="220" y1="80" x2="340" y2="110" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.6" />
                <line data-funding-line x1="220" y1="160" x2="340" y2="160" stroke="#7c3aed" strokeWidth="1.5" strokeOpacity="0.6" />
                <line data-funding-line x1="220" y1="160" x2="340" y2="200" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.6" />

                {/* Nodes */}
                <circle cx="120" cy="120" r="10" fill="#ff7a29" className="animate-pulse" />
                <circle cx="220" cy="80" r="8" fill="#a855f7" />
                <circle cx="220" cy="160" r="8" fill="#a855f7" />
                <circle cx="340" cy="60" r="7" fill="#ffffff" />
                <circle cx="340" cy="110" r="7" fill="#38bdf8" />
                <circle cx="340" cy="160" r="7" fill="#ffffff" />
                <circle cx="340" cy="200" r="7" fill="#06b6d4" />
              </svg>
            </div>

            {/* Graph Legend */}
            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-[#94a3b8]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff7a29]" />
                <span>Deployer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]" />
                <span>Intermediary</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white" />
                <span>EOA Wallet</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#38bdf8]" />
                <span>Exchange / CEX</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06b6d4]" />
                <span>Liquidity</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#ff7a29]">--&gt;</span>
                <span>Flow Direction</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
