import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables before importing route
const rootEnv = path.resolve(__dirname, '../../../.env');
const localEnv = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(rootEnv)) {
  dotenv.config({ path: rootEnv });
}
if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv, override: true });
}

import { GET } from '../src/app/api/v1/gate/route';

interface GateResponse {
  mode: string;
  wallet: string | null;
  tier: number;
  balance: string;
  formattedBalance: string;
  anonUsed: number;
  anonRemaining: number;
  anonAllowed: boolean;
  required: number;
  symbol: string;
  chain: string;
  access: boolean;
  accessReason: string;
}

function assertSchema(json: any, caseName: string): asserts json is GateResponse {
  const expectedFields = [
    'mode',
    'wallet',
    'tier',
    'balance',
    'formattedBalance',
    'anonUsed',
    'anonRemaining',
    'anonAllowed',
    'required',
    'symbol',
    'chain',
    'access',
    'accessReason',
  ];

  for (const field of expectedFields) {
    if (!(field in json)) {
      throw new Error(`[${caseName}] Missing required field in response: ${field}`);
    }
  }

  if (json.mode !== 'hold') {
    throw new Error(`[${caseName}] Expected mode 'hold', got '${json.mode}'`);
  }
  if (typeof json.tier !== 'number') {
    throw new Error(`[${caseName}] Expected tier to be number, got ${typeof json.tier}`);
  }
  if (typeof json.balance !== 'string') {
    throw new Error(`[${caseName}] Expected balance to be string, got ${typeof json.balance}`);
  }
  if (typeof json.formattedBalance !== 'string') {
    throw new Error(`[${caseName}] Expected formattedBalance to be string, got ${typeof json.formattedBalance}`);
  }
  if (typeof json.anonUsed !== 'number') {
    throw new Error(`[${caseName}] Expected anonUsed to be number, got ${typeof json.anonUsed}`);
  }
  if (typeof json.anonRemaining !== 'number') {
    throw new Error(`[${caseName}] Expected anonRemaining to be number, got ${typeof json.anonRemaining}`);
  }
  if (typeof json.anonAllowed !== 'boolean') {
    throw new Error(`[${caseName}] Expected anonAllowed to be boolean, got ${typeof json.anonAllowed}`);
  }
  if (typeof json.required !== 'number') {
    throw new Error(`[${caseName}] Expected required to be number, got ${typeof json.required}`);
  }
  if (typeof json.symbol !== 'string') {
    throw new Error(`[${caseName}] Expected symbol to be string, got ${typeof json.symbol}`);
  }
  if (typeof json.chain !== 'string') {
    throw new Error(`[${caseName}] Expected chain to be string, got ${typeof json.chain}`);
  }
  if (typeof json.access !== 'boolean') {
    throw new Error(`[${caseName}] Expected access to be boolean, got ${typeof json.access}`);
  }
  if (typeof json.accessReason !== 'string') {
    throw new Error(`[${caseName}] Expected accessReason to be string, got ${typeof json.accessReason}`);
  }
}

