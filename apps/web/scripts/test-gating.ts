import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  checkTokenHold,
  checkAnonUsage,
  bumpAnonUsage,
  evaluateGating,
  formatTokenBalance,
} from '../src/lib/gating';

// Load .env / .env.local manually if not yet populated
function loadEnv() {
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidatePaths = [
    path.resolve(currentDir, '../.env.local'),
    path.resolve(currentDir, '../../.env'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'apps/web/.env.local'),
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      for (const line of content.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  }
}

loadEnv();

async function runTests() {
  console.log('--- Starting Gating & Hold Checker Tests ---');

  // Test 1: formatTokenBalance helper
  console.log('\n[Test 1] formatTokenBalance');
  const zeroFormatted = formatTokenBalance('0');
  const thresholdFormatted = formatTokenBalance('50000000000000000000000');
  console.log(`  0 raw -> ${zeroFormatted}`);
  console.log(`  50,000 * 10^18 raw -> ${thresholdFormatted}`);
  if (zeroFormatted !== '0' || thresholdFormatted !== '50,000') {
    throw new Error('formatTokenBalance assertion failed');
  }
  console.log('  PASS formatTokenBalance');

  // Test 2: Token hold on zero address (must be tier 0, balance 0)
  console.log('\n[Test 2] checkTokenHold with zero address');
  const zeroAddr = '0x0000000000000000000000000000000000000000';
  const zeroResult = await checkTokenHold(zeroAddr);
  console.log('  Result:', zeroResult);
  if (zeroResult.tier !== 0 || zeroResult.balance !== '0' || zeroResult.formattedBalance !== '0') {
    throw new Error(`Expected tier 0 and balance 0, got tier ${zeroResult.tier}, balance ${zeroResult.balance}`);
  }
  console.log('  PASS zero address hold check');

  // Test 3: Token hold on invalid address (must fail closed: tier -1)
  console.log('\n[Test 3] checkTokenHold with invalid address');
  const invalidResult = await checkTokenHold('not-a-valid-address');
  console.log('  Result:', invalidResult);
  if (invalidResult.tier !== -1) {
    throw new Error(`Expected tier -1, got ${invalidResult.tier}`);
  }
  console.log('  PASS invalid address fail-closed');

  // Test 4: Supabase anon usage tracker
  const testIp = `test-ip-${Date.now()}`;
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n[Test 4] checkAnonUsage & bumpAnonUsage (IP: ${testIp})`);

  // Initial check
  const initialUsage = await checkAnonUsage(testIp);
  console.log('  Initial usage:', initialUsage);
  if (initialUsage.used !== 0 || initialUsage.remaining !== 3 || !initialUsage.allowed) {
    throw new Error('Initial usage check failed');
  }

  // Initial evaluateGating without wallet
  const initialGate = await evaluateGating(null, testIp);
  console.log('  Initial gate decision:', initialGate);
  if (!initialGate.allowed || initialGate.reason !== 'anon_free') {
    throw new Error(`Expected anon_free allowed, got ${JSON.stringify(initialGate)}`);
  }

  // Bump 1
  await bumpAnonUsage(testIp);
  const bump1Usage = await checkAnonUsage(testIp);
  console.log('  After bump 1:', bump1Usage);
  if (bump1Usage.used !== 1 || bump1Usage.remaining !== 2 || !bump1Usage.allowed) {
    throw new Error('Bump 1 usage check failed');
  }

  // Bump 2 and 3
  await bumpAnonUsage(testIp);
  await bumpAnonUsage(testIp);
  const bump3Usage = await checkAnonUsage(testIp);
  console.log('  After bump 3:', bump3Usage);
  if (bump3Usage.used !== 3 || bump3Usage.remaining !== 0 || bump3Usage.allowed !== false) {
    throw new Error('Bump 3 usage check failed');
  }

  // Gate check when exhausted
  const exhaustedGate = await evaluateGating(null, testIp);
  console.log('  Exhausted gate decision:', exhaustedGate);
  if (exhaustedGate.allowed !== false || exhaustedGate.reason !== 'anon_exhausted') {
    throw new Error(`Expected anon_exhausted, got ${JSON.stringify(exhaustedGate)}`);
  }
  console.log('  PASS anon usage limit & exhaustion gating');

  // Test 5: evaluateGating with wallet
  console.log('\n[Test 5] evaluateGating with wallet');
  const zeroWalletGate = await evaluateGating(zeroAddr, testIp);
  console.log('  Zero wallet gate decision:', zeroWalletGate);
  if (zeroWalletGate.allowed !== false || zeroWalletGate.reason !== 'insufficient_hold') {
    throw new Error(`Expected insufficient_hold, got ${JSON.stringify(zeroWalletGate)}`);
  }

  const invalidWalletGate = await evaluateGating('0xbad', testIp);
  console.log('  Invalid wallet gate decision:', invalidWalletGate);
  if (invalidWalletGate.allowed !== false || invalidWalletGate.reason !== 'invalid_wallet') {
    throw new Error(`Expected invalid_wallet, got ${JSON.stringify(invalidWalletGate)}`);
  }
  console.log('  PASS evaluateGating with wallet checks');

  // Cleanup test usage row in Supabase
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
  if (supabaseUrl && supabaseKey) {
    await fetch(`${supabaseUrl}/rest/v1/usage?wallet=eq.${encodeURIComponent(testIp)}&day=eq.${today}`, {
      method: 'DELETE',
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    console.log('\n[Cleanup] Test row deleted from Supabase usage table.');
  }

  console.log('\n>>> All Task 1 Gating Tests Passed Successfully! <<<');
}

runTests().catch((err) => {
  console.error('\nFAIL:', err);
  process.exit(1);
});
