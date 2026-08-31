export type GameType = 'slots' | 'blackjack' | 'roulette' | 'poker' | 'craps' | 'baccarat';

export interface WinLossRecord {
  id: string;
  gameType: GameType;
  tableOrMachineId: string;
  timestamp: string;
  amount: number; // positive = house win, negative = player win
  sessionId?: string;
  pitArea?: string;
}

export interface TableSummary {
  id: string;
  gameType: GameType;
  name: string;
  pitArea: string;
  hourlyWin: number;
  dailyWin: number;
  dropCount: number;
  lastActivity: string;
}

export interface SecurityAlert {
  id: string;
  type: 'anomaly' | 'variance' | 'collusion_risk' | 'count_suspicious' | 'behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  tableOrMachineId?: string;
  suggestedAction?: string;
  acknowledged: boolean;
}

export interface AnalyticsSummary {
  totalHouseWin: number;
  totalDrop: number;
  winRate: number;
  byGameType: Record<GameType, { win: number; drop: number; sessions: number }>;
  hourlyBreakdown: { hour: number; win: number }[];
  topPerformers: TableSummary[];
  bottomPerformers: TableSummary[];
}
