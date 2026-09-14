import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables (.env.local, .env)
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const rootEnv = path.resolve(currentDir, '../../../.env');
const localEnv = path.resolve(currentDir, '../.env.local');

if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
}
if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv, override: true });
}

import { handleScan, POST } from '../src/app/api/v1/scan/route';
import { checkAnonUsage, HOLD_CONFIG } from '../src/lib/gating';

interface GatingErrorResponse {
  error: string;
  message: string;
  required: number;
  current: string;
  symbol: string;
  chain: string;
  reason: string;
}

function assertGatingSchema(json: any, expectedReason: string, caseName: string): asserts json is GatingErrorResponse {
  const fields = ['error', 'message', 'required', 'current', 'symbol', 'chain', 'reason'];
  for (const f of fields) {
    if (!(f in json)) {
      throw new Error(`[${caseName}] Missing required field '${f}' in error payload`);
    }
  }

  if (json.reason !== expectedReason) {
    throw new Error(`[${caseName}] Expected reason '${expectedReason}', got '${json.reason}'`);
  }

  if (typeof json.required !== 'number') {
    throw new Error(`[${caseName}] Expected required to be number, got ${typeof json.required}`);
  }

  if (typeof json.current !== 'string') {
    throw new Error(`[${caseName}] Expected current to be string, got ${typeof json.current}`);
  }

  if (json.symbol !== HOLD_CONFIG.tokenSymbol) {
    throw new Error(`[${caseName}] Expected symbol '${HOLD_CONFIG.tokenSymbol}', got '${json.symbol}'`);
  }

  if (json.chain !== HOLD_CONFIG.chainName) {
    throw new Error(`[${caseName}] Expected chain '${HOLD_CONFIG.chainName}', got '${json.chain}'`);
  }
}

