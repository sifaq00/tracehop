'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { FaTelegramPlane } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Menu, X } from 'lucide-react';
import { WalletButton } from '@/components/WalletButton';
import { NAV_LINKS, scrollToSection, triggerCelebration } from '@/lib/landing';

export function Navbar() {
  const [activeNav, setActiveNav] = useState('top');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll-spy active section detection
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    const sectionIds = ['demo', 'engine', 'why', 'features', 'stats', 'api'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;

      if (window.scrollY < 280) {
        setActiveNav('top');
        return;
      }

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section) {
          const top = section.offsetTop;
          if (scrollPosition >= top) {
            setActiveNav(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navigate = (id: string) => {
    setActiveNav(id);
    setMobileMenuOpen(false);
    scrollToSection(id);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#06040d]/85 border-b border-[#7c3aed]/15 shadow-[0_4px_30px_rgba(0,0,0,0.5)] transition-all duration-300">
      <div className="w-full max-w-[1360px] mx-auto px-4 sm:px-8 lg:px-12 h-[72px] flex items-center justify-between gap-3">
        {/* Brand Logo & Live Network Status */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              triggerCelebration();
              scrollToSection('top');
            }}
            className="group flex items-center gap-3 select-none shrink-0 transition-transform duration-200 hover:scale-105"
          >
            <motion.img
              whileHover={{ rotate: [-6, 6, -3, 0], scale: 1.15 }}
              transition={{ duration: 0.4 }}
              src="/assets/rabbit-minimal.webp"
              alt="Tracehop Logo Mascot"
              width={34}
              height={34}
              className="w-[32px] h-[32px] sm:w-[34px] sm:h-[34px] object-contain shrink-0 drop-shadow-[0_0_8px_rgba(124,58,237,0.35)]"
            />
            <div className="relative inline-flex items-baseline font-display font-extrabold text-[24px] sm:text-[26px] tracking-tight leading-none">
              <span className="text-white">Trace</span>
              <span className="bg-gradient-to-br from-[#ff9548] to-[#ff601c] bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(255,120,40,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(255,120,40,0.6)] transition-all">
                hop
              </span>
              {/* Micro dotted animated trail */}
              <svg className="absolute -bottom-1 -right-1.5 w-7 h-2.5 overflow-visible pointer-events-none" viewBox="0 0 24 8" fill="none">
                <path d="M1 2 C6 6, 14 6, 20 2" stroke="#ff7a29" strokeWidth="1.3" strokeDasharray="2 2" strokeLinecap="round" className="animate-flowTrail opacity-90" />
                <circle cx="20" cy="2" r="1.3" fill="#ff7a29" className="animate-pulseDot drop-shadow-[0_0_5px_#ff7a29]" />
              </svg>
            </div>
          </a>
        </div>

        {/* Center Navigation Links (Visible on >= 1280px) */}
        <LayoutGroup id="navbar-tabs-group">
          <nav className="hidden xl:flex items-center gap-1 p-1 rounded-full bg-[#120d29]/80 border border-[#2a1e4a]/80 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
            {NAV_LINKS.map((link) => {
              const isActive = activeNav === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => navigate(link.id)}
                  type="button"
                  className={`relative px-3.5 py-1.5 rounded-full text-xs xl:text-[12.5px] font-semibold transition-colors duration-200 shrink-0 cursor-pointer select-none ${
                    isActive
                      ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]'
                      : 'text-[#94a3b8] hover:text-[#e2e8f0] hover:bg-white/[0.04]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-capsule"
                      className="absolute inset-0 rounded-full bg-gradient-to-r from-[#7c3aed]/45 to-[#ff7a29]/35 border border-[#ff7a29]/60 shadow-[0_0_6px_rgba(255,122,41,0.2)] -z-10"
                      transition={{
                        type: 'spring',
                        stiffness: 320,
                        damping: 28,
                        mass: 0.5,
                      }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </button>
              );
            })}
          </nav>
        </LayoutGroup>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 font-sans">
          {/* Telegram Pill Button */}
          <motion.a
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.96 }}
            href="https://t.me/TraceHopAgentBot"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 h-[38px] px-3.5 rounded-xl bg-[#120d2b] hover:bg-[#1b143d] border border-[#2c2054] hover:border-[#7c3aed]/60 text-white text-xs font-semibold transition-all duration-200 shadow-sm"
          >
            <FaTelegramPlane className="w-4 h-4 text-[#2AABEE] shrink-0 drop-shadow-[0_0_4px_rgba(42,171,238,0.3)]" />
            <span>Telegram</span>
          </motion.a>

          {/* X (Twitter) Icon Button */}
          <motion.a
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            href="https://x.com/TraceHop"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="hidden md:inline-flex items-center justify-center w-[38px] h-[38px] rounded-xl bg-[#120d2b] hover:bg-[#1b143d] border border-[#2c2054] hover:border-[#7c3aed]/60 text-[#94a3b8] hover:text-white transition-all duration-200 shadow-sm"
          >
            <FaXTwitter className="w-4 h-4 shrink-0" />
          </motion.a>

          {/* Solana & Multi-Chain Connect Wallet Button */}
          <WalletButton />

          {/* Mobile / Tablet Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            aria-label="Toggle Navigation Menu"
            className="xl:hidden inline-flex items-center justify-center w-[38px] h-[38px] rounded-xl bg-[#120d2b] hover:bg-[#1b143d] border border-[#2c2054] hover:border-[#7c3aed]/60 text-white transition-all cursor-pointer shrink-0"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#ff7a29]" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Navigation Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.24, ease: 'easeInOut' }}
            className="lg:hidden border-b border-[#7c3aed]/30 bg-[#0c081e]/98 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="px-5 py-4 space-y-1.5 max-w-md mx-auto">
              {NAV_LINKS.map((link) => {
                const isActive = activeNav === link.id;
                const IconComponent = link.icon;

                return (
                  <button
                    key={link.id}
                    onClick={() => navigate(link.id)}
                    type="button"
                    className={`flex w-full items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-[#7c3aed]/30 to-[#ff7a29]/25 text-[#ffb347] font-bold border border-[#ff7a29]/40 shadow-[0_0_6px_rgba(255,122,41,0.12)]'
                        : 'text-[#94a3b8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#ff7a29]' : 'text-[#7c3aed]'}`} />
                      <span>{link.label}</span>
                    </span>
                    {isActive && (
                      <span className="w-2 h-2 rounded-full bg-[#ff7a29] shadow-[0_0_8px_#ff7a29]" />
                    )}
                  </button>
                );
              })}

              {/* Mobile Telegram Link */}
              <div className="pt-2 border-t border-white/5">
                <a
                  href="https://t.me/TraceHopAgentBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 w-full py-3 rounded-xl text-sm font-semibold text-white bg-[#120d2b] border border-[#2c2054] hover:border-[#7c3aed]/60"
                >
                  <FaTelegramPlane className="w-4 h-4 text-[#2AABEE]" />
                  <span>Open Telegram Bot</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