async function runGateRouteTests() {
  console.log('--- Testing /api/v1/gate Route Handler ---\n');

  // Test 1: No wallet (anonymous)
  console.log('[Test 1] Anonymous request (no wallet param)');
  const req1 = new Request('http://localhost:3000/api/v1/gate', {
    headers: {
      'x-forwarded-for': '198.51.100.22, 10.0.0.1',
    },
  });
  const res1 = await GET(req1);
  console.log(`  Response status: ${res1.status}`);
  if (res1.status !== 200) {
    throw new Error(`Test 1 expected status 200, got ${res1.status}`);
  }

  const json1 = (await res1.json()) as GateResponse;
  console.log('  Response body:', json1);
  assertSchema(json1, 'Test 1');

  if (json1.wallet !== null) {
    throw new Error(`Test 1 expected wallet null, got ${json1.wallet}`);
  }
  if (json1.tier !== -1) {
    throw new Error(`Test 1 expected tier -1 for anon, got ${json1.tier}`);
  }
  if (json1.required !== 50000) {
    throw new Error(`Test 1 expected required 50000, got ${json1.required}`);
  }
  if (json1.symbol !== 'ARDRILL') {
    throw new Error(`Test 1 expected symbol ARDRILL, got ${json1.symbol}`);
  }
  if (json1.chain !== 'Robinhood') {
    throw new Error(`Test 1 expected chain Robinhood, got ${json1.chain}`);
  }
  if (!['anon_free', 'anon_exhausted'].includes(json1.accessReason)) {
    throw new Error(`Test 1 expected anon reason, got ${json1.accessReason}`);
  }
  console.log('  PASS Test 1 (Anonymous request)\n');

  // Test 2: Zero wallet address
  console.log('[Test 2] Zero wallet address (0x0000000000000000000000000000000000000000)');
  const zeroAddr = '0x0000000000000000000000000000000000000000';
  const req2 = new Request(`http://localhost:3000/api/v1/gate?wallet=${zeroAddr}`);
  const res2 = await GET(req2);
  console.log(`  Response status: ${res2.status}`);
  if (res2.status !== 200) {
    throw new Error(`Test 2 expected status 200, got ${res2.status}`);
  }

  const json2 = (await res2.json()) as GateResponse;
  console.log('  Response body:', json2);
  assertSchema(json2, 'Test 2');

  if (json2.wallet !== zeroAddr) {
    throw new Error(`Test 2 expected wallet ${zeroAddr}, got ${json2.wallet}`);
  }
  if (json2.tier !== 0) {
    throw new Error(`Test 2 expected tier 0 for zero address, got ${json2.tier}`);
  }
  if (json2.balance !== '0') {
    throw new Error(`Test 2 expected balance '0', got ${json2.balance}`);
  }
  if (json2.access !== false) {
    throw new Error(`Test 2 expected access false, got ${json2.access}`);
  }
  if (json2.accessReason !== 'insufficient_hold') {
    throw new Error(`Test 2 expected accessReason 'insufficient_hold', got ${json2.accessReason}`);
  }
  console.log('  PASS Test 2 (Zero address non-holder)\n');

  // Test 3: Invalid address
  console.log('[Test 3] Invalid address (not an EVM 0x 40-hex string)');
  const invalidAddr = 'invalid-wallet-address';
  const req3 = new Request(`http://localhost:3000/api/v1/gate?wallet=${encodeURIComponent(invalidAddr)}`);
  const res3 = await GET(req3);
  console.log(`  Response status: ${res3.status}`);
  if (res3.status !== 200) {
    throw new Error(`Test 3 expected status 200, got ${res3.status}`);
  }

  const json3 = (await res3.json()) as GateResponse;
  console.log('  Response body:', json3);
  assertSchema(json3, 'Test 3');

  if (json3.wallet !== invalidAddr) {
    throw new Error(`Test 3 expected wallet ${invalidAddr}, got ${json3.wallet}`);
  }
  if (json3.tier !== -1) {
    throw new Error(`Test 3 expected tier -1 for invalid wallet, got ${json3.tier}`);
  }
  if (json3.access !== false) {
    throw new Error(`Test 3 expected access false, got ${json3.access}`);
  }
  if (json3.accessReason !== 'invalid_wallet') {
    throw new Error(`Test 3 expected accessReason 'invalid_wallet', got ${json3.accessReason}`);
  }
  console.log('  PASS Test 3 (Invalid address fail-closed)\n');

  // Test 4: Empty string and 'null' wallet param
  console.log('[Test 4] Query params with empty wallet and null string');
  const req4Empty = new Request('http://localhost:3000/api/v1/gate?wallet=');
  const res4Empty = await GET(req4Empty);
  const json4Empty = (await res4Empty.json()) as GateResponse;
  assertSchema(json4Empty, 'Test 4 Empty');
  if (json4Empty.wallet !== null || json4Empty.tier !== -1) {
    throw new Error('Test 4 Empty expected null wallet and -1 tier');
  }

  const req4Null = new Request('http://localhost:3000/api/v1/gate?wallet=null');
  const res4Null = await GET(req4Null);
  const json4Null = (await res4Null.json()) as GateResponse;
  assertSchema(json4Null, 'Test 4 Null');
  if (json4Null.wallet !== null || json4Null.tier !== -1) {
    throw new Error('Test 4 Null expected null wallet and -1 tier');
  }
  console.log('  PASS Test 4 (Empty and literal null param normalization)\n');

  console.log('>>> All /api/v1/gate Route Tests Passed! <<<');
}

runGateRouteTests().catch((err) => {
  console.error('\nTest failed with error:', err);
  process.exit(1);
});
