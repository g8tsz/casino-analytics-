'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { format } from 'date-fns';
import type { AnalyticsSummary, SecurityAlert, TableSummary } from '@/lib/types';

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f59e0b',
  medium: '#eab308',
  low: '#6b7280',
};

const GAME_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#f97316', '#14b8a6'];

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(n);
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/analytics').then((r) => r.json()),
      fetch('/api/alerts').then((r) => r.json()),
    ])
      .then(([analyticsData, alertsData]) => {
        setAnalytics(analyticsData);
        setAlerts(alertsData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-400">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) return null;

  const pieData = Object.entries(analytics.byGameType).map(([name, data], i) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: Math.max(0, data.win),
    color: GAME_COLORS[i % GAME_COLORS.length],
  }));

  const hourlyData = analytics.hourlyBreakdown.map(({ hour, win }) => ({
    hour: `${hour}:00`,
    win: Math.round(win),
  }));

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Casino Analytics & Surveillance
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Win/loss tracking and security monitoring • Last updated {format(new Date(), 'PPp')}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm text-zinc-300">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          Live
        </div>
      </header>

      {/* Summary stats */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card">
          <p className="text-sm font-medium text-zinc-400">Total House Win (24h)</p>
          <p className="mt-1 text-2xl font-semibold text-green-400">
            {formatCurrency(analytics.totalHouseWin)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-zinc-400">Total Drop</p>
          <p className="mt-1 text-2xl font-semibold text-white">
            {formatCurrency(analytics.totalDrop)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-zinc-400">Win Rate %</p>
          <p className="mt-1 text-2xl font-semibold text-emerald-400">
            {analytics.winRate.toFixed(1)}%
          </p>
        </div>
        <div className="stat-card">
          <p className="text-sm font-medium text-zinc-400">Active Alerts</p>
          <p className="mt-1 text-2xl font-semibold text-amber-400">
            {alerts.filter((a) => !a.acknowledged).length}
          </p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Win by game type */}
        <div className="stat-card lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold text-white">House Win by Game Type</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={Object.entries(analytics.byGameType).map(([name, d]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), win: d.win }))}>
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => [formatCurrency(v), 'House Win']} contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }} />
                <Bar dataKey="win" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="stat-card">
          <h2 className="mb-4 text-lg font-semibold text-white">Win Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieData[i].color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Hourly trend */}
      <div className="mt-6 stat-card">
        <h2 className="mb-4 text-lg font-semibold text-white">Hourly Win Trend (24h)</h2>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData}>
              <XAxis dataKey="hour" stroke="#71717a" fontSize={10} />
              <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: number) => [formatCurrency(v), 'Win']} contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }} />
              <Bar dataKey="win" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Security alerts */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Security & Surveillance Alerts</h2>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-4 ${
                alert.severity === 'critical'
                  ? 'alert-critical'
                  : alert.severity === 'high'
                  ? 'alert-high'
                  : alert.severity === 'medium'
                  ? 'alert-medium'
                  : 'alert-low'
              } ${alert.acknowledged ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: SEVERITY_COLORS[alert.severity] + '30', color: SEVERITY_COLORS[alert.severity] }}
                    >
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-500">{alert.type.replace('_', ' ')}</span>
                    {alert.acknowledged && (
                      <span className="text-xs text-zinc-500">Acknowledged</span>
                    )}
                  </div>
                  <h3 className="mt-2 font-medium text-white">{alert.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{alert.description}</p>
                  {alert.suggestedAction && (
                    <p className="mt-2 text-sm text-amber-200/90">
                      → {alert.suggestedAction}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-zinc-500">
                    {alert.location && `${alert.location} • `}
                    {alert.tableOrMachineId && `${alert.tableOrMachineId} • `}
                    {format(new Date(alert.timestamp), 'PPp')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Table performance */}
      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="stat-card">
          <h2 className="mb-4 text-lg font-semibold text-white">Top Performing Tables / Machines</h2>
          <TableList tables={analytics.topPerformers} />
        </div>
        <div className="stat-card">
          <h2 className="mb-4 text-lg font-semibold text-white">Underperforming (Review)</h2>
          <TableList tables={analytics.bottomPerformers} />
        </div>
      </section>
    </div>
  );
}

function TableList({ tables }: { tables: TableSummary[] }) {
  return (
    <ul className="space-y-2">
      {tables.map((t) => (
        <li
          key={t.id}
          className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2 text-sm"
        >
          <span className="font-medium text-white">{t.name}</span>
          <span className={t.dailyWin >= 0 ? 'text-green-400' : 'text-red-400'}>
            {formatCurrency(t.dailyWin)}
          </span>
        </li>
      ))}
    </ul>
  );
}
