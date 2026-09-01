'use client';

import { Zap, FileText } from 'lucide-react';

export function Cta() {
  return (
    <section id="api" className="relative py-20 sm:py-28 overflow-hidden">
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="relative p-8 sm:p-14 rounded-3xl bg-gradient-to-b from-[#140c33] to-[#090618] border border-[#7c3aed]/40 shadow-[0_0_25px_rgba(124,58,237,0.15)] flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 overflow-hidden animate-ctaGlow">
          {/* Leaping Rabbit on Left with Loop Trail */}
          <div className="flex items-center gap-4 shrink-0">
            <img
              src="/assets/rabbit-minimal.webp"
              alt="Tracehop Mascot"
              className="w-16 sm:w-24 h-auto object-contain drop-shadow-[0_0_10px_rgba(255,122,41,0.3)] select-none"
            />
          </div>

          {/* Center Content */}
          <div className="text-center lg:text-left flex-1">
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight mb-3">
              Stop <span className="italic text-[#c084fc]">gambling</span>. Start <span className="italic text-[#ff7a29]">tracing</span>.
            </h2>
            <p className="text-[#cbd5e1] text-sm sm:text-base leading-relaxed mb-6 max-w-xl">
              Get Tracehop API and build with the best onchain intelligence engine.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 font-sans">
              <a
                href="#api"
                className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] hover:from-[#8b5cf6] hover:to-[#7c3aed] text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_10px_rgba(124,58,237,0.3)] transition-all"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>GET API ACCESS</span>
              </a>

              <a
                href="#api"
                className="inline-flex items-center gap-2.5 h-12 px-7 rounded-xl bg-[#0e0a22] hover:bg-[#181138] border border-[#2c2054] text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                <FileText className="w-4 h-4 text-[#c4b5fd]" />
                <span>VIEW API DOCS</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
