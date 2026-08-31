import type { WinLossRecord, TableSummary, SecurityAlert, AnalyticsSummary, GameType } from './types';
import { subHours, subDays, format } from 'date-fns';

const GAME_TYPES: GameType[] = ['slots', 'blackjack', 'roulette', 'poker', 'craps', 'baccarat'];
const PIT_AREAS = ['Main Floor', 'High Limit', 'VIP', 'Smoking'];

function randomInRange(min: number, max: number) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function generateWinLossRecords(count: number): WinLossRecord[] {
  const records: WinLossRecord[] = [];
  const now = new Date();
  for (let i = 0; i < count; i++) {
    const gameType = GAME_TYPES[Math.floor(Math.random() * GAME_TYPES.length)];
    const amount = randomInRange(-5000, 8000);
    const hoursAgo = Math.floor(Math.random() * 72);
    records.push({
      id: `rec-${i}-${Date.now()}`,
      gameType,
      tableOrMachineId: gameType === 'slots' ? `SLOT-${1000 + Math.floor(Math.random() * 200)}` : `T-${10 + Math.floor(Math.random() * 40)}`,
      timestamp: subHours(now, hoursAgo).toISOString(),
      amount,
      pitArea: PIT_AREAS[Math.floor(Math.random() * PIT_AREAS.length)],
    });
  }
  return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateTableSummaries(): TableSummary[] {
  const tables: TableSummary[] = [];
  let id = 1;
  for (const game of GAME_TYPES) {
    for (let t = 0; t < 4; t++) {
      const hourlyWin = randomInRange(-2000, 5000);
      const dailyWin = hourlyWin * randomInRange(6, 18);
      tables.push({
        id: `table-${id}`,
        gameType: game,
        name: game === 'slots' ? `SLOT-${1000 + id}` : `${game.toUpperCase()} ${10 + t}`,
        pitArea: PIT_AREAS[t % PIT_AREAS.length],
        hourlyWin,
        dailyWin,
        dropCount: Math.floor(randomInRange(20, 200)),
        lastActivity: subHours(new Date(), Math.floor(Math.random() * 2)).toISOString(),
      });
      id++;
    }
  }
  return tables;
}

function generateAlerts(): SecurityAlert[] {
  const now = new Date();
  return [
    {
      id: 'alt-1',
      type: 'anomaly',
      severity: 'high',
      title: 'Unusual win streak at Blackjack T-12',
      description: 'Table T-12 reported 8 consecutive player wins in last 15 minutes. Variance exceeds 2.5σ.',
      timestamp: subHours(now, 0.5).toISOString(),
      location: 'Main Floor',
      tableOrMachineId: 'T-12',
      suggestedAction: 'Review surveillance footage; consider floor check.',
      acknowledged: false,
    },
    {
      id: 'alt-2',
      type: 'variance',
      severity: 'medium',
      title: 'Slot bank SLOT-1044 above expected hold',
      description: 'Hold % for SLOT-1044 is 18% vs floor average 8%. May indicate malfunction or tampering.',
      timestamp: subHours(now, 1).toISOString(),
      tableOrMachineId: 'SLOT-1044',
      suggestedAction: 'Verify meter readings; schedule technical review.',
      acknowledged: false,
    },
    {
      id: 'alt-3',
      type: 'behavior',
      severity: 'low',
      title: 'Large buy-in at Roulette T-22',
      description: 'Single buy-in $25,000 at T-22. Within policy but flag for compliance.',
      timestamp: subHours(now, 2).toISOString(),
      location: 'High Limit',
      tableOrMachineId: 'T-22',
      suggestedAction: 'Ensure CTR documentation if cash.',
      acknowledged: true,
    },
    {
      id: 'alt-4',
      type: 'collusion_risk',
      severity: 'critical',
      title: 'Possible signaling between two players at Poker T-18',
      description: 'Two players at same table showing correlated bet timing patterns over 45 min.',
      timestamp: subHours(now, 0.25).toISOString(),
      location: 'VIP',
      tableOrMachineId: 'T-18',
      suggestedAction: 'Immediate surveillance review; consider floor supervisor observation.',
      acknowledged: false,
    },
  ];
}

export function getMockWinLoss(limit = 200): WinLossRecord[] {
  return generateWinLossRecords(limit);
}

export function getMockTableSummaries(): TableSummary[] {
  return generateTableSummaries();
}

export function getMockAlerts(): SecurityAlert[] {
  return generateAlerts();
}

export function getMockAnalyticsSummary(): AnalyticsSummary {
  const tables = generateTableSummaries();
  const byGameType = GAME_TYPES.reduce((acc, g) => {
    const gameTables = tables.filter((t) => t.gameType === g);
    acc[g] = {
      win: gameTables.reduce((s, t) => s + t.dailyWin, 0),
      drop: gameTables.reduce((s, t) => s + t.dropCount * 100, 0),
      sessions: gameTables.length * 3,
    };
    return acc;
  }, {} as Record<GameType, { win: number; drop: number; sessions: number }>);

  const totalHouseWin = Object.values(byGameType).reduce((s, x) => s + x.win, 0);
  const totalDrop = Object.values(byGameType).reduce((s, x) => s + x.drop, 0);

  const hourlyBreakdown = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    win: totalHouseWin * (0.02 + Math.random() * 0.04),
  }));

  const sorted = [...tables].sort((a, b) => b.dailyWin - a.dailyWin);
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
