/**
 * Data source layer: mock | api | database
 * Set DATA_SOURCE in .env. For live data use api (LIVE_API_BASE_URL) or database (DATABASE_URL).
 */
import {
  getMockAnalyticsSummary,
  getMockAlerts,
  getMockWinLoss,
  getMockTableSummaries,
} from './mockData';
import type {
  AnalyticsSummary,
  SecurityAlert,
  WinLossRecord,
  TableSummary,
} from './types';

const DATA_SOURCE = process.env.DATA_SOURCE || 'mock';
const LIVE_API_BASE = (process.env.LIVE_API_BASE_URL || '').replace(/\/$/, '');

async function fetchLive<T>(path: string): Promise<T> {
  const res = await fetch(`${LIVE_API_BASE}${path}`, {
    headers: process.env.LIVE_API_KEY
      ? { Authorization: `Bearer ${process.env.LIVE_API_KEY}` }
      : undefined,
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`Live API error: ${res.status} ${path}`);
  return res.json();
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  if (DATA_SOURCE === 'api' && LIVE_API_BASE) {
    return fetchLive<AnalyticsSummary>('/api/analytics');
  }
  if (DATA_SOURCE === 'database') {
    return getDbAnalyticsSummary();
  }
  return getMockAnalyticsSummary();
}

export async function getAlerts(): Promise<SecurityAlert[]> {
  if (DATA_SOURCE === 'api' && LIVE_API_BASE) {
    return fetchLive<SecurityAlert[]>('/api/alerts');
  }
  if (DATA_SOURCE === 'database') {
    return getDbAlerts();
  }
  return getMockAlerts();
}

export async function getWinLoss(limit: number): Promise<WinLossRecord[]> {
  if (DATA_SOURCE === 'api' && LIVE_API_BASE) {
    return fetchLive<WinLossRecord[]>(`/api/winloss?limit=${limit}`);
  }
  if (DATA_SOURCE === 'database') {
    return getDbWinLoss(limit);
  }
  return getMockWinLoss(limit);
}

export async function getTableSummaries(): Promise<TableSummary[]> {
  if (DATA_SOURCE === 'api' && LIVE_API_BASE) {
    return fetchLive<TableSummary[]>('/api/tables');
  }
  if (DATA_SOURCE === 'database') {
    return getDbTableSummaries();
  }
  return getMockTableSummaries();
}

// --- Database adapter (PostgreSQL) ---
async function getDb(): Promise<import('pg').Client> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is required for database mode');
  const { Client } = await import('pg');
  const client = new Client({ connectionString: url });
  await client.connect();
  return client;
}

async function getDbAnalyticsSummary(): Promise<AnalyticsSummary> {
  const tables = await getDbTableSummaries();
  const gameTypes = ['slots', 'blackjack', 'roulette', 'poker', 'craps', 'baccarat'] as const;
  const byGameType = gameTypes.reduce((acc, g) => {
    const gameTables = tables.filter((t) => t.gameType === g);
    acc[g] = {
      win: gameTables.reduce((s, t) => s + t.dailyWin, 0),
      drop: gameTables.reduce((s, t) => s + t.dropCount * 100, 0),
      sessions: gameTables.length * 3,
    };
    return acc;
  }, {} as Record<typeof gameTypes[number], { win: number; drop: number; sessions: number }>);
  const totalHouseWin = Object.values(byGameType).reduce((s, x) => s + x.win, 0);
  const totalDrop = Object.values(byGameType).reduce((s, x) => s + x.drop, 0);
  const sorted = [...tables].sort((a, b) => b.dailyWin - a.dailyWin);
  const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    win: totalHouseWin * 0.03,
  }));
  return {
    totalHouseWin,
    totalDrop,
    winRate: totalDrop > 0 ? (totalHouseWin / totalDrop) * 100 : 0,
    byGameType,
    hourlyBreakdown,
    topPerformers: sorted.slice(0, 5),
    bottomPerformers: sorted.slice(-5).reverse(),
  };
}

async function getDbAlerts(): Promise<SecurityAlert[]> {
  const client = await getDb();
  try {
  const r = await client.query(
    `SELECT id, type, severity, title, description, timestamp, location, table_or_machine_id, suggested_action, acknowledged
     FROM security_alerts ORDER BY timestamp DESC LIMIT 100`
  );
  return r.rows.map((row: Record<string, unknown>) => ({
    id: row.id,
    type: row.type,
    severity: row.severity,
    title: row.title,
    description: row.description,
    timestamp: (row.timestamp as Date)?.toISOString?.() || String(row.timestamp),
    location: row.location ?? undefined,
    tableOrMachineId: row.table_or_machine_id ?? undefined,
    suggestedAction: row.suggested_action ?? undefined,
    acknowledged: Boolean(row.acknowledged),
  })) as SecurityAlert[];
  } finally {
    await client.end();
  }
}

async function getDbWinLoss(limit: number): Promise<WinLossRecord[]> {
  const client = await getDb();
  try {
  const r = await client.query(
    `SELECT id, game_type as "gameType", table_or_machine_id as "tableOrMachineId", timestamp, amount, session_id as "sessionId", pit_area as "pitArea"
     FROM win_loss_records ORDER BY timestamp DESC LIMIT $1`,
    [limit]
  );
  return r.rows.map((row: Record<string, unknown>) => ({
    ...row,
    timestamp: (row.timestamp as Date)?.toISOString?.() || String(row.timestamp),
  })) as WinLossRecord[];
  } finally {
    await client.end();
  }
}

async function getDbTableSummaries(): Promise<TableSummary[]> {
  const client = await getDb();
  try {
  const r = await client.query(
    `SELECT id, game_type as "gameType", name, pit_area as "pitArea", hourly_win as "hourlyWin", daily_win as "dailyWin", drop_count as "dropCount", last_activity as "lastActivity"
     FROM table_summaries ORDER BY daily_win DESC`
  );
  return r.rows.map((row: Record<string, unknown>) => ({
    ...row,
    lastActivity: (row.lastActivity as Date)?.toISOString?.() || String(row.lastActivity),
  })) as TableSummary[];
  } finally {
    await client.end();
  }
}
