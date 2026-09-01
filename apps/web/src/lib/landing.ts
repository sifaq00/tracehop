import { FaTelegramPlane } from 'react-icons/fa';
import {
  Terminal, Network, Sparkles, Flame, Code2,
  Home as HomeIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';

// ================= TYPES & MOCK DATA =================
export interface NodeInfo {
  id: string;
  label: string;
  address: string;
  role: string;
  balance: string;
  risk: 'SAFE' | 'WARN' | 'DANGER';
  x: number;
  y: number;
  details: string;
}

export const HERO_NODES: NodeInfo[] = [
  {
    id: 'node-a',
    label: 'Origin Funding Hub',
    address: '0x38...9f42',
    role: 'Origin Funder',
    balance: '1,420.5 SOL',
    risk: 'SAFE',
    x: 390,
    y: 300,
    details: 'Verified deposit wallet with 99.8% trust index.',
  },
  {
    id: 'node-b',
    label: 'Deployer Wallet',
    address: '4vJ9...8Kmn',
    role: 'Token Creator',
    balance: '45.2 SOL',
    risk: 'WARN',
    x: 493,
    y: 172,
    details: 'Created 4 tokens in past 72h. Mint authority revoked.',
  },
  {
    id: 'node-c-top',
    label: 'Binance Hot 14',
    address: '0x38...9f42',
    role: 'CEX Deposit Hub',
    balance: '2,800.0 SOL',
    risk: 'SAFE',
    x: 640,
    y: 65,
    details: 'Verified exchange liquidity pool with high throughput.',
  },
  {
    id: 'node-d-center',
    label: 'Main Cluster Relay',
    address: '9wQz...2bPx',
    role: 'Funding Distribution',
    balance: '310.8 SOL',
    risk: 'WARN',
    x: 640,
    y: 220,
    details: 'Split funding to 18 sub-wallets within 3 blocks of token launch.',
  },
  {
    id: 'node-g-right',
    label: 'Raydium Liquidity Pool',
    address: '675k...F78q',
    role: 'Automated Market Maker',
    balance: '850.0 SOL',
    risk: 'SAFE',
    x: 787,
    y: 172,
    details: 'Locked LP contract verified on Solana blockchain.',
  },
  {
    id: 'node-f-danger',
    label: 'Tornado Cash Mixer Outflow',
    address: '1xRUG...DEAD',
    role: 'Known Exploit Funder',
    balance: '280.0 SOL',
    risk: 'DANGER',
    x: 731,
    y: 345,
    details: 'Direct funding hop from flagged exploit address. High probability of dump & run!',
  },
  {
    id: 'node-e',
    label: 'Sybil Relay Node',
    address: '8bNm...3qWe',
    role: 'Intermediary Hop',
    balance: '500.0 SOL',
    risk: 'SAFE',
    x: 549,
    y: 345,
    details: 'Distribution relay with 0 malicious flags.',
  },
];

export interface PresetToken {
  name: string;
  ticker: string;
  mint: string;
  type: 'SAFE' | 'WARN' | 'DANGER';
  score: number;
  summary: string;
  hops: number;
  devHoldings: string;
  sybilWallets: number;
  lpLocked: boolean;
  logs: string[];
}

export const PRESET_TOKENS: PresetToken[] = [
  {
    name: 'Bonk Community',
    ticker: '$BONK',
    mint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    type: 'SAFE',
    score: 98,
    summary: 'Verified community meme token. Distributed mint authority, burned LP, clean decentralized holder distribution.',
    hops: 1,
    devHoldings: '0.0%',
    sybilWallets: 0,
    lpLocked: true,
    logs: [
      '[0.01s] Ingesting Solana blockhash & mint account...',
      '[0.03s] Traced Creator: Verified Genesis Authority (0 hops)',
      '[0.06s] LP Status: 100% Raydium & Orca LP Burned',
      '[0.09s] Cluster Analysis: 0 Coordinated sniper clusters',
      '[0.12s] Final Verdict: SAFE (98/100) - Clean Onchain Footprint',
    ],
  },
  {
    name: 'Dogwifhat',
    ticker: '$WIF',
    mint: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
    type: 'SAFE',
    score: 94,
    summary: 'Fair launch bonding curve completed. Creator funding traceable to Coinbase CEX, LP migrated and burned.',
    hops: 2,
    devHoldings: '0.8%',
    sybilWallets: 0,
    lpLocked: true,
    logs: [
      '[0.01s] Ingesting Solana blockhash & mint account...',
      '[0.04s] Traced Creator: Funded by Coinbase CEX Hot Wallet (1 hop)',
      '[0.08s] Verified Raydium Migration: 100% LP burned to dead address',
      '[0.11s] Cluster Analysis: Zero coordinated bundle snipers detected',
      '[0.14s] Final Verdict: SAFE (94/100) - Verified Safe Launch',
    ],
  },
  {
    name: 'Pudgy Sol Relay',
    ticker: '$PENGU',
    mint: '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv',
    type: 'WARN',
    score: 54,
    summary: 'Moderate warning. Intermediary funding relay linked to 3 dormant developer wallets holding 18.4% supply.',
    hops: 4,
    devHoldings: '18.4%',
    sybilWallets: 8,
    lpLocked: true,
    logs: [
      '[0.02s] Ingesting Solana blockhash & mint account...',
      '[0.05s] Traced Creator: Funded by FixedFloat Instant Swap (3 hops)',
      '[0.09s] WARNING: 8 Clustered wallet addresses linked to same relay',
      '[0.14s] Intermediary wallets hold 18.4% of circulating supply',
      '[0.18s] Final Verdict: CAUTION (54/100) - High cluster concentration',
    ],
  },
  {
    name: 'Fomo Rug Trap',
    ticker: '$RUGTRAP',
    mint: 'Fomo123444bJkLmQw11aZ88bVc99981245012444',
    type: 'DANGER',
    score: 14,
    summary: 'CRITICAL HAZARD. Deployer funded by Tornado Cash mixer. Active mint authority and 42% unlocked dev tokens.',
    hops: 5,
    devHoldings: '42.0%',
    sybilWallets: 28,
    lpLocked: false,
    logs: [
      '[0.02s] Ingesting Solana blockhash & mint account...',
      '[0.06s] CRITICAL: Funder identified as Tornado Cash Mixer Outflow',
      '[0.10s] ALERT: Deployer linked to 4 previous rug pulls',
      '[0.14s] Unlocked LP: Liquidity can be withdrawn immediately',
      '[0.18s] Final Verdict: CRITICAL DANGER (14/100) - DO NOT APE',
    ],
  },
];

export const NAV_LINKS = [
  { id: 'top', label: 'Home', icon: HomeIcon },
  { id: 'demo', label: 'Live Demo', icon: Terminal },
  { id: 'engine', label: 'Engine', icon: Network },
  { id: 'why', label: 'Why Tracehop', icon: Sparkles },
  { id: 'features', label: 'Features', icon: FaTelegramPlane },
  { id: 'stats', label: 'Stats', icon: Flame },
  { id: 'api', label: 'API', icon: Code2 },
];

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
