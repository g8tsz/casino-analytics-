# Casino Analytics & Surveillance

**Repository:** [github.com/g8tsz/casino-analytics-](https://github.com/g8tsz/casino-analytics-)

Full software for casinos to track **wins and losses** and support **security surveillance** over **live data**. Run with demo data, connect to your own API, or use a PostgreSQL database.

---

## Features

- **Win/loss analytics** — House win, drop, win rate, breakdown by game type (slots, blackjack, roulette, poker, craps, baccarat)
- **Security alerts** — Anomaly, variance, collusion risk, and behavior flags with suggested actions and location/table IDs for surveillance
- **Table & machine performance** — Top and bottom performers
- **Hourly trends** — 24-hour win view
- **Live data** — Use mock data, your existing API, or PostgreSQL

---

## Quick start (demo)

```bash
git clone https://github.com/g8tsz/casino-analytics-.git
cd casino-analytics-
npm install
npm run dev
```

Open **http://localhost:3000**. Uses built-in mock data by default.

---

## Running on live data

Set **DATA_SOURCE** in `.env` (copy from `.env.example`).

### Option 1: Your own API (recommended if you have a CMS)

Point the app at an API that returns the same JSON shapes as this app’s `/api/*` routes.

```env
DATA_SOURCE=api
LIVE_API_BASE_URL=https://your-casino-cms.example.com
# LIVE_API_KEY=optional-bearer-token
```

Your API should expose:

| Endpoint        | Method | Returns |
|----------------|--------|--------|
| `/api/analytics` | GET   | `AnalyticsSummary` (totalHouseWin, byGameType, hourlyBreakdown, topPerformers, bottomPerformers, etc.) |
| `/api/alerts`    | GET   | `SecurityAlert[]` |
| `/api/winloss?limit=N` | GET | `WinLossRecord[]` |
| `/api/tables`    | GET   | `TableSummary[]` |

Types are in `lib/types.ts`; you can match them from your CMS or data warehouse.

### Option 2: PostgreSQL database

1. Create a database and run the schema:

```bash
psql $DATABASE_URL -f database/schema.sql
```

2. ETL data from your slot/table system into `win_loss_records`, `table_summaries`, and `security_alerts`. See `database/seed-example.sql` for column shapes.

3. Configure the app:

```env
DATA_SOURCE=database
DATABASE_URL=postgresql://user:password@host:5432/casino_analytics
```

For serverless (e.g. Vercel), use a connection pooler (Supabase, Neon, PgBouncer) and set `DATABASE_URL` to the pooler URL.

---

## API (this app)

When running this app, it exposes:

| Endpoint | Description |
|----------|-------------|
| `GET /api/analytics` | Summary, by game type, hourly, top/bottom tables |
| `GET /api/alerts` | Security/surveillance alerts |
| `GET /api/winloss?limit=100` | Recent win/loss records |
| `GET /api/tables` | Table/machine summaries |

Data comes from mock, your API, or PostgreSQL depending on `DATA_SOURCE`.

---

## Pushing to the repo

From your machine (first time):

```bash
cd casino-analytics-
git init
git remote add origin https://github.com/g8tsz/casino-analytics-.git
git add .
git commit -m "Initial commit: casino analytics and surveillance with live data support"
git branch -M main
git push -u origin main
```

If the repo already has content (e.g. a README), pull first:

```bash
git pull origin main --rebase
git push -u origin main
```

---

## Tech stack

- **Next.js 14** (App Router), **TypeScript**, **Tailwind CSS**
- **Recharts** for charts, **date-fns** for dates
- **pg** for optional PostgreSQL

---

## License

Use and modify as needed for your organization.
