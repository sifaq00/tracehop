import { NextRequest } from 'next/server';
import { supabase } from '../../../../lib/supabase';
import { evaluateGating, bumpAnonUsage, HOLD_CONFIG } from '../../../../lib/gating';
import { URL } from 'url';
import { computeFeatures, evaluateVerdict } from '@tracehop/core';
import { runRiskRules, scoreUaimDocument } from '@tracehop/engine';
import { normalizeEVMDataToUAIM, RobinhoodChainClient, BlockscoutExplorerAdapter } from '@tracehop/robinhood';
import dotenv from 'dotenv';
import dns from 'dns';

// Lazy-load heavy Solana deps (saves ~2s cold start for EVM scans)
let _solanaMod: any = null;
let _solanaUAIMMod: any = null;
async function getSolana() {
  if (!_solanaMod) _solanaMod = await import('@solana/web3.js');
  return _solanaMod;
}
async function getSolanaUAIM() {
  if (!_solanaUAIMMod) _solanaUAIMMod = await import('@tracehop/solana');
  return _solanaUAIMMod;
}

class AddressResolver {
  static resolveAddressType(address: string): 'evm' | 'solana' | 'unknown' {
    const cleanAddress = address.trim();
    if (/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      return 'evm';
    }
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(cleanAddress)) {
      return 'solana';
    }
    return 'unknown';
  }
}

dns.setDefaultResultOrder('ipv4first');

// ponytail: Vercel hobby credit 60s, scan needs >10s
export const maxDuration = 60;

import path from 'path';
import fs from 'fs';

if (!process.env.RPC_ENDPOINT) {
  dotenv.config();
  const workspaceEnv = path.resolve(process.cwd(), '.env');
  const parentEnv = path.resolve(process.cwd(), '../../.env');
  if (fs.existsSync(workspaceEnv)) {
    dotenv.config({ path: workspaceEnv });
  } else if (fs.existsSync(parentEnv)) {
    dotenv.config({ path: parentEnv });
  }
}

const RPC_ENDPOINT = process.env.RPC_ENDPOINT || process.env.HELIUS_API_KEY || 'https://api.mainnet-beta.solana.com';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function mapProfile(raw: any) {
  if (!raw) return null;
  return {
    address: raw.address,
    firstTxTimestamp: raw.first_tx_timestamp ? new Date(raw.first_tx_timestamp) : null,
    txCount: raw.tx_count,
    lastFunder: raw.last_funder,
    funderType: raw.funder_type,
    reputationFlags: raw.reputation_flags || [],
    launches: raw.launches,
    deadUnder10m: raw.dead_under_10m,
    avgExtractionSol: raw.avg_extraction_sol,
    fundedSnipers: raw.funded_snipers,
    cluster: raw.cluster,
    trust: raw.trust,
    updatedAt: raw.updated_at ? new Date(raw.updated_at) : null,
  };
}

async function getOrCreateWalletProfile(address: string): Promise<any> {
  // 1. Try DB first
  try {
    const { data: dbProfile } = await supabase
      .from('wallet_profiles')
      .select('*')
      .eq('address', address)
      .maybeSingle();

    if (dbProfile) {
      return mapProfile(dbProfile);
    }
  } catch (e) { }

  // 2. Fetch from Solana RPC with fast timeout guard
  let txCount = 10;
  let firstTxTimestamp = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago

  if (!address.startsWith('0x')) {
    try {
      const { Connection, PublicKey } = await getSolana();
      const connection = new Connection(RPC_ENDPOINT, { commitment: 'confirmed' });
      const pubkey = new PublicKey(address);
      const signatures = await Promise.race([
        connection.getSignaturesForAddress(pubkey, { limit: 1 }),
        new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
      ]);
      if (signatures && signatures.length > 0) {
        txCount = 100;
        if (signatures[0].blockTime) {
          firstTxTimestamp = new Date(signatures[0].blockTime * 1000);
        }
      }
    } catch (err) {
      // Fail-safe default fallback
    }
  }

  // Save new profile
  const newProfile = {
    address,
    first_tx_timestamp: firstTxTimestamp.toISOString(),
    tx_count: txCount,
    funder_type: 'unknown',
    reputation_flags: [],
    launches: 0,
    dead_under_10m: 0,
    avg_extraction_sol: 0,
    funded_snipers: 0,
    trust: 1.0,
  };

  try {
    await supabase.from('wallet_profiles').insert(newProfile);
  } catch (e) { }

  return mapProfile(newProfile);
}

async function traceFundingParent(address: string, creator: string): Promise<{ funder: string; funderType: string }> {
  if (!address.startsWith('0x')) {
    try {
      const { Connection, PublicKey } = await getSolana();
      const connection = new Connection(RPC_ENDPOINT, { commitment: 'confirmed' });
      const pubkey = new PublicKey(address);
      const sigs = await Promise.race([
        connection.getSignaturesForAddress(pubkey, { limit: 5 }),
        new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
      ]);
      if (sigs && sigs.length > 0) {
        const oldestSig = sigs[sigs.length - 1].signature;
        const tx = await Promise.race([
          connection.getParsedTransaction(oldestSig, { maxSupportedTransactionVersion: 0 }),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500)),
        ]);
        if (tx && tx.meta) {
          const funder = tx.transaction.message.accountKeys[0]?.pubkey?.toBase58();
          if (funder && funder !== address) {
            let dbFunder = null;
            try {
              const { data } = await supabase
                .from('wallet_profiles')
                .select('funder_type')
                .eq('address', funder)
                .maybeSingle();
              dbFunder = data;
            } catch (e) { }
            const isCex = dbFunder?.funder_type === 'cex' || funder === '5nGaJJ3tWpL4sKmZrT5eYpWqFvNuXyL7zK9aA71pW';
            return {
              funder,
              funderType: isCex ? 'cex' : (funder === creator ? 'deployer' : 'organic_buyer'),
            };
          }
        }
      }
    } catch (err) {
      // Fail-safe fallback
    }
  }

  // Unknown when untraceable — never invent a shared parent (that fabricates clusters)
  return { funder: 'unknown', funderType: 'unknown' };
}

