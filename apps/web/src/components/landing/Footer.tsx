'use client';

import { FaTelegramPlane, FaGithub, FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { scrollToSection } from '@/lib/landing';

export function Footer() {
  return (
    <footer className="relative pt-16 pb-12 text-xs font-sans text-[#94a3b8] bg-[#050212] border-t border-[#1a1236]">
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pb-12 border-b border-[#1f1642]/80">
          
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col items-start">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('top');
              }}
              className="group flex items-center gap-3 select-none mb-3.5 transition-transform duration-200 hover:scale-105"
            >
              <img
                src="/assets/rabbit-minimal.webp"
                alt="Tracehop Logo Mascot"
                width={32}
                height={32}
                className="w-[32px] h-[32px] object-contain shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.35)]"
              />
              <div className="relative inline-flex items-baseline font-display font-extrabold text-[24px] sm:text-[26px] tracking-tight leading-none">
                <span className="text-white">Trace</span>
                <span className="bg-gradient-to-br from-[#ff9548] to-[#ff601c] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,120,40,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(255,120,40,0.6)] transition-all">
                  hop
                </span>
                {/* Micro dotted animated trail matching Navbar */}
                <svg className="absolute -bottom-1 -right-1.5 w-7 h-2.5 overflow-visible pointer-events-none" viewBox="0 0 24 8" fill="none">
                  <path d="M1 2 C6 6, 14 6, 20 2" stroke="#ff7a29" strokeWidth="1.3" strokeDasharray="2 2" strokeLinecap="round" className="animate-flowTrail opacity-90" />
                  <circle cx="20" cy="2" r="1.3" fill="#ff7a29" className="animate-pulseDot drop-shadow-[0_0_5px_#ff7a29]" />
                </svg>
              </div>
            </a>
            <p className="text-[#94a3b8] leading-relaxed max-w-sm mb-5 text-xs">
              Onchain intelligence engine that reveals the truth behind every token.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 text-white">
              <a
                href="https://t.me/TraceHopAgentBot"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="w-8 h-8 rounded-lg bg-[#0e0a22] hover:bg-[#7c3aed] text-[#94a3b8] hover:text-white flex items-center justify-center transition-all border border-[#251c47]"
              >
                <FaTelegramPlane className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://x.com/TraceHop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-8 h-8 rounded-lg bg-[#0e0a22] hover:bg-[#7c3aed] text-[#94a3b8] hover:text-white flex items-center justify-center transition-all border border-[#251c47]"
              >
                <FaXTwitter className="w-3 h-3" />
              </a>
              <a
                href="https://github.com/sifaq00/tracehop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg bg-[#0e0a22] hover:bg-[#7c3aed] text-[#94a3b8] hover:text-white flex items-center justify-center transition-all border border-[#251c47]"
              >
                <FaGithub className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
                className="w-8 h-8 rounded-lg bg-[#0e0a22] hover:bg-[#7c3aed] text-[#94a3b8] hover:text-white flex items-center justify-center transition-all border border-[#251c47]"
              >
                <FaDiscord className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
            <h5 className="font-bold text-white font-mono text-xs uppercase tracking-wider mb-1">PRODUCT</h5>
            <a href="#demo" onClick={(e) => { e.preventDefault(); scrollToSection('demo'); }} className="hover:text-white transition-colors">Live Demo</a>
            <a href="#engine" onClick={(e) => { e.preventDefault(); scrollToSection('engine'); }} className="hover:text-white transition-colors">Features</a>
            <a href="#api" onClick={(e) => { e.preventDefault(); scrollToSection('api'); }} className="hover:text-white transition-colors">API</a>
            <a href="#why" onClick={(e) => { e.preventDefault(); scrollToSection('why'); }} className="hover:text-white transition-colors">Docs</a>
          </div>

          {/* Developers */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
            <h5 className="font-bold text-white font-mono text-xs uppercase tracking-wider mb-1">DEVELOPERS</h5>
            <a href="#api" onClick={(e) => { e.preventDefault(); scrollToSection('api'); }} className="hover:text-white transition-colors">API Reference</a>
            <a href="#api" onClick={(e) => { e.preventDefault(); scrollToSection('api'); }} className="hover:text-white transition-colors">Integration Guide</a>
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px] mt-0.5">
              <span>API Status</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Resources */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
            <h5 className="font-bold text-white font-mono text-xs uppercase tracking-wider mb-1">RESOURCES</h5>
            <a href="#" className="hover:text-white transition-colors">Blog</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Changelog</a>
          </div>

          {/* Join the Movement */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
            <h5 className="font-bold text-white font-mono text-xs uppercase tracking-wider mb-1">JOIN THE MOVEMENT</h5>
            <a
              href="https://t.me/TraceHopAgentBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-[#0e0a22] hover:bg-[#181138] border border-[#251c47] text-white text-xs font-medium transition-all"
            >
              <FaTelegramPlane className="w-3.5 h-3.5 text-[#2AABEE]" />
              <span>Telegram Community</span>
            </a>
            <a
              href="https://x.com/TraceHop"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-2 px-3.5 rounded-xl bg-[#0e0a22] hover:bg-[#181138] border border-[#251c47] text-white text-xs font-medium transition-all"
            >
              <FaXTwitter className="w-3.5 h-3.5 text-white" />
              <span>Follow on X</span>
            </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#64748b] text-[11px]">
          <p>&copy; 2024 Tracehop. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Disclaimer</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
