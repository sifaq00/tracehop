'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect?: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey?: { toString?: () => string } }>;
    };
    phantom?: {
      solana?: {
        isPhantom?: boolean;
        connect?: (options?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey?: { toString?: () => string } }>;
      };
      ethereum?: {
        request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
    };
    solflare?: {
      isSolflare?: boolean;
      connect?: () => Promise<void>;
      publicKey?: { toString?: () => string };
    };
    backpack?: {
      connect?: () => Promise<{ publicKey?: { toString?: () => string } }>;
    };
    nightly?: {
      solana?: {
        connect?: () => Promise<{ publicKey?: { toString?: () => string } }>;
      };
    };
    ethereum?: {
      isRabby?: boolean;
      isMetaMask?: boolean;
      providers?: Array<Record<string, unknown>>;
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    okxwallet?: {
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    coinbaseWalletExtension?: {
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    trustwallet?: {
      request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
    bitkeep?: {
      ethereum?: {
        request?: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      };
    };
  }
}

export type WalletType =
  | 'rabby'
  | 'metamask'
  | 'phantom-evm'
  | 'coinbase'
  | 'okx'
  | 'trust'
  | 'bitkeep'
  | 'phantom'
  | 'solflare'
  | 'backpack'
  | 'nightly';

export interface WalletOption {
  id: WalletType;
  name: string;
  chain: string;
  icon: string | null;
  installUrl: string;
  detect: () => boolean;
}

export function getEvmProvider(id: string): { request?: (args: { method: string; params?: unknown[] }) => Promise<unknown> } | null {
  if (typeof window === 'undefined') return null;
  const eth = window.ethereum;
  if (id === 'phantom-evm') return window.phantom?.ethereum ?? null;
  if (id === 'coinbase') return window.coinbaseWalletExtension ?? null;
  if (id === 'okx') return window.okxwallet ?? null;
  if (id === 'trust') return window.trustwallet ?? null;
  if (id === 'bitkeep') return window.bitkeep?.ethereum ?? null;
  if (id === 'rabby') return eth?.isRabby ? eth : null;
  if (id === 'metamask') {
    if (eth?.isRabby) {
      if (Array.isArray(eth.providers)) {
        const found = eth.providers.find((p) => p.isMetaMask && !p.isRabby);
        if (found) return found as any;
      }
      return null;
    }
    return eth?.isMetaMask ? eth : null;
  }
  return eth ?? null;
}

function getPhantomProvider() {
  if (typeof window === 'undefined') return null;
  if (window.phantom?.solana?.isPhantom) return window.phantom.solana;
  if (window.solana?.isPhantom) return window.solana;
  return null;
}

function solAddress(res: unknown): string {
  if (typeof res === 'string') return res;
  if (!res || typeof res !== 'object') return '';
  const o = res as {
    publicKey?: { toString?: () => string; toBase58?: () => string };
    toBase58?: () => string;
  };
  const addr =
    o.publicKey?.toBase58?.() ??
    o.publicKey?.toString?.() ??
    (typeof o.toBase58 === 'function' ? o.toBase58() : '');
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr ?? '') ? (addr as string) : '';
}

function withTimeout<T>(promise: Promise<T>, ms: number, errMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errMsg)), ms)),
  ]);
}

const ROBINHOOD_TESTNET_CHAIN_ID = '0xb626'; // 46630 in hex
const ROBINHOOD_TESTNET_CONFIG = {
  chainId: ROBINHOOD_TESTNET_CHAIN_ID,
  chainName: 'Robinhood Chain Testnet',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: ['https://robinhood-sepolia-rpc.publicnode.com'],
  blockExplorerUrls: ['https://explorer.testnet.robinhood.com/'],
};

async function promptRobinhoodChain(provider: any) {
  if (!provider?.request) return;
  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: ROBINHOOD_TESTNET_CHAIN_ID }],
    });
  } catch (switchError: any) {
    if (switchError?.code === 4902 || switchError?.data?.originalError?.code === 4902) {
      try {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [ROBINHOOD_TESTNET_CONFIG],
        });
      } catch {
        // user rejected chain addition
      }
    }
  }
}

