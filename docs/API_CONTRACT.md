# Live API contract

When using **DATA_SOURCE=api**, your backend must expose these endpoints. Response shapes must match below (camelCase in JSON).

## GET /api/analytics

Returns aggregate analytics for the dashboard.

```json
{
  "totalHouseWin": 125000.50,
  "totalDrop": 980000.00,
  "winRate": 12.76,
  "byGameType": {
    "slots": { "win": 45000, "drop": 400000, "sessions": 120 },
    "blackjack": { "win": 35000, "drop": 200000, "sessions": 80 },
    "roulette": { "win": 20000, "drop": 150000, "sessions": 60 },
    "poker": { "win": 15000, "drop": 120000, "sessions": 40 },
    "craps": { "win": 6000, "drop": 60000, "sessions": 25 },
    "baccarat": { "win": 4400.50, "drop": 50000, "sessions": 20 }
  },
  "hourlyBreakdown": [
    { "hour": 0, "win": 5200 },
    { "hour": 1, "win": 4800 }
  ],
  "topPerformers": [ { "id": "...", "gameType": "slots", "name": "SLOT-1001", "pitArea": "Main Floor", "hourlyWin": 1200, "dailyWin": 18000, "dropCount": 90, "lastActivity": "2025-03-02T14:00:00.000Z" } ],
  "bottomPerformers": [ { "id": "...", "gameType": "blackjack", "name": "BLACKJACK 12", "pitArea": "Main Floor", "hourlyWin": -500, "dailyWin": -3000, "dropCount": 30, "lastActivity": "2025-03-02T13:55:00.000Z" } ]
}
```

## GET /api/alerts

Returns security/surveillance alerts.

```json
[
  {
    "id": "alt-1",
    "type": "anomaly",
    "severity": "high",
    "title": "Unusual win streak at Blackjack T-12",
    "description": "Table T-12 reported 8 consecutive player wins in last 15 minutes.",
    "timestamp": "2025-03-02T14:30:00.000Z",
    "location": "Main Floor",
    "tableOrMachineId": "T-12",
    "suggestedAction": "Review surveillance footage.",
    "acknowledged": false
  }
]
```

**type:** `anomaly` | `variance` | `collusion_risk` | `count_suspicious` | `behavior`  
**severity:** `low` | `medium` | `high` | `critical`

## GET /api/winloss?limit=100

Returns recent win/loss records (positive = house win, negative = player win).

```json
[
  {
    "id": "rec-1",
    "gameType": "blackjack",
    "tableOrMachineId": "T-12",
    "timestamp": "2025-03-02T14:00:00.000Z",
    "amount": 1250.00,
    "sessionId": "optional",
    "pitArea": "Main Floor"
  }
]
```

## GET /api/tables

Returns table/machine summaries.

```json
[
  {
    "id": "table-1",
    "gameType": "blackjack",
    "name": "BLACKJACK 10",
    "pitArea": "Main Floor",
    "hourlyWin": 1200,
    "dailyWin": 18000,
    "dropCount": 45,
    "lastActivity": "2025-03-02T14:00:00.000Z"
  }
]
```

**gameType:** `slots` | `blackjack` | `roulette` | `poker` | `craps` | `baccarat`