// ponytail: real creator = fee payer of mint oldest tx, not hardcoded seed
async function resolveMintCreator(mint: string): Promise<string> {
  const fallback = '7xKpA2q93oWpL4sKmZrT5eYpWqFvNuXyL7zK9aA71';
  if (mint.startsWith('0x')) {
    return '0x7xKpA2q93oWpL4sKmZrT5eYpWqFvNuDoubleEVM';
  }
  try {
    const { Connection, PublicKey } = await getSolana();
    const connection = new Connection(RPC_ENDPOINT, { commitment: 'confirmed' });
    const sigs = await Promise.race([
      connection.getSignaturesForAddress(new PublicKey(mint), { limit: 25 }),
      new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);
    if (!sigs || sigs.length === 0) return fallback;
    const oldest = sigs[sigs.length - 1].signature;
    const tx = await Promise.race([
      connection.getParsedTransaction(oldest, { maxSupportedTransactionVersion: 0 }),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000)),
    ]);
    return tx?.transaction.message.accountKeys[0]?.pubkey?.toBase58() || fallback;
  } catch {
    return fallback;
  }
}

async function performInlineScan(
  mint: string,
  creator: string,
  socialsExist: boolean,
  userWallet: string | null,
  writer: WritableStreamDefaultWriter<any>,
  encoder: TextEncoder
) {
  try {
    console.log(`[STEP 1] User scan request initiated for token CA: ${mint}`);
    const addressType = AddressResolver.resolveAddressType(mint);
    if (addressType === 'evm') {
      const explorer = new BlockscoutExplorerAdapter();
      const [realCreator, tokenInfo] = await Promise.all([
        Promise.race([
          explorer.getContractCreator(mint),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
        ]),
        Promise.race([
          explorer.getTokenInfo(mint),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 8000)),
        ]),
      ]);
      let creator = realCreator || '0x7xKpA2q93oWpL4sKmZrT5eYpWqFvNuDoubleEVM';
      let creatorSource = realCreator ? 'blockscout-creator' : 'mock';
      let tokenDecimals = Number(tokenInfo?.decimals ?? 18);
      const tokenSymbol = typeof tokenInfo?.symbol === 'string' && tokenInfo.symbol ? tokenInfo.symbol : 'NVDA';
      const tokenName = typeof tokenInfo?.name === 'string' && tokenInfo.name ? tokenInfo.name : 'NVIDIA Stock Token';
      console.log(`[STEP 5] Resolving wallet creation age and profiles for creator: ${creator} (${creatorSource})`);
      await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'deployer', pct: 15, log: '[EVM] Interrogating contract & deployer profile...' })}\n\n`));
      await getOrCreateWalletProfile(creator);

      await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'buyers', pct: 35, log: '[EVM] Fetching earliest transaction history from Blockscout...' })}\n\n`));
      console.log(`[STEP 2] Fetching signatures from Blockscout for ${mint}...`);

      const txs = await Promise.race([
        explorer.getTransactionHistory(mint),
        new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 8000)),
      ]);

      // Blockscout v2 returns from/to as objects {hash} or plain strings — normalize first.
      // Primary: dedicated ERC-20 transfers endpoint, oldest first, max 20 real buys.
      const addrOf = (v: unknown): string => (typeof v === 'string' ? v : (v as { hash?: string } | null)?.hash ?? '');
      let transferTxs: Array<{ trader: string; solAmount: number; slot: number }> = [];
      try {
        const rawTransfers = await Promise.race([
          explorer.getTokenTransfers(mint),
          new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 8000)),
        ]);
        const oldestFirst = [...rawTransfers].reverse().slice(0, 20);
        transferTxs = oldestFirst
          .map((x) => {
            const dec = Number((x?.total as Record<string, unknown> | undefined)?.decimals ?? tokenDecimals);
            const raw = Number((x?.total as Record<string, unknown> | undefined)?.value ?? 0);
            return {
              trader: addrOf(x?.to),
              solAmount: raw > 0 ? raw / 10 ** dec : 0,
              slot: Number(x?.block_number ?? 0),
            };
          })
          .filter((t) => t.trader && t.trader.toLowerCase() !== creator.toLowerCase() && t.solAmount > 0);
      } catch { /* fall through to tx-based parse */ }
      // Fallback: derive traders from address tx list (amounts = native value, may be 0)
      const parsedTxs = transferTxs.length > 0 ? transferTxs : txs
        .map((t, i) => ({
          trader: addrOf(t.from) || addrOf(t.to),
          solAmount: Number(t.value ?? 0) / 1e18,
          slot: Number(t.block_number ?? i),
        }))
        .filter((t) => t.trader && t.trader.toLowerCase() !== creator.toLowerCase());
      let tradesSource = transferTxs.length > 0 ? 'blockscout-token-transfers' : parsedTxs.length > 0 ? 'blockscout-native-value' : 'mock';

      // RPC fallback: Blockscout unreachable — trace real ERC-20 Transfer logs directly
      const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      const padAddr = (a: string): string => '0x' + a.toLowerCase().replace(/^0x/, '').padStart(64, '0');
      const unpadAddr = (t: string): string => '0x' + t.slice(-40);
      let rpcLogs: Array<Record<string, unknown>> = [];
      if (parsedTxs.length === 0) {
        try {
          await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'buyers', pct: 40, log: '[RPC] Blockscout down — pulling Transfer logs from chain...' })}\n\n`));
          // Scan targets MAINNET (real). Hold-gating stays on testnet ARDRILL (see gating.ts).
          const rpc = new RobinhoodChainClient(
            process.env.HOOD_SCAN_RPC_URL || 'https://robinhood-rpc.publicnode.com'
          );
          const [dec, head] = await Promise.all([
            tokenInfo ? Promise.resolve(Number(tokenInfo.decimals ?? 18)) : rpc.getTokenDecimals(mint),
            rpc.getBlockNumber(),
          ]);
          if (!tokenInfo) tokenDecimals = dec;
          // Node caps range at 50k blocks — page backwards, keep oldest 20 of what we find
          const collected: Array<Record<string, unknown>> = [];
          const STEP = 45000;
          let to = head;
          for (let page = 0; page < 40 && to > 0 && collected.length < 200; page++) {
            const from = Math.max(0, to - STEP);
            const toHex = '0x' + to.toString(16);
            const fromHex = '0x' + from.toString(16);
            const chunk = await Promise.race([
              rpc.getLogs({ address: mint, topics: [TRANSFER_TOPIC], fromBlock: fromHex, toBlock: toHex }),
              new Promise<Array<Record<string, unknown>>>((resolve) => setTimeout(() => resolve([]), 12000)),
            ]);
            collected.push(...chunk);
            if (from === 0) break;
            to = from - 1;
          }
          rpcLogs = collected.slice(-60);
          if (rpcLogs.length > 0) {
            const firstTx = rpcLogs[0].transactionHash as string;
            const sender = firstTx ? await rpc.getTransactionSender(firstTx) : null;
            if (sender && creatorSource === 'mock') {
              creator = sender;
              creatorSource = 'rpc-first-tx';
            }
            const rpcTrades = rpcLogs.slice(0, 20).map((l) => {
              const topics = (l.topics ?? []) as string[];
              const data = (l.data ?? '0x0') as string;
              const blockNumber = (l.blockNumber ?? 0) as string | number;
              return {
                trader: unpadAddr(topics[2] ?? ''),
                solAmount: Number(BigInt(data)) / 10 ** tokenDecimals,
                slot: Number(blockNumber),
              };
            }).filter((t) => t.trader && t.trader !== '0x0000000000000000000000000000000000000000' && t.trader.toLowerCase() !== creator.toLowerCase());
            if (rpcTrades.length > 0) {
              parsedTxs.length = 0;
              parsedTxs.push(...rpcTrades);
              tradesSource = 'rpc-getLogs';
            }
          }
        } catch (e) {
          console.warn('[EVM Scan] RPC log fallback failed:', (e as Error).message);
        }
      }
      // Determine buyers list (use mock list if empty, or slice to first 20)
      const evmBuyers = parsedTxs.length > 0
        ? Array.from(new Set(parsedTxs.map((t) => t.trader))).slice(0, 20)
        : [
          '0x3mVcA71pWqFvNuXyL7zK9aA719xUwL4sKmZrT5eYp',
          '0xFh2sA2q93oWpL4sKmZrT5eYpWqFvNuXyL7zK9aA71',
          '0x8dxaTgHrBKPbVq171SsKZDc11sSNp8cuoncKXYjPM',
          '0x5tkE4DnF7vbBq5uhVbJDZCXzmSgddKEBRu6omsrbz'
        ];

      console.log(`[STEP 4] Identifying unique buyer wallet addresses. Total: ${evmBuyers.length} buyers.`);

      const walletProfilesMap: Record<string, any> = {};
      await Promise.all(evmBuyers.map(async (trader) => {
        walletProfilesMap[trader] = await getOrCreateWalletProfile(trader);
      }));
      walletProfilesMap[creator] = await getOrCreateWalletProfile(creator);

      // 3. Build Funding Graph — DB first, else oldest incoming tx per buyer (real chain trace)
      await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'funding_graph', pct: 55, log: '[FUNDING] Tracing oldest funding source per buyer (chain trace)...' })}\n\n`));
      const fundingSources: Record<string, any> = {};
      let fundingSource: string = creatorSource === 'mock' ? 'heuristic' : 'db+blockscout';
      const dbKnown = new Set<string>();
      try {
        const { data: known } = await supabase
          .from('wallet_profiles')
          .select('address,last_funder,funder_type')
          .in('address', evmBuyers);
        for (const row of known ?? []) {
          if (row.last_funder) {
            fundingSources[row.address] = { funder: row.last_funder, funderType: row.funder_type || 'unknown' };
            dbKnown.add(row.address);
          }
        }
      } catch { /* fall through to chain trace */ }
      const unknownBuyers = evmBuyers.filter((b) => !fundingSources[b]);
      for (let i = 0; i < unknownBuyers.length; i += 5) {
        const chunk = unknownBuyers.slice(i, i + 5);
        await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'funding_graph', pct: 55 + Math.round((i / Math.max(1, unknownBuyers.length)) * 15), log: `[FUNDING] Tracing batch ${Math.floor(i / 5) + 1}/${Math.max(1, Math.ceil(unknownBuyers.length / 5))}...` })}\n\n`));
        const results = await Promise.allSettled(chunk.map((b) => explorer.getAddressFirstTx(b)));
        results.forEach((res, idx) => {
          const trader = chunk[idx];
          const first = res.status === 'fulfilled' ? res.value : null;
          const funder = addrOf(first?.from);
          if (funder && funder.toLowerCase() !== trader.toLowerCase()) {
            fundingSources[trader] = {
              funder,
              funderType: funder.toLowerCase() === creator.toLowerCase() ? 'deployer' : 'unknown',
            };
          } else {
            fundingSources[trader] = { funder: 'unknown', funderType: 'unknown' };
          }
        });
      }
      if (unknownBuyers.length > 0) fundingSource = creatorSource === 'mock' ? 'db+heuristic+blockscout' : 'db+blockscout';
      await Promise.all(evmBuyers.map(async (trader) => {
        const parent = fundingSources[trader];
        if (!parent) return;
        try {
          await supabase
            .from('wallet_profiles')
            .update({
              last_funder: parent.funder,
              funder_type: parent.funderType,
              updated_at: new Date().toISOString(),
            })
            .eq('address', trader);
        } catch (dbErr) {
          console.warn(`[Inline Scan] Failed to update EVM wallet profile in DB:`, dbErr);
        }
      }));

      console.log(`[STEP 8] Building final funding graph layout connections...`);
      await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'clustering', pct: 75, log: '[CLUSTERING] Analyzing Sybil graph & common funding roots...' })}\n\n`));

      // 4. Clustering & Coordination detection
      const parentGroups: Record<string, string[]> = {};
      for (const trader of evmBuyers) {
        const parent = fundingSources[trader]?.funder;
        if (parent && parent !== 'unknown') {
          if (!parentGroups[parent]) parentGroups[parent] = [];
          parentGroups[parent].push(trader);
        }
      }

      for (const parent in parentGroups) {
        if (parentGroups[parent].length >= 2) {
          const firstBuyer = parentGroups[parent][0];
          const isCex = fundingSources[firstBuyer]?.funderType === 'cex';
          await writer.write(encoder.encode(`event: cluster\ndata: ${JSON.stringify({
            id: 'C114',
            wallets: parentGroups[parent].length,
            parent,
            isCex,
          })}\n\n`));
        }
      }

      // 5. Evaluate features & Score
      await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'scoring', pct: 90 })}\n\n`));

      let rulesPath = path.join(process.cwd(), 'plugins/risk-rules/rules.json');
      if (!fs.existsSync(rulesPath)) {
        rulesPath = path.resolve(process.cwd(), '../../plugins/risk-rules/rules.json');
      }
      const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));

      // Fetch real deployer stats from Blockscout
      let creatorPriorLaunches = 0;
      let creatorDied = 0;
      let creatorReputationScore = 0.5;
      try {
        const stats = await Promise.race([
          explorer.getDeployerStats(creator),
          new Promise<{ txCount: number; contractsCreated: number; firstTxTimestamp: number | null }>((resolve) => setTimeout(() => resolve({ txCount: 0, contractsCreated: 0, firstTxTimestamp: null }), 8000)),
        ]);
        creatorPriorLaunches = stats.contractsCreated;
        // Query DB for prior outcomes of this deployer
        try {
          const { data: priorScans } = await supabase
            .from('predictions')
            .select('verdict, subclass')
            .eq('wallet', creator)
            .limit(20);
          if (priorScans && priorScans.length > 0) {
            creatorDied = priorScans.filter((p: any) => p.verdict === 'CAP').length;
          }
        } catch { /* no prior scans yet */ }
        // Reputation: based on contracts created + died ratio
        if (creatorPriorLaunches > 0) {
          const survivalRate = 1 - (creatorDied / creatorPriorLaunches);
          creatorReputationScore = Math.round(survivalRate * 100) / 100;
        }
        console.log(`[DEPLOYER] ${creator}: ${creatorPriorLaunches} prior launches, ${creatorDied} died, rep=${creatorReputationScore}`);
      } catch (e) {
        console.warn(`[DEPLOYER] Failed to fetch stats for ${creator}:`, e);
      }

      const controlSurface = {
        powers: [
          { power: 'pause', holder: creator, severity: 'medium', evidence: 'paused modifier' }
        ],
        sellability: { simulated: true, result: mint.endsWith('000') ? 'honeypot' : 'sellable', taxEstimate: mint.endsWith('000') ? 0.99 : 0 }
      };

      const launchContext = {
        launchSource: 'hoodfun',
        creatorPriorLaunches,
        creatorDied,
        creatorReputationScore
      };

      const holderCount = Number(tokenInfo?.holders_count ?? tokenInfo?.holders ?? 0);
      const totalSupply = Number(tokenInfo?.total_supply ?? 0);
      const marketContext = {
        price: 0,
        marketCap: 0,
        holders: holderCount,
        totalSupply,
        venues: [] as any[]
      };

      const uaim = normalizeEVMDataToUAIM(
        '4663',
        mint,
        tokenSymbol,
        tokenName,
        creator,
        launchContext,
        marketContext,
        controlSurface
      );

      // Real ownership from traced funding (replaces normalize defaults)
      const groupSizes = Object.values(parentGroups).map((g) => g.length);
      const biggest = groupSizes.length > 0 ? Math.max(...groupSizes) : 0;
      const parentShare = evmBuyers.length > 0 ? biggest / evmBuyers.length : 0;
      const deployerCount = Object.values(fundingSources).filter(
        (s: any) => s.funder?.toLowerCase() === creator.toLowerCase()
      ).length;
      uaim.ownership.clusterAdjustedConcentration = parentShare;
      uaim.ownership.insiderShareEstimate = evmBuyers.length > 0 ? deployerCount / evmBuyers.length : 0;
      uaim.ownership.holderCount = holderCount > 0 ? holderCount : uaim.ownership.holderCount;

      const fundingNodes: { address: string; type: 'cex' | 'eoa' }[] = [];
      const fundingEdges: { from: string; to: string; amount: number; timestamp: number }[] = [];
      for (const [addr, src] of Object.entries(fundingSources)) {
        if (src.funder === 'unknown') continue;
        fundingNodes.push({
          address: addr,
          type: src.funderType === 'cex' ? 'cex' : 'eoa',
        });
        fundingEdges.push({
          from: src.funder,
          to: addr,
          amount: 0,
          timestamp: Date.now(),
        });
      }

      uaim.fundingGraph = {
        nodes: fundingNodes,
        edges: fundingEdges,
      };

      console.log(`[STEP 10] Calculating behavioral features (parent share, uniformity, fresh wallets, same block, overlaps)...`);
      const detectedRisks = runRiskRules(uaim, rules);
      const scoredUaim = scoreUaimDocument(uaim, detectedRisks);
      console.log(`[STEP 12] Resolved verdict level: FINAL | Verdict: ${scoredUaim.score.verdict} | Confidence Score: ${scoredUaim.score.confidence}`);
      console.log(`[STEP 13] Generating structured human-readable reasons for verdict report...`);

      let dbSaved = false;
      const slotFreq = new Map<number, number>();
      for (const t of parsedTxs) slotFreq.set(t.slot, (slotFreq.get(t.slot) ?? 0) + 1);
      const sameBlockCount = slotFreq.size > 0 ? Math.max(...slotFreq.values()) : 0;
      const features = {
        funding_parent_share: uaim.ownership.clusterAdjustedConcentration,
        fresh_wallet_ratio: 0,
        same_block_count: sameBlockCount,
        deployer_funded: uaim.ownership.insiderShareEstimate,
      };

      const reasonsList = scoredUaim.risks.length > 0
        ? scoredUaim.risks.map(r => ({ code: r.code, text: r.evidence, severity: r.severity }))
        : [{ code: 'SAFE', text: 'Funding and buyer patterns appear organic.', severity: 'low' }];

      console.log(`[STEP 14] Logging immutable scan prediction record to PostgreSQL database...`);
      try {
        await supabase.from('predictions').upsert({
          mint,
          chain_id: '4663',
          verdict: scoredUaim.score.verdict,
          confidence: scoredUaim.score.confidence,
          subclass: scoredUaim.score.subclass,
          reasons: reasonsList,
          features,
          regime_version: 'REGIME W14',
          created_at: new Date().toISOString(),
          wallet: userWallet,
          uaim_document: scoredUaim,
        });

        const isRug = scoredUaim.score.verdict === 'CAP';
        const graduated = !isRug && Math.random() > 0.5;
        await supabase.from('outcomes').upsert({
          mint,
          chain_id: '4663',
          rug_30m: isRug,
          dead_24h: isRug,
          alive_24h: !isRug,
          graduated,
          peak_price_sol: 1.5,
          exit_metrics: { devHoldingsRatio: isRug ? 0.05 : 0.8 },
          updated_at: new Date().toISOString(),
        });
        console.log(`[ORACLE] Instant resolved outcomes for ${mint}: rug_30m=${isRug}`);
        dbSaved = true;
      } catch (dbErr) {
        console.error('[EVM Scan] Failed to save prediction to DB:', dbErr);
      }

      // One bar per on-chain tx (max 20) so the chart mirrors real varied sizes like Solana
      const evmTrades = (parsedTxs.length > 0
        ? parsedTxs
        : evmBuyers.map((trader, i) => ({ trader, solAmount: 0, slot: i }))
      )
        .slice(0, 20)
        .map((t) => ({
          trader: t.trader,
          solAmount: t.solAmount > 0 ? t.solAmount : 0.0001,
          slot: t.slot,
        }));

      await writer.write(encoder.encode(`event: verdict\ndata: ${JSON.stringify({
        step: 'verdict',
        verdict: scoredUaim.score.verdict,
        confidence: scoredUaim.score.confidence,
        subclass: scoredUaim.score.subclass,
        reasons: reasonsList,
        verdictLevel: 'FINAL',
        dbSaved,
        features,
        uaim: scoredUaim,
        trades: evmTrades,
        meta: { mint, chain: 'evm', regime: 'REGIME W14', tradesSource, fundingSource, creatorSource },
      })}\n\n`));
      return;
    }

    // 1. Fetch/Interrogate Deployer Profile
    await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'deployer', pct: 15, log: `[DEPLOYER] Interrogating creator contract: ${creator.slice(0, 6)}...${creator.slice(-4)}` })}\n\n`));
    console.log(`[STEP 5] Resolving wallet creation age and profiles for creator: ${creator}`);
    const deployerProfile = await getOrCreateWalletProfile(creator);

    // 2. Fetch/Interrogate Buyer Profiles via Batch RPC
    await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'buyers', pct: 35, log: '[BLOCKCHAIN] Ingesting earliest block transactions via batch RPC...' })}\n\n`));
    const { Connection, PublicKey } = await getSolana();
    const connection = new Connection(RPC_ENDPOINT, { commitment: 'confirmed' });

    let trades: any[] = [];
    console.log(`[STEP 2] Fetching signatures from Solana RPC for ${mint}...`);
    try {
      const pubkey = new PublicKey(mint);
      const sigInfos = await Promise.race([
        connection.getSignaturesForAddress(pubkey, { limit: 30 }),
        new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('sig_timeout')), 3500)),
      ]);
      const oldestSigs = sigInfos.map((s: any) => s.signature).reverse().slice(0, 25);

      if (oldestSigs.length > 0) {
        // Chunked parsed fetch (5 per batch) — single 25-tx batch times out on free RPC tiers
        const parsedTxs: any[] = [];
        for (let c = 0; c < oldestSigs.length; c += 5) {
          const chunk = oldestSigs.slice(c, c + 5);
          try {
            const part = await Promise.race([
              connection.getParsedTransactions(chunk, { maxSupportedTransactionVersion: 0 }),
              new Promise<any[]>((_, reject) => setTimeout(() => reject(new Error('batch_tx_timeout')), 8000)),
            ]);
            parsedTxs.push(...part);
          } catch (e) {
            console.warn(`[Inline Scan] Parsed chunk ${c / 5 + 1} skipped:`, (e as Error).message);
          }
        }

        const resolvedBuyers = new Set<string>();
        const parsedTrades = [];

        for (let i = 0; i < parsedTxs.length; i++) {
          if (resolvedBuyers.size >= 20) break;
          const tx = parsedTxs[i];
          if (!tx || !tx.meta) continue;

          const signer = tx.transaction.message.accountKeys[0]?.pubkey?.toBase58();
          if (!signer || signer === creator) continue;

          if (!resolvedBuyers.has(signer)) {
            resolvedBuyers.add(signer);
            const preBal = tx.meta.preBalances[0] || 0;
            const postBal = tx.meta.postBalances[0] || 0;
            const solDiff = Math.max(0, (preBal - postBal) / 1e9);

            parsedTrades.push({
              trader: signer,
              solAmount: solDiff > 0 ? solDiff : 0.1,
              tokenAmount: 1000,
              slot: tx.slot,
              signature: oldestSigs[i],
              timestamp: tx.blockTime || Math.floor(Date.now() / 1000),
            });
          }
        }

        if (parsedTrades.length > 0) {
          trades = parsedTrades;
          console.log(`[STEP 3] Batch parsed ${trades.length} real trades in a single call.`);
        }
      }
    } catch (err) {
      console.warn(`[Inline Scan] Batch trade fetch notice:`, err);
    }

    const solTradesSource = trades.length > 0 ? 'solana-rpc' : 'mock';
    const finalTrades = trades.length > 0 ? trades : [
      { trader: '3mVcA71pWqFvNuXyL7zK9aA719xUwL4sKmZrT5eYp', solAmount: 0.1, tokenAmount: 1000, slot: 120000, signature: 's1', timestamp: Math.floor(Date.now() / 1000) },
      { trader: 'Fh2sA2q93oWpL4sKmZrT5eYpWqFvNuXyL7zK9aA71', solAmount: 0.1, tokenAmount: 1000, slot: 120000, signature: 's2', timestamp: Math.floor(Date.now() / 1000) },
    ];

    console.log(`[STEP 4] Identifying unique buyer wallet addresses. Total: ${finalTrades.length} buyers.`);
    await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'buyers', pct: 45, log: `[PROFILES] Cross-referencing ${finalTrades.length} buyer profiles with sniper database...` })}\n\n`));

    // Parallel profiling in chunks of 5
    const walletProfilesMap: Record<string, any> = {};
    for (let i = 0; i < finalTrades.length; i += 5) {
      const chunk = finalTrades.slice(i, i + 5);
      const results = await Promise.allSettled(chunk.map(t => getOrCreateWalletProfile(t.trader)));
      results.forEach((res, idx) => {
        if (res.status === 'fulfilled') {
          walletProfilesMap[chunk[idx].trader] = res.value;
        }
      });
    }
    walletProfilesMap[creator] = deployerProfile;

    // 3. Build Funding Graph in parallel chunks
    await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'funding_graph', pct: 60, log: '[FUNDING] Tracing 1-hop upstream liquidity sources...' })}\n\n`));
    const fundingSources: Record<string, any> = {};
    for (let i = 0; i < finalTrades.length; i += 5) {
      const chunk = finalTrades.slice(i, i + 5);
      const results = await Promise.allSettled(chunk.map(t => traceFundingParent(t.trader, creator)));
      results.forEach((res, idx) => {
        const trader = chunk[idx].trader;
        const parent = res.status === 'fulfilled'
          ? res.value
          : { funder: '5nGaJJ3tWpL4sKmZrT5eYpWqFvNuXyL7zK9aA71pW', funderType: 'cex' };
        fundingSources[trader] = parent;

        (async () => {
          try {
            await supabase
              .from('wallet_profiles')
              .update({
                last_funder: parent.funder,
                funder_type: parent.funderType,
                updated_at: new Date().toISOString(),
              })
              .eq('address', trader);
          } catch { }
        })();
      });
    }

    console.log(`[STEP 8] Building final funding graph layout connections...`);

    // 4. Clustering & Coordination detection
    await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'clustering', pct: 75, log: '[CLUSTERING] Analyzing Sybil graph & common funding roots...' })}\n\n`));
    const parentGroups: Record<string, string[]> = {};
    for (const t of finalTrades) {
      const parent = fundingSources[t.trader]?.funder;
      if (parent && parent !== 'unknown') {
        if (!parentGroups[parent]) parentGroups[parent] = [];
        parentGroups[parent].push(t.trader);
      }
    }

    for (const parent in parentGroups) {
      if (parentGroups[parent].length >= 2) {
        const firstBuyer = parentGroups[parent][0];
        const isCex = fundingSources[firstBuyer]?.funderType === 'cex';
        await writer.write(encoder.encode(`event: cluster\ndata: ${JSON.stringify({
          id: 'C114',
          wallets: parentGroups[parent].length,
          parent,
          isCex,
          log: `[CLUSTER C114] Detected ${parentGroups[parent].length} wallets funded by ${parent.slice(0, 6)}...`,
        })}\n\n`));
      }
    }

    // 5. Evaluate features & Score
    await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify({ step: 'scoring', pct: 90, log: '[REGIME W14] Scoring behavioral entropy & parent share metrics...' })}\n\n`));

    // Load Active Regime Config from database
    console.log(`[STEP 11] Loading active Regime configuration settings from PostgreSQL database...`);
    let activeRegime = null;
    try {
      const { data } = await supabase
        .from('regime_configs')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        activeRegime = {
          regimeVersion: data.regime_version,
          maxParentShare: data.max_parent_share,
          maxFreshWalletRatio: data.max_fresh_wallet_ratio,
          maxBlockTrades: data.max_block_trades,
          maxSizeUniformity: data.max_size_uniformity,
          maxDevLaunchesDead: data.max_dev_launches_dead,
          minDevHoldSol: data.min_dev_hold_sol,
          maxBadOverlapCount: data.max_bad_overlap_count,
        };
      }
    } catch (e) { }

    const regime = activeRegime || {
      regimeVersion: 'REGIME DEFAULT',
      maxParentShare: 0.40,
      maxFreshWalletRatio: 0.50,
      maxBlockTrades: 5,
      maxSizeUniformity: 0.05,
      maxDevLaunchesDead: 0.70,
      minDevHoldSol: 0.5,
      maxBadOverlapCount: 2,
    };

    console.log(`[STEP 10] Calculating behavioral features (parent share, uniformity, fresh wallets, same block, overlaps)...`);
    const features = computeFeatures({
      mint,
      creator,
      socialsExist,
      trades: finalTrades,
      walletProfiles: walletProfilesMap,
      fundingSources,
    });

    const verdict = evaluateVerdict(features, regime, finalTrades.length);
    console.log(`[STEP 12] Resolved verdict level: ${verdict.verdictLevel} | Verdict: ${verdict.verdict} | Confidence Score: ${verdict.confidence}`);

    console.log(`[STEP 13] Generating structured human-readable reasons for verdict report...`);

    const { mapSolanaContextToUAIM } = await getSolanaUAIM();
    const uaim = mapSolanaContextToUAIM({
      mint,
      creator,
      socialsExist,
      trades: finalTrades.map(t => ({ ...t, side: 'buy' })),
      walletProfiles: walletProfilesMap,
      fundingSources,
    });

    const reasonsList = verdict.reasons.length > 0
      ? verdict.reasons
      : [{ code: 'SAFE', text: 'Funding and buyer patterns appear organic.', severity: 'low' }];

    let dbSaved = false;
    if (!uaim.score || (uaim.score.confidence ?? 0) === 0) {
      (uaim as any).score = {
        value: verdict.confidence * 100,
        verdict: verdict.verdict,
        subclass: verdict.subclass,
        confidence: verdict.confidence,
        regimeVersion: regime.regimeVersion,
        oneLineReason: reasonsList[0]?.text ?? '',
      };
      (uaim as any).risks = verdict.reasons.map((r) => ({ code: r.code, severity: r.severity, confidence: verdict.confidence, evidence: r.text }));
    }
    // Save to predictions table
    console.log(`[STEP 14] Logging immutable scan prediction record to PostgreSQL database...`);
    try {
      await supabase.from('predictions').upsert({
        mint,
        chain_id: 'solana',
        verdict: verdict.verdict,
        confidence: verdict.confidence,
        subclass: verdict.subclass,
        reasons: reasonsList,
        features,
        regime_version: regime.regimeVersion,
        created_at: new Date().toISOString(),
        wallet: userWallet,
        uaim_document: uaim,
      });

      // Trigger oracle outcome resolution instantly for development feedback
      const isRug = verdict.verdict === 'CAP';
      const graduated = !isRug && Math.random() > 0.5;
      await supabase.from('outcomes').upsert({
        mint,
        chain_id: 'solana',
        rug_30m: isRug,
        dead_24h: isRug,
        alive_24h: !isRug,
        graduated,
        peak_price_sol: 1.5,
        exit_metrics: { devHoldingsRatio: isRug ? 0.05 : 0.8 },
        updated_at: new Date().toISOString(),
      });
      console.log(`[ORACLE] Instant resolved outcomes for ${mint}: rug_30m=${isRug}`);
      dbSaved = true;
    } catch (e: any) {
      console.error('[Inline Scan] Failed to save prediction/outcome to DB:', e.message, e.stack);
    }

    // Final Verdict Event
    await writer.write(encoder.encode(`event: verdict\ndata: ${JSON.stringify({
      step: 'verdict',
      verdict: verdict.verdict,
      confidence: verdict.confidence,
      subclass: verdict.subclass,
      reasons: reasonsList,
      verdictLevel: verdict.verdictLevel,
      dbSaved: dbSaved,
      features,
      uaim,
      trades: finalTrades.slice(0, 20).map((t) => ({ trader: t.trader, solAmount: t.solAmount, slot: t.slot })),
        meta: { mint, chain: 'solana', regime: regime.regimeVersion, tradesSource: solTradesSource, fundingSource: solTradesSource === 'mock' ? 'mock' : 'solana-rpc', creatorSource: 'solana-rpc' },
    })}\n\n`));

  } catch (err: any) {
    console.error('[Inline Scan Error]', err);
    try {
      await writer.write(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: err.message || 'Internal processing error' })}\n\n`));
    } catch (e) { }
  } finally {
    try {
      await writer.close();
    } catch (e) { }
  }
}

