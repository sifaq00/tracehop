import { ExplorerAdapter } from '../../../packages/core/src/adapters/ports.js';

export class BlockscoutExplorerAdapter implements ExplorerAdapter {
  chainId = '4663';
  private apiBase: string;

  constructor() {
    this.apiBase = process.env.BLOCKSCOUT_API_BASE_URL || 'https://explorer.robinhoodchain.com/api/v2';
  }

  async getTransactionHistory(address: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.apiBase}/addresses/${address}/transactions`, {
        signal: AbortSignal.timeout(2500),
      });
      const json = await res.json() as any;
      return json.items || [];
    } catch {
      return [];
    }
  }

  async getTokenInfo(assetAddress: string): Promise<any | null> {
    try {
      const res = await fetch(`${this.apiBase}/tokens/${assetAddress}`, {
        signal: AbortSignal.timeout(2500),
      });
      if (!res.ok) return null;
      return (await res.json()) as any;
    } catch {
      return null;
    }
  }

  async getTokenHolders(assetAddress: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.apiBase}/tokens/${assetAddress}/holders`, {
        signal: AbortSignal.timeout(2500),
      });
      const json = await res.json() as any;
      return json.items || [];
    } catch {
      return [];
    }
  }

  async getContractCreator(contractAddress: string): Promise<string | null> {
    try {
      const res = await fetch(`${this.apiBase}/addresses/${contractAddress}`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) return null;
      const json = await res.json() as any;
      const c = json.creator_address_hash;
      return typeof c === 'string' ? c : c?.hash ?? null;
    } catch {
      return null;
    }
  }

  async getAddressFirstTx(address: string): Promise<any | null> {
    try {
      const res = await fetch(`${this.apiBase}/addresses/${address}/transactions?filter=to`, {
        signal: AbortSignal.timeout(3000),
      });
      const json = await res.json() as any;
      const items = json.items || [];
      return items.length > 0 ? items[items.length - 1] : null;
    } catch {
      return null;
    }
  }

  async isSourceVerified(address: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.apiBase}/smart-contracts/${address}`, {
        signal: AbortSignal.timeout(2500),
      });
      const json = await res.json() as any;
      return !!json.is_verified;
    } catch {
      return false;
    }
  }
}

