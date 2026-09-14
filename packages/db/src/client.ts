import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';
import dotenv from 'dotenv';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

import path from 'path';
import fs from 'fs';

if (!process.env.DATABASE_URL) {
  dotenv.config();
  const candidates = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'apps/web/.env.local'),
    path.resolve(process.cwd(), '../../apps/web/.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../../.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      if (process.env.DATABASE_URL) break;
    }
  }
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  lookup: (hostname: string, options: any, callback: any) => {
    dns.lookup(hostname, { ...options, family: 4 }, callback);
  },
} as any);

export const db = drizzle(pool, { schema });
export * from './schema.js';
export { pool };