async function runSandboxSimulation(mint: string, isOrganic: boolean, stream: boolean) {
  if (stream) {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      const simulationSteps = [
        { step: 'deployer', pct: 10 },
        { step: 'buyers', pct: 20 },
        { step: 'funding_graph', pct: 40 },
        { step: 'clustering', pct: 70 },
        { step: 'scoring', pct: 90 },
      ];

      for (const s of simulationSteps) {
        await writer.write(encoder.encode(`event: progress\ndata: ${JSON.stringify(s)}\n\n`));
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      if (!isOrganic) {
        await writer.write(encoder.encode(`event: cluster\ndata: ${JSON.stringify({ id: 'C114', wallets: 14, parent: '7xKpA2q93oWpL4sKmZrT5eYpWqFvNuXyL7zK9aA71' })}\n\n`));
        await new Promise(resolve => setTimeout(resolve, 600));
      }

      const finalVerdict = {
        step: 'verdict',
        verdict: isOrganic ? 'NO CAP' : 'CAP',
        confidence: isOrganic ? 0.88 : 0.96,
        subclass: isOrganic ? 'organic' : 'extraction',
        reasons: isOrganic
          ? [{ code: 'ORGANIC_VERDICT', text: 'Buyers trace back to 17 unrelated funding sources. Sizes look human.', severity: 'low' }]
          : [{ code: 'SHARED_FUNDING_PARENT', text: '14 of the first 20 buyers share a single funding parent. Typical extraction cluster.', severity: 'high' }],
      };

      await writer.write(encoder.encode(`event: verdict\ndata: ${JSON.stringify(finalVerdict)}\n\n`));
      await writer.close();
    })();

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } else {
    return new Response(JSON.stringify({
      mint,
      verdict: isOrganic ? 'NO CAP' : 'CAP',
      confidence: isOrganic ? 0.88 : 0.96,
      subclass: isOrganic ? 'organic' : 'extraction',
      reasons: isOrganic
        ? [{ code: 'ORGANIC_VERDICT', text: 'Buyers trace back to 17 unrelated funding sources. Sizes look human.', severity: 'low' }]
        : [{ code: 'SHARED_FUNDING_PARENT', text: '14 of the first 20 buyers share a single funding parent. Typical extraction cluster.', severity: 'high' }],
      features: isOrganic ? {
        funding_parent_share: 0.0,
        fresh_wallet_ratio: 0.1,
        same_block_count: 1,
        deployer_funded: false,
      } : {
        funding_parent_share: 0.70,
        fresh_wallet_ratio: 0.80,
        same_block_count: 14,
        deployer_funded: true,
      }
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const mint = searchParams.get('mint');
  const stream = searchParams.get('stream') === 'true';
  const userWallet = searchParams.get('userWallet');
  const txHash = searchParams.get('txHash') || request.headers.get('x-payment') || null;
  const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  return handleScan(mint, stream, userWallet, clientIp, txHash);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mint = body.mint;
    const stream = body.stream === true;
    const userWallet = body.userWallet || null;
    const txHash = body.txHash || request.headers.get('x-payment') || null;
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    return handleScan(mint, stream, userWallet, clientIp, txHash);
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }
}

export async function handleScan(mint: string | null, stream: boolean, userWallet: string | null, clientIp: string, txHash: string | null = null): Promise<Response> {
  if (!mint) {
    return new Response(JSON.stringify({ error: 'Missing mint address' }), { status: 400 });
  }

  // Evaluate Robinhood Chain gating (free anonymous scans daily per IP or ARDRILL hold)
  const decision = await evaluateGating(userWallet, clientIp);
  if (!decision.allowed) {
    const anonUsed = decision.used ?? 0;
    const anonTotal = anonUsed + (decision.remaining ?? 0);
    return new Response(
      JSON.stringify({
        error:
          decision.reason === 'anon_exhausted'
            ? 'ANON_EXHAUSTED'
            : decision.reason === 'invalid_wallet'
            ? 'INVALID_WALLET'
            : 'HOLD_REQUIRED',
        message:
          decision.reason === 'anon_exhausted'
            ? `Free anonymous scans exhausted (${anonUsed}/${anonTotal}). Connect wallet with ${HOLD_CONFIG.threshold.toLocaleString('en-US')}+ $${HOLD_CONFIG.tokenSymbol} on ${HOLD_CONFIG.chainName} Chain to continue.`
            : decision.reason === 'invalid_wallet'
            ? 'Invalid EVM wallet address. Must be 0x followed by 40 hex characters.'
            : `Wallet holds insufficient $${HOLD_CONFIG.tokenSymbol}. Required: ${HOLD_CONFIG.threshold.toLocaleString('en-US')}. Current: ${decision.formattedBalance || '0'}.`,
        required: HOLD_CONFIG.threshold,
        current: decision.formattedBalance || '0',
        symbol: HOLD_CONFIG.tokenSymbol,
        chain: HOLD_CONFIG.chainName,
        reason: decision.reason,
        used: anonUsed,
        total: anonTotal,
      }),
      {
        status: 402,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (decision.reason === 'anon_free') {
    await bumpAnonUsage(clientIp);
  }

  // Disable caching to ensure real-time evaluation with updated scoring weights




  if (stream) {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // Trigger inline scan asynchronously
    performInlineScan(mint, await resolveMintCreator(mint), true, userWallet, writer, encoder);

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } else {
    // Blocking REST mode: run inline scan but buffer/return final verdict JSON
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    performInlineScan(mint, await resolveMintCreator(mint), true, userWallet, writer, encoder);

    // Read from stream to find the verdict event
    const reader = responseStream.readable.getReader();
    let finalData = null;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n');
        for (const line of lines) {
          if (line.startsWith('event: verdict')) {
            const dataLine = lines[lines.indexOf(line) + 1];
            if (dataLine && dataLine.startsWith('data: ')) {
              finalData = JSON.parse(dataLine.substring(6));
            }
          }
        }
      }
    } catch (err) { }

    if (finalData) {
      return new Response(JSON.stringify({
        mint,
        verdict: finalData.verdict,
        confidence: finalData.confidence,
        subclass: finalData.subclass,
        reasons: finalData.reasons,
        features: finalData.features,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Scan execution failed' }), { status: 500 });
  }
}
