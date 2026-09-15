'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown, RefreshCw } from 'lucide-react';
import { playClick } from '../lib/sound-fx';
import { WalletModal, WalletOption } from './WalletModal';

export function WalletButton() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string>('');
  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null);
  const [balance, setBalance] = useState<string>('0.00');
  const [usdValue, setUsdValue] = useState<string>('0.00');
  const [symbol, setSymbol] = useState<string>('ETH');
  const [tokenBal, setTokenBal] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string>(
    process.env.NEXT_PUBLIC_HOLD_TOKEN_SYMBOL || 'ARDRILL'
  );
  const [tokenReq, setTokenReq] = useState<string>(() => {
    const v = Number(process.env.NEXT_PUBLIC_HOLD_THRESHOLD ?? NaN);
    return Number.isFinite(v) ? v.toLocaleString('en-US') : '';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Fetch real on-chain balance from MetaMask or Solana RPC & configured hold token
  const fetchBalance = useCallback(async (addr: string) => {
    if (!addr) return;
    setIsRefreshing(true);

    const isEvmAddr = addr.startsWith('0x');
    setSymbol(isEvmAddr ? 'ETH' : 'TOKEN');

    // 1. Native balance
    try {
      if (isEvmAddr && typeof window !== 'undefined' && window.ethereum?.request) {
        const hex = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [addr, 'latest'],
        });
        if (typeof hex === 'string') {
          const wei = BigInt(hex);
          const eth = Number(wei) / 1e18;
          const formatted = eth < 0.0001 && eth > 0 ? eth.toFixed(6) : eth.toFixed(4);
          setBalance(formatted);
          setUsdValue((eth * 2680).toFixed(2));
        }
      } else if (!isEvmAddr) {
        const res = await fetch('https://api.mainnet-beta.solana.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'getBalance',
            params: [addr],
          }),
        });
        const data = await res.json();
        if (data?.result?.value !== undefined) {
          const sol = data.result.value / 1e9;
          const formatted = sol < 0.001 && sol > 0 ? sol.toFixed(4) : sol.toFixed(3);
          setBalance(formatted);
          setUsdValue((sol * 194.5).toFixed(2));
        }
      }
    } catch (err) {
      console.warn('On-chain native balance fetch notice:', err);
      setBalance('0.00');
      setUsdValue('0.00');
    }

    // 2. Token balance for configured token address
    if (isEvmAddr) {
      try {
        const gateRes = await fetch(`/api/v1/gate?wallet=${encodeURIComponent(addr)}`, {
          cache: 'no-store',
        });
        if (gateRes.ok) {
          const gateData = await gateRes.json();
          if (gateData?.formattedBalance !== undefined) {
            setTokenBal(gateData.formattedBalance);
            if (gateData.symbol) setTokenSymbol(gateData.symbol);
            if (typeof gateData.required === 'number') setTokenReq(gateData.required.toLocaleString('en-US'));
          }
        } else {
          // Direct fallback to Robinhood RPC eth_call
          const tokenAddr =
            process.env.NEXT_PUBLIC_HOLD_TOKEN_ADDRESS ||
            '0x901fc7e22b7bc7353c66f0344a521e6533bf665f';
          const rpcUrl =
            process.env.NEXT_PUBLIC_HOOD_RPC_URL ||
            'https://robinhood-sepolia-rpc.publicnode.com';
          const data = `0x70a08231${'0'.repeat(24)}${addr.slice(2).toLowerCase()}`;
          const rpcRes = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'eth_call',
              params: [{ to: tokenAddr, data }, 'latest'],
            }),
          });
          const json = await rpcRes.json();
          if (json?.result) {
            const raw = BigInt(json.result);
            const dec = Number(process.env.NEXT_PUBLIC_HOLD_TOKEN_DECIMALS || 18);
            const divisor = BigInt(10) ** BigInt(dec);
            const whole = raw / divisor;
            setTokenBal(whole.toLocaleString('en-US'));
          }
        }
      } catch (err) {
        console.warn('Token balance fetch notice:', err);
      }
    } else {
      setTokenBal(null);
    }

    setIsRefreshing(false);
  }, []);

  // Check if wallet was previously connected or changed
  useEffect(() => {
    const handleWalletChanged = () => {
      const saved = localStorage.getItem('tracehop-wallet-connected');
      const savedName = localStorage.getItem('tracehop-wallet-name') || 'MetaMask';
      const savedChain = (localStorage.getItem('tracehop-wallet-chain') || 'Robinhood EVM') as any;
      const savedIcon = localStorage.getItem('tracehop-wallet-icon') || '/wallets/metamask.svg';

      if (saved) {
        setAddress(saved);
        setSelectedWallet({
          id: 'metamask',
          name: savedName,
          chain: savedChain,
          icon: savedIcon,
          installUrl: '',
          detect: () => true,
        });
        setConnected(true);
        fetchBalance(saved);
      } else {
        setConnected(false);
        setAddress('');
        setSelectedWallet(null);
        setBalance('0.00');
        setUsdValue('0.00');
        setTokenBal(null);
      }
    };

    handleWalletChanged();
    window.addEventListener('storage', handleWalletChanged);
    window.addEventListener('tracehop-wallet-changed', handleWalletChanged);
    return () => {
      window.removeEventListener('storage', handleWalletChanged);
      window.removeEventListener('tracehop-wallet-changed', handleWalletChanged);
    };
  }, [fetchBalance]);

  const handleWalletSelected = (wallet: WalletOption, addr: string) => {
    setSelectedWallet(wallet);
    setAddress(addr);
    setConnected(true);
    localStorage.setItem('tracehop-wallet-connected', addr);
    localStorage.setItem('tracehop-wallet-name', wallet.name);
    localStorage.setItem('tracehop-wallet-chain', wallet.chain);
    if (wallet.icon) {
      localStorage.setItem('tracehop-wallet-icon', wallet.icon);
    } else {
      localStorage.removeItem('tracehop-wallet-icon');
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tracehop-wallet-changed'));
    }
    fetchBalance(addr);
  };

  const handleDisconnect = () => {
    playClick();
    setConnected(false);
    setAddress('');
    setSelectedWallet(null);
    setBalance('0.00');
    setUsdValue('0.00');
    setTokenBal(null);
    setMenuOpen(false);
    localStorage.removeItem('tracehop-wallet-connected');
    localStorage.removeItem('tracehop-wallet-name');
    localStorage.removeItem('tracehop-wallet-chain');
    localStorage.removeItem('tracehop-wallet-icon');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tracehop-wallet-changed'));
    }
  };

  const handleCopy = async () => {
    playClick();
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const isEvm = address.startsWith('0x');
  const shortAddress = address
    ? isEvm && address.length >= 10
      ? `${address.slice(0, 4)}...${address.slice(-4)}`
      : address.length > 8
      ? `${address.slice(0, 4)}...${address.slice(-4)}`
      : address
    : '';

  const explorerUrl = isEvm
    ? `https://explorer.testnet.robinhood.com/address/${address}`
    : `https://solscan.io/account/${address}`;

  return (
    <>
      <div className="relative shrink-0" ref={dropdownRef}>
        {!connected ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              playClick();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 h-[38px] px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-[#ff7a29] to-[#ea580c] hover:from-[#ff9548] hover:to-[#ff7a29] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,122,41,0.45)] hover:shadow-[0_0_28px_rgba(255,122,41,0.7)] transition-all duration-200 shrink-0 cursor-pointer"
          >
            <Wallet className="h-3.5 w-3.5 shrink-0" />
            <span className="sm:hidden">Connect</span>
            <span className="hidden sm:inline">Connect Wallet</span>
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              playClick();
              setMenuOpen((prev) => !prev);
              if (!menuOpen) fetchBalance(address);
            }}
            className="flex items-center gap-2 h-[38px] rounded-xl border border-[#7c3aed]/50 bg-[#120d2b]/95 px-3 text-xs font-semibold text-white shadow-[0_0_15px_rgba(124,58,237,0.3)] transition hover:border-[#7c3aed] shrink-0 cursor-pointer"
          >
            {/* Wallet Brand Icon */}
            {selectedWallet?.icon && (
              <img
                src={selectedWallet.icon}
                alt={selectedWallet.name}
                onError={(e) => {
                  e.currentTarget.src = '/wallets/phantom.svg';
                }}
                className="h-4 w-4 object-contain"
              />
            )}

            {tokenBal !== null && (
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10.5px] font-bold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 px-1.5 py-0.5 rounded-lg">
                <span>{tokenBal}</span>
                <span className="text-[9px] text-[#22c55e]/70">{tokenSymbol}</span>
              </span>
            )}

            <span className="font-mono text-[11px] text-[#ffb347] font-bold">
              {shortAddress}
            </span>

            <ChevronDown className={`h-3.5 w-3.5 text-white/50 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </motion.button>
        )}

        {/* Account Dropdown Popover */}
        <AnimatePresence>
          {menuOpen && connected && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#7c3aed]/40 bg-[#0c081e]/98 p-4 text-white shadow-[0_12px_40px_rgba(0,0,0,0.9),0_0_20px_rgba(124,58,237,0.3)] backdrop-blur-xl z-50"
            >
              {/* Header / Account */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#7c3aed]/20 border border-[#7c3aed]/40 p-1.5">
                    <img
                      src={selectedWallet?.icon || '/wallets/phantom.svg'}
                      alt={selectedWallet?.name || 'Wallet'}
                      onError={(e) => {
                        e.currentTarget.src = '/wallets/phantom.svg';
                      }}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div>
                    <div className="font-display text-xs font-bold text-white flex items-center gap-1.5">
                      <span>{selectedWallet?.name || 'Account'}</span>
                      <span className="font-mono text-[9px] text-[#c084fc] bg-[#7c3aed]/20 border border-[#7c3aed]/30 px-1.5 py-0.5 rounded">
                        {symbol}
                      </span>
                    </div>
                    <div className="font-mono text-[10.5px] text-[#ffb347] font-semibold">{shortAddress}</div>
                  </div>
                </div>
              </div>

              {/* Real Live Balance Preview */}
              <div className="my-3 rounded-xl bg-black/50 p-2.5 border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Live Native Balance</span>
                  <button
                    onClick={() => fetchBalance(address)}
                    disabled={isRefreshing}
                    title="Refresh Balance"
                    className="text-white/40 hover:text-[#ff7a29] transition cursor-pointer"
                  >
                    <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin text-[#ff7a29]' : ''}`} />
                  </button>
                </div>
                <div className="mt-1 flex items-baseline gap-1.5 font-mono">
                  <span className="text-base font-extrabold text-white">
                    {balance} {symbol}
                  </span>
                  <span className="text-[11px] text-[#94a3b8]">
                    ≈ ${usdValue} USD
                  </span>
                </div>
              </div>

              {/* Live Hold Token Balance */}
              {tokenBal !== null && (
                <div className="mb-3 rounded-xl bg-black/50 p-2.5 border border-[#22c55e]/30 bg-[#22c55e]/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[#94a3b8]">Live Token Balance</span>
                    <span className="font-mono text-[9px] font-bold text-[#22c55e] bg-[#22c55e]/20 border border-[#22c55e]/30 px-1.5 py-0.5 rounded">
                      {tokenSymbol}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline justify-between font-mono">
                    <span className="text-sm font-extrabold text-[#22c55e]">
                      {tokenBal} <span className="text-xs font-semibold text-[#22c55e]/70">{tokenSymbol}</span>
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Req: {tokenReq}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Items */}
              <div className="space-y-1 text-xs">
                <button
                  onClick={handleCopy}
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-white/80 transition hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Copy className="h-3.5 w-3.5 text-[#ff7a29]" />
                    <span>Copy Address</span>
                  </span>
                  {copied && <span className="text-[10px] text-[#ff7a29] font-mono font-semibold">Copied!</span>}
                </button>

                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <ExternalLink className="h-3.5 w-3.5 text-[#c084fc]" />
                    <span>View on {isEvm ? 'Robinhood Explorer' : 'Solscan'}</span>
                  </span>
                </a>

                <button
                  onClick={() => {
                    playClick();
                    setMenuOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-white/80 transition hover:bg-white/5 hover:text-white cursor-pointer"
                >
                  <Wallet className="h-3.5 w-3.5 text-[#ff7a29]" />
                  <span>Switch Wallet</span>
                </button>

                <button
                  onClick={handleDisconnect}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-rose-400 transition hover:bg-rose-500/10 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Disconnect</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Multi-Wallet Modal Selection */}
      <AnimatePresence>
        {isModalOpen && (
          <WalletModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onConnect={handleWalletSelected}
          />
        )}
      </AnimatePresence>
    </>
  );
}