export const EVM_WALLETS: WalletOption[] = [
  {
    id: 'rabby',
    name: 'Rabby',
    chain: 'EVM',
    icon: '/wallets/rabby.svg',
    installUrl: 'https://rabby.io/',
    detect: () => Boolean(typeof window !== 'undefined' && window.ethereum?.isRabby),
  },
  {
    id: 'metamask',
    name: 'MetaMask',
    chain: 'Robinhood EVM',
    icon: '/wallets/metamask.svg',
    installUrl: 'https://metamask.io/',
    detect: () =>
      Boolean(
        typeof window !== 'undefined' &&
          ((window.ethereum?.isMetaMask && !window.ethereum?.isRabby) ||
            window.ethereum?.providers?.some((p) => p.isMetaMask && !p.isRabby))
      ),
  },
  {
    id: 'phantom-evm',
    name: 'Phantom (EVM)',
    chain: 'Robinhood EVM',
    icon: '/wallets/phantom.svg',
    installUrl: 'https://phantom.app/',
    detect: () => Boolean(typeof window !== 'undefined' && window.phantom?.ethereum?.request),
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    chain: 'Robinhood EVM',
    icon: '/wallets/coinbase.svg',
    installUrl: 'https://www.coinbase.com/wallet',
    detect: () =>
      Boolean(
        typeof window !== 'undefined' &&
          (Boolean(window.coinbaseWalletExtension) ||
            window.ethereum?.providers?.some((p: any) => p.isCoinbaseWallet))
      ),
  },
  {
    id: 'okx',
    name: 'OKX',
    chain: 'Robinhood EVM',
    icon: '/wallets/okx.svg',
    installUrl: 'https://www.okx.com/web3',
    detect: () =>
      Boolean(
        typeof window !== 'undefined' &&
          (Boolean(window.okxwallet) ||
            window.ethereum?.providers?.some((p: any) => p.isOkxWallet))
      ),
  },
  {
    id: 'trust',
    name: 'Trust',
    chain: 'Robinhood EVM',
    icon: '/wallets/trust.png',
    installUrl: 'https://trustwallet.com/',
    detect: () => Boolean(typeof window !== 'undefined' && Boolean(window.trustwallet?.request)),
  },
  {
    id: 'bitkeep',
    name: 'Bitget',
    chain: 'Robinhood EVM',
    icon: '/wallets/bitget.webp',
    installUrl: 'https://web3.bitget.com/',
    detect: () => Boolean(typeof window !== 'undefined' && Boolean(window.bitkeep?.ethereum?.request)),
  },
];

export const SOLANA_WALLETS: WalletOption[] = [
  {
    id: 'phantom',
    name: 'Phantom',
    chain: 'Solana',
    icon: '/wallets/phantom.svg',
    installUrl: 'https://phantom.app/',
    detect: () =>
      Boolean(typeof window !== 'undefined' && (window.solana?.isPhantom || window.phantom?.solana?.isPhantom)),
  },
  {
    id: 'solflare',
    name: 'Solflare',
    chain: 'Solana',
    icon: '/wallets/solflare.svg',
    installUrl: 'https://solflare.com/',
    detect: () => Boolean(typeof window !== 'undefined' && window.solflare?.isSolflare),
  },
  {
    id: 'backpack',
    name: 'Backpack',
    chain: 'Solana',
    icon: '/wallets/backpack.svg',
    installUrl: 'https://backpack.app/',
    detect: () => Boolean(typeof window !== 'undefined' && window.backpack),
  },
  {
    id: 'nightly',
    name: 'Nightly',
    chain: 'Solana',
    icon: '/wallets/nightly.svg',
    installUrl: 'https://nightly.app/',
    detect: () => Boolean(typeof window !== 'undefined' && window.nightly?.solana),
  },
];

export const WALLETS: WalletOption[] = [...EVM_WALLETS, ...SOLANA_WALLETS];

function wallet_detect(w: WalletOption): boolean {
  try {
    return w.detect();
  } catch {
    return false;
  }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (wallet: WalletOption, address: string) => void;
}

