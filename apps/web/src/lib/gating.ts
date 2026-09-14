// Robinhood Chain Gating Module
// Supports 3 free anonymous scans per IP daily and 50,000+ TRCHP (ARDRILL) token hold tier.

export interface HoldResult {
  // 2 = unlimited (>= threshold), 0 = below threshold, -1 = unknown / fail closed
  tier: 2 | 0 | -1;
  balance: string;
  formattedBalance: string;
}

export interface AnonUsageResult {
  used: number;
  remaining: number;
  allowed: boolean;
}

export type GatingReason =
  | 'holder'
  | 'anon_free'
  | 'insufficient_hold'
  | 'anon_exhausted'
  | 'invalid_wallet';

export interface GatingDecision {
  allowed: boolean;
  reason: GatingReason;
  balance?: string;
  formattedBalance?: string;
  remaining?: number;
  used?: number;
}

function getConfig() {
  const rpcUrl =
    process.env.HOOD_RPC_URL ||
    process.env.HOOD_MAINNET_RPC ||
    'https://robinhood-sepolia-rpc.publicnode.com';
  const tokenAddress =
    process.env.HOLD_TOKEN_ADDRESS ||
    process.env.TRCHP_TOKEN_ADDRESS ||
    '0x901fc7e22b7bc7353c66f0344a521e6533bf665f';
  const decimals = Number(process.env.HOLD_TOKEN_DECIMALS ?? 18);
  const threshold = BigInt(process.env.HOLD_THRESHOLD ?? '50000');
  const thresholdRaw = threshold * (BigInt(10) ** BigInt(decimals));
  const freeLimit = Number(process.env.FREE_ANON_SCANS ?? 3);
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return {
    rpcUrl,
    tokenAddress,
    decimals,
    threshold,
    thresholdRaw,
    freeLimit,
    supabaseUrl,
    supabaseKey,
  };
}

export function formatTokenBalance(rawBalance: string, decimals = 18): string {
  try {
    const b = BigInt(rawBalance);
    const divisor = BigInt(10) ** BigInt(decimals);
    const integerPart = b / divisor;
    const remainder = b % divisor;
    if (remainder === BigInt(0)) {
      return integerPart.toLocaleString('en-US');
    }
    const remStr = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
    const formattedDec = remStr.slice(0, 4);
    return `${integerPart.toLocaleString('en-US')}.${formattedDec}`;
  } catch {
    return '0';
  }
}

export function parseClientIp(ip: string): string {
  if (!ip) return 'unknown';
  const first = ip.split(',')[0].trim();
  return first || 'unknown';
}

export async function checkTokenHold(wallet: string): Promise<HoldResult> {
  const fail: HoldResult = { tier: -1, balance: '0', formattedBalance: '0' };
  if (!wallet || !/^0x[0-9a-fA-F]{40}$/.test(wallet)) return fail;

  const { rpcUrl, tokenAddress, decimals, thresholdRaw } = getConfig();
  if (!/^0x[0-9a-fA-F]{40}$/.test(tokenAddress)) return fail;

  try {
    const data = `0x70a08231${'0'.repeat(24)}${wallet.slice(2).toLowerCase()}`;
    const res = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{ to: tokenAddress, data }, 'latest'],
      }),
    });

    if (!res.ok) return fail;
    const json = (await res.json()) as { result?: string; error?: unknown };
    if (json.error || !json.result) return fail;

    const balance = BigInt(json.result).toString();
    const formattedBalance = formatTokenBalance(balance, decimals);
    const tier = BigInt(balance) >= thresholdRaw ? 2 : 0;

    return { tier, balance, formattedBalance };
  } catch {
    return fail;
  }
}

export async function checkAnonUsage(ip: string): Promise<AnonUsageResult> {
  const { freeLimit, supabaseUrl, supabaseKey } = getConfig();
  const cleanIp = parseClientIp(ip);
  const today = new Date().toISOString().split('T')[0];

  if (!supabaseUrl || !supabaseKey) {
    return { used: freeLimit, remaining: 0, allowed: false };
  }

  try {
    const url = `${supabaseUrl}/rest/v1/usage?wallet=eq.${encodeURIComponent(cleanIp)}&day=eq.${today}&select=runs`;
    const res = await fetch(url, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return { used: freeLimit, remaining: 0, allowed: false };
    }

    const data = (await res.json()) as Array<{ runs?: number }>;
    const used = data.length > 0 && typeof data[0].runs === 'number' ? data[0].runs : 0;
    const remaining = Math.max(0, freeLimit - used);

    return {
      used,
      remaining,
      allowed: remaining > 0,
    };
  } catch {
    return { used: freeLimit, remaining: 0, allowed: false };
  }
}

export async function bumpAnonUsage(ip: string): Promise<void> {
  const { supabaseUrl, supabaseKey } = getConfig();
  const cleanIp = parseClientIp(ip);
  const today = new Date().toISOString().split('T')[0];

  if (!supabaseUrl || !supabaseKey) return;

  try {
    const { used } = await checkAnonUsage(cleanIp);
    const nextRuns = used + 1;

    const url = `${supabaseUrl}/rest/v1/usage`;
    await fetch(url, {
      method: 'POST',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        wallet: cleanIp,
        day: today,
        runs: nextRuns,
      }),
    });
  } catch (err) {
    console.error('[gating] bumpAnonUsage error:', err);
  }
}

export async function evaluateGating(
  wallet: string | null | undefined,
  ip: string
): Promise<GatingDecision> {
  const isWalletProvided =
    typeof wallet === 'string' &&
    wallet.trim().length > 0 &&
    wallet.trim().toLowerCase() !== 'null' &&
    wallet.trim().toLowerCase() !== 'undefined';

  if (isWalletProvided) {
    const cleanWallet = wallet.trim();
    if (!/^0x[0-9a-fA-F]{40}$/.test(cleanWallet)) {
      return { allowed: false, reason: 'invalid_wallet' };
    }

    const hold = await checkTokenHold(cleanWallet);
    if (hold.tier === 2) {
      return {
        allowed: true,
        reason: 'holder',
        balance: hold.balance,
        formattedBalance: hold.formattedBalance,
      };
    }

    return {
      allowed: false,
      reason: 'insufficient_hold',
      balance: hold.balance,
      formattedBalance: hold.formattedBalance,
    };
  }

  const anon = await checkAnonUsage(ip);
  if (anon.allowed) {
    return {
      allowed: true,
      reason: 'anon_free',
      remaining: anon.remaining,
      used: anon.used,
    };
  }

  return {
    allowed: false,
    reason: 'anon_exhausted',
    remaining: anon.remaining,
    used: anon.used,
  };
}
