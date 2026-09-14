import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment from apps/web/.env.local
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const localEnv = path.resolve(currentDir, '../.env.local');
if (fs.existsSync(localEnv)) {
  dotenv.config({ path: localEnv, override: true });
}

import { GET as getGateStatus } from '../src/app/api/v1/gate/route';
import { handleScan } from '../src/app/api/v1/scan/route';
import { HOLD_CONFIG } from '../src/lib/gating';

async function readSseEvents(stream: ReadableStream<Uint8Array>): Promise<Array<{ event: string; data: any }>> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  const events: Array<{ event: string; data: any }> = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() || '';

    for (const b of blocks) {
      const evMatch = b.match(/event: (\w+)/);
      const dataMatch = b.match(/data: ([\s\S]*)/);
      if (evMatch && dataMatch) {
        try {
          events.push({
            event: evMatch[1],
            data: JSON.parse(dataMatch[1]),
          });
        } catch { }
      }
    }
  }
  return events;
}

async function runLiveE2E() {
  console.log('=== TRACEHOP END-TO-END LIVE PIPELINE TEST ===\n');

  // STEP 1: Test Gate Status API
  console.log('[E2E-1] Testing Gate Status API (/api/v1/gate)...');

  // 1a: Anonymous
  const anonReq = new Request('http://localhost:3000/api/v1/gate', {
    headers: { 'x-forwarded-for': '127.0.0.1' },
  });
  const anonRes = await getGateStatus(anonReq);
  const anonJson = await anonRes.json();
  console.log(`  ✓ Anonymous gate: mode=${anonJson.mode}, anonRemaining=${anonJson.anonRemaining}, access=${anonJson.access}`);
  if (!anonJson.anonAllowed || anonJson.access !== true) {
    throw new Error('Anonymous gate expected access=true');
  }

  // 1b: Non-holder EVM wallet
  const nonHolderWallet = '0x0000000000000000000000000000000000000000';
  const nonHolderReq = new Request(`http://localhost:3000/api/v1/gate?wallet=${nonHolderWallet}`, {
    headers: { 'x-forwarded-for': '127.0.0.1' },
  });
  const nonHolderRes = await getGateStatus(nonHolderReq);
  const nonHolderJson = await nonHolderRes.json();
  console.log(`  ✓ Non-holder gate: tier=${nonHolderJson.tier}, balance=${nonHolderJson.formattedBalance}, access=${nonHolderJson.access}`);
  if (nonHolderJson.tier !== 0 || nonHolderJson.access !== false) {
    throw new Error('Non-holder gate expected access=false');
  }

  // 1c: Holder EVM wallet (Drill bot wallet holding 999M ARDRILL)
  const holderWallet = '0xc878177480320cb5d1E647BdA991aC7d01B641a8';
  const holderReq = new Request(`http://localhost:3000/api/v1/gate?wallet=${holderWallet}`, {
    headers: { 'x-forwarded-for': '127.0.0.1' },
  });
  const holderRes = await getGateStatus(holderReq);
  const holderJson = await holderRes.json();
  console.log(`  ✓ Holder gate: tier=${holderJson.tier}, balance=${holderJson.formattedBalance} ${holderJson.symbol}, access=${holderJson.access}, reason=${holderJson.accessReason}`);
  if (holderJson.tier !== 2 || holderJson.access !== true) {
    throw new Error('Holder gate expected tier=2, access=true');
  }

  // STEP 2: Live Solana Scan (Streaming SSE)
  console.log('\n[E2E-2] Testing Live Solana Scan with Batch Parsing & Parallel Tracing...');
  const solanaMint = 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'; // BONK
  const testIp = `198.51.100.${Math.floor(Math.random() * 200) + 10}`;

  const t0 = Date.now();
  const scanRes = await handleScan(solanaMint, true, null, testIp);
  if (scanRes.status !== 200 || !scanRes.body) {
    throw new Error(`Scan failed with HTTP ${scanRes.status}`);
  }

  const events = await readSseEvents(scanRes.body);
  const elapsedMs = Date.now() - t0;
  console.log(`  ✓ Solana Scan completed in ${(elapsedMs / 1000).toFixed(2)}s (Target < 15s)`);
  console.log(`  ✓ Total SSE events received: ${events.length}`);

  const eventTypes = events.map(e => e.event);
  console.log(`  ✓ Event sequence: ${[...new Set(eventTypes)].join(' -> ')}`);

  const verdictEvent = events.find(e => e.event === 'verdict');
  if (!verdictEvent) {
    throw new Error('Solana scan did not emit a final verdict event!');
  }
  console.log(`  ✓ Final Verdict: ${verdictEvent.data.verdict} (Confidence: ${Math.round(verdictEvent.data.confidence * 100)}%, Subclass: ${verdictEvent.data.subclass})`);
  console.log(`  ✓ Reasons: ${verdictEvent.data.reasons?.map((r: any) => r.text).join('; ')}`);

  if (elapsedMs > 25000) {
    throw new Error(`Solana scan took too long: ${elapsedMs}ms`);
  }

  // STEP 3: Live EVM Scan (Streaming SSE)
  console.log('\n[E2E-3] Testing Live EVM Scan...');
  const evmMint = '0x901fc7e22b7bc7353c66f0344a521e6533bf665f'; // ARDRILL Token
  const tEvm0 = Date.now();
  const evmScanRes = await handleScan(evmMint, true, holderWallet, testIp);
  if (evmScanRes.status !== 200 || !evmScanRes.body) {
    throw new Error(`EVM Scan failed with HTTP ${evmScanRes.status}`);
  }

  const evmEvents = await readSseEvents(evmScanRes.body);
  const evmElapsedMs = Date.now() - tEvm0;
  console.log(`  ✓ EVM Scan completed in ${(evmElapsedMs / 1000).toFixed(2)}s (Target < 5s)`);

  const evmVerdict = evmEvents.find(e => e.event === 'verdict');
  if (!evmVerdict) {
    throw new Error('EVM scan did not emit a final verdict event!');
  }
  console.log(`  ✓ EVM Verdict: ${evmVerdict.data.verdict} (Confidence: ${Math.round(evmVerdict.data.confidence * 100)}%)`);

  // STEP 4: Gating Enforcement (Non-holder blocked on 4th scan)
  console.log('\n[E2E-4] Testing Gating Gating Exhaustion & 402 Handling...');
  const exhaustIp = `203.0.113.${Math.floor(Math.random() * 200) + 10}`;
  // 3 free scans
  for (let i = 1; i <= 3; i++) {
    const res = await handleScan(evmMint, false, null, exhaustIp);
    if (res.status !== 200) throw new Error(`Anon scan #${i} expected 200, got ${res.status}`);
  }
  // 4th scan must return 402
  const blockedRes = await handleScan(evmMint, false, null, exhaustIp);
  const blockedJson = await blockedRes.json();
  console.log(`  ✓ 4th anonymous scan properly blocked: HTTP ${blockedRes.status}, error=${blockedJson.error}, reason=${blockedJson.reason}`);
  if (blockedRes.status !== 402 || blockedJson.error !== 'ANON_EXHAUSTED') {
    throw new Error(`Expected 402 ANON_EXHAUSTED, got ${blockedRes.status} ${blockedJson.error}`);
  }

  // Holder bypasses anon limit
  const holderBypassRes = await handleScan(evmMint, false, holderWallet, exhaustIp);
  if (holderBypassRes.status !== 200) {
    throw new Error(`Holder bypass failed, expected 200, got ${holderBypassRes.status}`);
  }
  const holderBypassJson = await holderBypassRes.json();
  console.log(`  ✓ Holder bypass succeeded: HTTP 200, verdict=${holderBypassJson.verdict}`);

  console.log('\n🎉 ALL END-TO-END LIVE PIPELINE TESTS PASSED 100%! 🎉');
}

runLiveE2E().catch((err) => {
  console.error('\n❌ E2E LIVE TEST FAILED:', err);
  process.exit(1);
});