async function runTests() {
  console.log('=== Test Suite: Scan Route Gating (/api/v1/scan) ===\n');

  const testIp = `test-scan-${Date.now()}`;
  const testMint = '0x901fc7e22b7bc7353c66f0344a521e6533bf665f';
  const today = new Date().toISOString().split('T')[0];

  // Test 1: Anonymous Scans 1, 2, 3 succeed and bump usage; 4 is rejected
  console.log('[Test 1] Anonymous scans: 3 free scans allowed, 4th returns 402 ANON_EXHAUSTED');

  for (let i = 1; i <= 3; i++) {
    console.log(`  Executing anonymous scan #${i}...`);
    const res = await handleScan(testMint, true, null, testIp);
    if (res.status !== 200) {
      const errText = await res.text();
      throw new Error(`Expected status 200 for anonymous scan #${i}, got ${res.status}: ${errText}`);
    }

    const usage = await checkAnonUsage(testIp);
    console.log(`    Anon usage after scan #${i}: used=${usage.used}, remaining=${usage.remaining}`);
    if (usage.used !== i) {
      throw new Error(`Expected used=${i} after scan #${i}, got ${usage.used}`);
    }
  }

  console.log('  Executing anonymous scan #4 (should be exhausted)...');
  const res4 = await handleScan(testMint, false, null, testIp);
  console.log(`    Response status: ${res4.status}`);
  if (res4.status !== 402) {
    throw new Error(`Expected status 402 for exhausted scan #4, got ${res4.status}`);
  }

  const json4 = await res4.json();
  console.log('    Response body:', json4);
  assertGatingSchema(json4, 'anon_exhausted', 'Anon Scan #4');

  if (json4.error !== 'ANON_EXHAUSTED') {
    throw new Error(`Expected error 'ANON_EXHAUSTED', got '${json4.error}'`);
  }
  if (!json4.message.startsWith('Free anonymous scans exhausted (')) {
    throw new Error(`Unexpected message: ${json4.message}`);
  }
  console.log('  PASS Test 1: 3 free anonymous scans allowed, 4th returned 402 ANON_EXHAUSTED\n');

  // Test 2: Non-holder EVM wallet returns 402 HOLD_REQUIRED with correct schema
  console.log('[Test 2] Non-holder EVM wallet (zero address) returns 402 HOLD_REQUIRED');
  const zeroWallet = '0x0000000000000000000000000000000000000000';
  const resNonHolder = await handleScan(testMint, false, zeroWallet, testIp);
  console.log(`  Response status: ${resNonHolder.status}`);
  if (resNonHolder.status !== 402) {
    throw new Error(`Expected status 402 for non-holder wallet, got ${resNonHolder.status}`);
  }

  const jsonNonHolder = await resNonHolder.json();
  console.log('  Response body:', jsonNonHolder);
  assertGatingSchema(jsonNonHolder, 'insufficient_hold', 'Non-holder Wallet');

  if (jsonNonHolder.error !== 'HOLD_REQUIRED') {
    throw new Error(`Expected error 'HOLD_REQUIRED', got '${jsonNonHolder.error}'`);
  }
  if (jsonNonHolder.required !== 50000) {
    throw new Error(`Expected required 50000, got ${jsonNonHolder.required}`);
  }
  if (jsonNonHolder.current !== '0') {
    throw new Error(`Expected current '0', got ${jsonNonHolder.current}`);
  }
  if (!jsonNonHolder.message.includes('Wallet holds insufficient TRCHP')) {
    throw new Error(`Unexpected message: ${jsonNonHolder.message}`);
  }
  console.log('  PASS Test 2: Non-holder EVM wallet returned 402 HOLD_REQUIRED\n');

  // Test 3: Invalid wallet returns 402 INVALID_WALLET
  console.log('[Test 3] Invalid wallet address returns 402 INVALID_WALLET');
  const invalidWallet = 'not-a-valid-0x-address';
  const resInvalid = await handleScan(testMint, false, invalidWallet, testIp);
  console.log(`  Response status: ${resInvalid.status}`);
  if (resInvalid.status !== 402) {
    throw new Error(`Expected status 402 for invalid wallet, got ${resInvalid.status}`);
  }

  const jsonInvalid = await resInvalid.json();
  console.log('  Response body:', jsonInvalid);
  assertGatingSchema(jsonInvalid, 'invalid_wallet', 'Invalid Wallet');

  if (jsonInvalid.error !== 'INVALID_WALLET') {
    throw new Error(`Expected error 'INVALID_WALLET', got '${jsonInvalid.error}'`);
  }
  if (jsonInvalid.message !== 'Invalid EVM wallet address. Must be 0x followed by 40 hex characters.') {
    throw new Error(`Unexpected message: ${jsonInvalid.message}`);
  }
  console.log('  PASS Test 3: Invalid wallet returned 402 INVALID_WALLET\n');

  // Test 4: Testing via POST route handler
  console.log('[Test 4] Testing via POST route handler');

  // POST with invalid wallet
  const postReqInvalid = new Request('http://localhost:3000/api/v1/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': testIp,
    },
    body: JSON.stringify({
      mint: testMint,
      userWallet: 'invalid-address',
      stream: false,
    }),
  });
  const postResInvalid = await POST(postReqInvalid as any);
  if (postResInvalid.status !== 402) {
    throw new Error(`Expected POST status 402 for invalid wallet, got ${postResInvalid.status}`);
  }
  const postJsonInvalid = await postResInvalid.json();
  if (postJsonInvalid.error !== 'INVALID_WALLET') {
    throw new Error(`Expected error 'INVALID_WALLET', got '${postJsonInvalid.error}'`);
  }

  // POST with non-holder wallet
  const postReqNonHolder = new Request('http://localhost:3000/api/v1/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': testIp,
    },
    body: JSON.stringify({
      mint: testMint,
      userWallet: zeroWallet,
      stream: false,
    }),
  });
  const postResNonHolder = await POST(postReqNonHolder as any);
  if (postResNonHolder.status !== 402) {
    throw new Error(`Expected POST status 402 for non-holder wallet, got ${postResNonHolder.status}`);
  }
  const postJsonNonHolder = await postResNonHolder.json();
  if (postJsonNonHolder.error !== 'HOLD_REQUIRED') {
    throw new Error(`Expected error 'HOLD_REQUIRED', got '${postJsonNonHolder.error}'`);
  }

  // POST without mint returns 400
  const postReqNoMint = new Request('http://localhost:3000/api/v1/scan', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': testIp,
    },
    body: JSON.stringify({
      stream: false,
    }),
  });
  const postResNoMint = await POST(postReqNoMint as any);
  if (postResNoMint.status !== 400) {
    throw new Error(`Expected POST status 400 for missing mint, got ${postResNoMint.status}`);
  }

  console.log('  PASS Test 4: POST route handler handles gating and validation properly\n');

  // Cleanup test IP in Supabase
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
    console.log('[Cleanup] Test IP usage record cleaned up from Supabase.');
  }

  console.log('\n>>> All Scan Route Gating Tests Passed Successfully! <<<');
}

runTests().catch((err) => {
  console.error('\nScan Gating Test FAILED:', err);
  process.exit(1);
});
