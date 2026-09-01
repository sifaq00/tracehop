'use client';

import { FaTelegramPlane, FaGithub, FaDiscord } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { scrollToSection } from '@/lib/landing';

export function Footer() {
  return (
    <footer className="relative pt-16 pb-12 text-xs font-sans text-[#94a3b8] border-t border-[#1e153d]/80 bg-[#070414]/90 backdrop-blur-md">
      <div className="w-full max-w-[1360px] mx-auto px-6 sm:px-10 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 pb-12 border-b border-[#1f1642]">
          
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col items-start">
            <div className="flex items-center gap-2.5 mb-3.5 select-none">
              <img
                src="/assets/rabbit-minimal.webp"
                alt="Tracehop Logo"
                className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(255,122,41,0.4)]"
              />
              <span className="font-display font-extrabold text-2xl text-white tracking-tight">
                Trace<span className="text-[#ff7a29]">hop</span>
              </span>
            </div>
            <p className="text-[#94a3b8] leading-relaxed max-w-sm mb-5 text-xs sm:text-sm">
              Real-time multi-hop wallet intelligence layer. Revealing hidden funding clusters, deployer syndicates, and wash trading before you ape.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-2 text-white">
              <a
                href="https://t.me/TraceHopAgentBot"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram Bot"
                className="w-9 h-9 rounded-xl bg-[#120d2b] hover:bg-[#2AABEE]/20 hover:border-[#2AABEE]/50 hover:text-[#2AABEE] flex items-center justify-center transition-all border border-[#2c2054] shadow-sm"
              >
                <FaTelegramPlane className="w-4 h-4 text-[#2AABEE]" />
              </a>
              <a
                href="https://x.com/TraceHop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (Twitter)"
                className="w-9 h-9 rounded-xl bg-[#120d2b] hover:bg-[#7c3aed]/20 hover:border-[#7c3aed]/50 hover:text-[#c084fc] flex items-center justify-center transition-all border border-[#2c2054] shadow-sm"
              >
                <FaXTwitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="https://github.com/sifaq00/tracehop"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub Repository"
                className="w-9 h-9 rounded-xl bg-[#120d2b] hover:bg-[#7c3aed]/20 hover:border-[#7c3aed]/50 hover:text-[#c084fc] flex items-center justify-center transition-all border border-[#2c2054] shadow-sm"
              >
                <FaGithub className="w-4 h-4" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord Community"
                className="w-9 h-9 rounded-xl bg-[#120d2b] hover:bg-[#5865F2]/20 hover:border-[#5865F2]/50 hover:text-[#5865F2] flex items-center justify-center transition-all border border-[#2c2054] shadow-sm"
              >
                <FaDiscord className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
            <h5 className="font-bold text-[#a855f7] font-mono text-xs uppercase tracking-wider mb-1">PRODUCT</h5>
            <a href="#demo" onClick={(e) => { e.preventDefault(); scrollToSection('demo'); }} className="hover:text-white transition-colors">Live Scanner</a>
            <a href="#engine" onClick={(e) => { e.preventDefault(); scrollToSection('engine'); }} className="hover:text-white transition-colors">Detection Engine</a>
            <a href="#why" onClick={(e) => { e.preventDefault(); scrollToSection('why'); }} className="hover:text-white transition-colors">Why Tracehop</a>
            <a href="#stats" onClick={(e) => { e.preventDefault(); scrollToSection('stats'); }} className="hover:text-white transition-colors">Accuracy Stats</a>
          </div>

          {/* Developers */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
            <h5 className="font-bold text-[#a855f7] font-mono text-xs uppercase tracking-wider mb-1">DEVELOPERS</h5>
            <a href="#api" onClick={(e) => { e.preventDefault(); scrollToSection('api'); }} className="hover:text-white transition-colors">API Reference</a>
            <a href="#api" onClick={(e) => { e.preventDefault(); scrollToSection('api'); }} className="hover:text-white transition-colors">MCP Server Docs</a>
            <a href="https://github.com/sifaq00/tracehop" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Open Source Repo</a>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] w-fit mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>RPC Layer 99.9%</span>
            </div>
          </div>

          {/* Resources */}
          <div className="md:col-span-2 flex flex-col gap-2.5">
            <h5 className="font-bold text-[#a855f7] font-mono text-xs uppercase tracking-wider mb-1">ECOSYSTEM</h5>
            <a href="https://pump.fun" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Pump.fun Stream</a>
            <a href="https://solana.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Solana Network</a>
            <a href="https://helius.dev" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Helius RPC Nodes</a>
            <a href="https://birdeye.so" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Birdeye Terminal</a>
          </div>

          {/* Telegram Bot Action */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <h5 className="font-bold text-[#a855f7] font-mono text-xs uppercase tracking-wider mb-1">TELEGRAM BOT</h5>
            <p className="text-[11px] text-[#94a3b8] leading-tight">
              Instant scan bot for DMs and Telegram alpha caller groups.
            </p>
            <a
              href="https://t.me/TraceHopAgentBot"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#2AABEE]/20 to-[#7c3aed]/20 hover:from-[#2AABEE]/30 hover:to-[#7c3aed]/30 border border-[#2AABEE]/40 text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(42,171,238,0.2)]"
            >
              <FaTelegramPlane className="w-3.5 h-3.5 text-[#2AABEE]" />
              <span>Launch Bot</span>
            </a>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#64748b] text-[11px] font-mono">
          <p>&copy; 2026 Tracehop Labs. Know before you ape.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Security Disclosures</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
