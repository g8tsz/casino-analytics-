-- Casino Analytics & Surveillance – PostgreSQL schema
-- Run this against your database, then ETL from your CMS/slot/table system into these tables.

CREATE TABLE IF NOT EXISTS win_loss_records (
  id            TEXT PRIMARY KEY,
  game_type     TEXT NOT NULL CHECK (game_type IN ('slots','blackjack','roulette','poker','craps','baccarat')),
  table_or_machine_id TEXT NOT NULL,
  timestamp     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount        NUMERIC(14,2) NOT NULL,
  session_id    TEXT,
  pit_area      TEXT
);

CREATE INDEX IF NOT EXISTS idx_win_loss_timestamp ON win_loss_records(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_win_loss_game ON win_loss_records(game_type);
CREATE INDEX IF NOT EXISTS idx_win_loss_table ON win_loss_records(table_or_machine_id);

CREATE TABLE IF NOT EXISTS table_summaries (
  id            TEXT PRIMARY KEY,
  game_type     TEXT NOT NULL CHECK (game_type IN ('slots','blackjack','roulette','poker','craps','baccarat')),
  name          TEXT NOT NULL,
  pit_area      TEXT NOT NULL,
  hourly_win     NUMERIC(14,2) NOT NULL DEFAULT 0,
  daily_win      NUMERIC(14,2) NOT NULL DEFAULT 0,
  drop_count     INT NOT NULL DEFAULT 0,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS security_alerts (
  id                   TEXT PRIMARY KEY,
  type                 TEXT NOT NULL CHECK (type IN ('anomaly','variance','collusion_risk','count_suspicious','behavior')),
  severity             TEXT NOT NULL CHECK (severity IN ('low','medium','high','critical')),
  title                TEXT NOT NULL,
  description          TEXT NOT NULL,
  timestamp            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  location             TEXT,
  table_or_machine_id   TEXT,
  suggested_action     TEXT,
  acknowledged         BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON security_alerts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_ack ON security_alerts(acknowledged);

-- Example: refresh table_summaries from win_loss_records (run on schedule or trigger)
-- INSERT INTO table_summaries (id, game_type, name, pit_area, hourly_win, daily_win, drop_count, last_activity)
-- SELECT ...
