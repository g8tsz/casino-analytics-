-- Example seed data for testing live database mode.
-- Replace with real ETL from your casino management system.

INSERT INTO win_loss_records (id, game_type, table_or_machine_id, timestamp, amount, pit_area)
VALUES
  ('rec-1', 'blackjack', 'T-12', NOW() - INTERVAL '1 hour', 1250.00, 'Main Floor'),
  ('rec-2', 'slots', 'SLOT-1044', NOW() - INTERVAL '2 hours', -500.00, 'Main Floor'),
  ('rec-3', 'roulette', 'T-22', NOW() - INTERVAL '30 minutes', 3200.00, 'High Limit')
ON CONFLICT (id) DO NOTHING;

INSERT INTO table_summaries (id, game_type, name, pit_area, hourly_win, daily_win, drop_count, last_activity)
VALUES
  ('table-1', 'blackjack', 'BLACKJACK 10', 'Main Floor', 1200, 18000, 45, NOW()),
  ('table-2', 'slots', 'SLOT-1001', 'Main Floor', -200, -1200, 120, NOW() - INTERVAL '10 minutes')
ON CONFLICT (id) DO UPDATE SET hourly_win = EXCLUDED.hourly_win, daily_win = EXCLUDED.daily_win, last_activity = EXCLUDED.last_activity;

INSERT INTO security_alerts (id, type, severity, title, description, timestamp, location, table_or_machine_id, suggested_action, acknowledged)
VALUES
  ('alt-1', 'anomaly', 'high', 'Unusual win streak at Blackjack T-12', 'Table T-12 reported 8 consecutive player wins in last 15 minutes.', NOW() - INTERVAL '30 minutes', 'Main Floor', 'T-12', 'Review surveillance footage.', FALSE)
ON CONFLICT (id) DO NOTHING;
