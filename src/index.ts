interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Feodo Tracker MCP — botnet C&C IP blocklist from abuse.ch.
 *
 * Auth: none. JSON feed refreshes ~5 min upstream.
 */


const FEED_URL = 'https://feodotracker.abuse.ch/downloads/ipblocklist.json';
const AGGRESSIVE_URL = 'https://feodotracker.abuse.ch/downloads/ipblocklist_aggressive.json';
const UA = 'pipeworx-mcp-feodotracker/1.0 (+https://pipeworx.io)';

type Entry = {
  ip_address: string;
  port?: number;
  status?: string;
  hostname?: string | null;
  as_number?: number;
  as_name?: string;
  country?: string;
  first_seen?: string;
  last_online?: string;
  malware?: string;
};

let CACHE: { at: number; entries: Entry[] } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000;

const tools: McpToolExport['tools'] = [
  {
    name: 'list',
    description: 'Current C&C blocklist (optional malware-family / status filter).',
    inputSchema: {
      type: 'object',
      properties: {
        family: { type: 'string', description: 'e.g. "Dridex", "Emotet", "Qakbot", "TrickBot"' },
        status: { type: 'string', description: 'e.g. "online", "offline"' },
        limit: { type: 'number', description: '1-5000 (default 500)' },
      },
    },
  },
  {
    name: 'check_ip',
    description: 'Check whether a given IPv4 is on the current blocklist.',
    inputSchema: {
      type: 'object',
      properties: { ip: { type: 'string' } },
      required: ['ip'],
    },
  },
  {
    name: 'recent',
    description: 'Blocklist entries first seen in the last N hours.',
    inputSchema: {
      type: 'object',
      properties: { hours: { type: 'number', description: 'Default 24, max 720 (30 days).' } },
    },
  },
  {
    name: 'aggressive',
    description: 'Full aggressive blocklist (includes older + lower-confidence IPs).',
    inputSchema: { type: 'object', properties: {} },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'list': {
      const entries = await loadFeed();
      const family = (args.family as string | undefined)?.toLowerCase();
      const status = (args.status as string | undefined)?.toLowerCase();
      const limit = Math.min(5000, Math.max(1, (args.limit as number) ?? 500));
      const filtered = entries.filter((e) => {
        if (family && (e.malware ?? '').toLowerCase() !== family) return false;
        if (status && (e.status ?? '').toLowerCase() !== status) return false;
        return true;
      });
      return { total: entries.length, matches: filtered.length, results: filtered.slice(0, limit) };
    }
    case 'check_ip': {
      const ip = reqStr(args, 'ip', '"1.2.3.4"');
      if (!/^[0-9.]+$/.test(ip)) throw new Error('check_ip: IPv4 dotted-quad only.');
      const entries = await loadFeed();
      const hit = entries.filter((e) => e.ip_address === ip);
      return { ip, listed: hit.length > 0, entries: hit };
    }
    case 'recent': {
      const hours = Math.min(720, Math.max(1, (args.hours as number) ?? 24));
      const cutoff = Date.now() - hours * 3600 * 1000;
      const entries = await loadFeed();
      const filtered = entries.filter((e) => {
        if (!e.first_seen) return false;
        const t = Date.parse(e.first_seen);
        return Number.isFinite(t) && t >= cutoff;
      });
      return { hours, count: filtered.length, results: filtered };
    }
    case 'aggressive': {
      const res = await fetch(AGGRESSIVE_URL, { headers: { Accept: 'application/json', 'User-Agent': UA } });
      if (!res.ok) throw new Error(`Feodo aggressive feed: ${res.status}`);
      return res.json();
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function loadFeed(): Promise<Entry[]> {
  const now = Date.now();
  if (CACHE && now - CACHE.at < CACHE_TTL_MS) return CACHE.entries;
  const res = await fetch(FEED_URL, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Feodo feed: ${res.status}`);
  const json = (await res.json()) as Entry[];
  CACHE = { at: now, entries: Array.isArray(json) ? json : [] };
  return CACHE.entries;
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) {
    throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  }
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