export function WalletModal({ isOpen, onClose, onConnect }: Props) {
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [tab, setTab] = useState<'evm' | 'solana'>('evm');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setErrorMessage(null);
      setConnectingId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const select = async (wallet: WalletOption) => {
    setConnectingId(wallet.id);
    setErrorMessage(null);

    if (!wallet_detect(wallet)) {
      try {
        window.open(wallet.installUrl, '_blank', 'noopener,noreferrer');
      } catch {
        // popup blocked: ignore
      }
      const conflict =
        typeof window !== 'undefined' &&
        Boolean(window.ethereum?.request) &&
        (wallet.id === 'rabby' ||
          wallet.id === 'metamask' ||
          wallet.id === 'phantom-evm' ||
          wallet.id === 'coinbase' ||
          wallet.id === 'okx' ||
          wallet.id === 'trust' ||
          wallet.id === 'bitkeep');
      setErrorMessage(
        conflict
          ? 'Another wallet controls the browser. Disable other EVM extensions or pick the active one.'
          : `${wallet.name} not detected. Install it, then try again.`
      );
      setConnectingId(null);
      return;
    }

    try {
      if (wallet.id === 'phantom') {
        const provider = getPhantomProvider();
        const res = await withTimeout(provider!.connect!(), 12000, 'Phantom connection timed out. Unlock your wallet.');
        const addr = solAddress(res);
        if (addr) {
          saveAndConnect(wallet, addr);
          return;
        }
        setErrorMessage('Phantom returned no address. Unlock and retry.');
      } else if (wallet.id === 'solflare' && window.solflare) {
        await withTimeout(window.solflare.connect!(), 12000, 'Solflare connection timed out.');
        const addr = solAddress(window.solflare.publicKey);
        if (addr) {
          saveAndConnect(wallet, addr);
          return;
        }
        setErrorMessage('Solflare returned no address. Unlock and retry.');
      } else if (wallet.id === 'backpack' && window.backpack) {
        const res = await withTimeout(window.backpack.connect!(), 12000, 'Backpack connection timed out.');
        const addr = solAddress(res);
        if (addr) {
          saveAndConnect(wallet, addr);
          return;
        }
        setErrorMessage('Backpack returned no address. Unlock and retry.');
      } else if (wallet.id === 'nightly' && window.nightly?.solana) {
        const res = await withTimeout(window.nightly.solana.connect!(), 12000, 'Nightly connection timed out.');
        const addr = solAddress(res);
        if (addr) {
          saveAndConnect(wallet, addr);
          return;
        }
        setErrorMessage('Nightly returned no address. Unlock and retry.');
      } else {
        // EVM Wallets
        const provider = getEvmProvider(wallet.id);
        if (provider?.request) {
          const accounts = (await withTimeout(
            provider.request({ method: 'eth_requestAccounts' }),
            12000,
            `${wallet.name} connection timed out. Unlock your wallet.`
          )) as unknown;
          const addr = Array.isArray(accounts) ? String(accounts[0] ?? '') : '';
          if (/^0x[0-9a-fA-F]{40}$/.test(addr)) {
            await promptRobinhoodChain(provider);
            saveAndConnect(wallet, addr);
            return;
          }
          setErrorMessage('No valid EVM address returned.');
        } else {
          setErrorMessage(`${wallet.name} provider not found.`);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg.includes('rejected') || msg.includes('cancelled') ? 'Connection cancelled.' : msg);
    } finally {
      setConnectingId(null);
    }
  };

  const saveAndConnect = (wallet: WalletOption, addr: string) => {
    try {
      localStorage.setItem('tracehop-wallet-connected', addr);
      localStorage.setItem('tracehop-wallet-name', wallet.name);
      localStorage.setItem('tracehop-wallet-chain', wallet.chain);
      if (wallet.icon) localStorage.setItem('tracehop-wallet-icon', wallet.icon);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('tracehop-wallet-changed'));
      }
    } catch {
      // ignore
    }
    onConnect(wallet, addr);
    setConnectingId(null);
    onClose();
  };

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  const modalContent = (
    <div
      data-lenis-prevent
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        data-lenis-prevent
        className="relative w-full max-w-sm rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-white shadow-2xl z-10 flex flex-col max-h-[85vh]"
      >
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-white">Connect wallet</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded px-2 py-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-xs text-zinc-500 shrink-0">
          Select your Robinhood EVM or Web3 wallet.
        </p>

        {/* Tab switch matching project aries */}
        <div className="mt-3 flex gap-1 rounded border border-zinc-800 p-1 shrink-0" role="tablist" aria-label="Wallet network">
          {(['evm', 'solana'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                setTab(t);
                setErrorMessage(null);
              }}
              className={`flex-1 cursor-pointer rounded px-2 py-1 font-mono text-xs font-bold tracking-wider uppercase transition-colors ${
                tab === t ? 'bg-[#22c55e] text-black' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'evm' ? 'EVM (Robinhood)' : 'Solana'}
            </button>
          ))}
        </div>

        {/* Wallet list with scroll support and data-lenis-prevent */}
        <div
          data-lenis-prevent
          className="mt-3 flex flex-col gap-2 overflow-y-auto overscroll-contain pr-1 flex-1 min-h-0 [scrollbar-width:thin] [scrollbar-color:rgba(34,197,94,0.4)_transparent]"
        >
          {(tab === 'evm' ? EVM_WALLETS : SOLANA_WALLETS).map((w) => (
            <button
              key={w.id}
              type="button"
              disabled={connectingId !== null}
              onClick={() => void select(w)}
              className="flex items-center gap-3 rounded border border-zinc-800 bg-zinc-900/30 px-3 py-2 text-left text-sm hover:border-[#22c55e] hover:bg-zinc-900/60 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {w.icon ? (
                <img
                  src={w.icon}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-black font-mono text-xs font-bold text-[#22c55e]"
                >
                  {w.name.slice(0, 1)}
                </span>
              )}
              <span className="flex-1 font-medium text-white">{w.name}</span>
              <span className="font-mono text-xs text-zinc-500">
                {connectingId === w.id ? '…' : wallet_detect(w) ? 'detected' : 'install'}
              </span>
            </button>
          ))}
        </div>

        {errorMessage && (
          <p role="alert" className="mt-3 shrink-0 text-sm text-[#ef4444]">
            {errorMessage}
          </p>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default WalletModal;
