import { NextRequest, NextResponse } from 'next/server';
import {
  checkTokenHold,
  checkAnonUsage,
  evaluateGating,
  HOLD_CONFIG,
  HoldResult,
} from '../../../../lib/gating';

export const dynamic = 'force-dynamic';

export async function GET(req: Request | NextRequest) {
  try {
    const url = new URL(req.url);
    const rawWallet = url.searchParams.get('wallet')?.trim() || null;
    const wallet =
      rawWallet && rawWallet.toLowerCase() !== 'null' && rawWallet.toLowerCase() !== 'undefined'
        ? rawWallet
        : null;

    const rawIp =
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1';

    const [holdResult, anon, decision] = await Promise.all([
      wallet
        ? checkTokenHold(wallet)
        : Promise.resolve<HoldResult>({ tier: -1, balance: '0', formattedBalance: '0' }),
      checkAnonUsage(rawIp),
      evaluateGating(wallet, rawIp),
    ]);

    return NextResponse.json(
      {
        mode: 'hold',
        wallet: wallet || null,
        tier: holdResult.tier,
        balance: holdResult.balance,
        formattedBalance: holdResult.formattedBalance,
        anonUsed: anon.used,
        anonRemaining: anon.remaining,
        anonAllowed: anon.allowed,
        required: HOLD_CONFIG.threshold,
        symbol: HOLD_CONFIG.tokenSymbol,
        chain: HOLD_CONFIG.chainName,
        access: decision.allowed,
        accessReason: decision.reason,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('[/api/v1/gate] Error evaluating gate status:', error);
    return NextResponse.json(
      {
        error: 'Failed to evaluate gate status',
      },
      { status: 500 }
    );
  }
}
