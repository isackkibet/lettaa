# Gamification Engine

The game engine for the Avalanche courier platform hackathon MVP. It owns XP,
levels, missions, achievements, reputation, and reward eligibility. It does
**not** own persistence, wallets, smart contracts, or authentication — those
belong to Backend Developer 2 and the Avalanche integration, backed by the
`letaa_db.sql` Postgres schema (see [Database](#database) below).

The engine is a pure calculator: given a player's current progress and a
delivery event, it returns the new progress. It never reads or writes a
database itself.

## Core Game Loop

Every completed delivery flows through `GameService.processDelivery()`
(`src/services/game.service.ts`) in this order:

```
Delivery
  -> XP Calculation        (XPService)
  -> Mission Progress      (MissionService)
  -> Achievement Check     (AchievementService)
  -> Level Check           (LevelService)
  -> Reputation Update     (ReputationService)
  -> Reward Eligibility    (RewardService)
  -> Feedback Generation   (FeedbackService)
```

Each stage is a separate, independently testable service with a single
responsibility. `GameService` only orchestrates the order and threads data
between them — no game rules live in the orchestrator itself.

## Folder Structure

```
src/
  controllers/    GameController — HTTP request/response only, no game logic
  routes/         Express route wiring
  services/
    xp/           XP calculation and delivery penalties
    missions/     Daily mission progress and completion
    levels/       Level lookup and level-up detection
    achievements/ Achievement unlock conditions
    reputation/   0-100 reputation scoring
    rewards/      Reward eligibility rules
    feedback/     Player-facing message generation
    game.service.ts  Orchestrates the loop above
  models/         Factories for default/derived state (e.g. createDefaultPlayer)
  interfaces/     Player, DeliveryEvent, Mission, Achievement, Reward, PlayerProgress, FeedbackResponse
  constants/      XP values, levels, missions, achievements, reputation weights, feedback templates
  utils/          Small pure helpers (level lookup, clamping, template interpolation)
  types/          Shared type aliases used across services (incl. rider.types.ts, DB enum mirrors)
  tests/          Jest unit tests per service
  app.ts          Express app factory
  server.ts       Entry point
```

## API

### `POST /api/game/delivery`

Request:

```json
{
  "deliveryCompleted": true,
  "onTime": true,
  "rating": 5
}
```

Response:

```json
{
  "xpEarned": 110,
  "totalXp": 110,
  "level": 1,
  "levelTitle": "Rookie Rider",
  "levelUp": false,
  "achievementUnlocked": ["First Delivery"],
  "missionProgress": { "completed": 1, "target": 5 },
  "reputation": 76,
  "rewardEligible": true,
  "feedback": "Achievement unlocked: First Delivery!"
}
```

`missionProgress` reports the single mission most worth surfacing to the
player right now (the incomplete mission closest to completion, or the last
mission if all are done) — the same mission `feedback` nudges the player
about.

The request body also accepts an optional `player` field carrying a full
`Player` snapshot (see `src/interfaces/player.interface.ts`). This is a
testing/demo convenience only — every request without it starts from a fresh
default player, since there is no persistence layer yet. See the TODOs in
`GameController` for where that changes.

## Where Backend Developer 2 Connects Persistence

Search the codebase for `TODO(Backend Developer 2)`. There are three:

1. **`src/controllers/game.controller.ts`** — replace the default player
   fallback with a fetch of the authenticated player's row from Supabase /
   `letaa_core.riders` (joined with `letaa_core.users`).
2. **`src/controllers/game.controller.ts`** — persist the updated player
   state after `GameService.processDelivery()` runs, and trigger Avalanche
   reward issuance when `rewardEligible` is true.
3. **`src/services/achievements/achievement.service.ts`** — once achievements
   are persisted with real timestamps, stop stamping already-earned
   achievements with `now` and pass their stored `earnedAt` through instead.

No other file needs to change to add persistence — `GameService` and every
service beneath it are pure functions of `(player, event) -> result`. See
`MERGE_PLAN.md` for the full phased plan to wire this up against
`letaa_db.sql`.

## Design Notes

- **Player fields are synced to `letaa_core.riders`/`users`**
  (`src/interfaces/player.interface.ts`). Overlapping fields are named to
  match the DB columns (`xp`, `totalDeliveries`, `currentStreak`,
  `longestStreak`, ...); fields the DB tracks but the engine doesn't yet
  derive (coins, gems, tokens, wallet address, rider role, performance
  grade, ranks, blockchain totals, etc.) are present on `Player` with
  DB-matching defaults from `createDefaultPlayer()`, ready for a repository
  layer to populate once persistence is wired up.
- **XP** is a sum of configurable constants (`src/constants/xp.constants.ts`),
  synced against `letaa_gamification.xp_actions` where an equivalent action
  exists (`COMPLETE_DELIVERY`, `FIVE_STAR_RATING`). The remaining DB actions
  (`ACCEPT_DELIVERY`, `EARLY_DELIVERY`, `LEVEL_UP`, etc.) are captured in
  `DB_XP_ACTIONS` for parity but aren't wired into `XPService` yet — they
  need signals (e.g. delivery duration) the current `DeliveryEvent` doesn't
  carry. No magic numbers live in the services.
- **Levels** are the ten fixed thresholds from `letaa_core.levels`
  (`src/constants/levels.constants.ts`), including each level's `rewardTokens`
  and `description`. `LevelService` compares the level before and after
  applying XP to detect a level-up in the same request that caused it.
- **Missions** reset daily; `dailyMissionProgress` on `Player` is assumed to
  already reflect "today" (day-rollover reset is a persistence-layer
  concern). Mission 2 ("100% on-time today") shares Mission 1's 5-delivery
  volume but fails for the day the moment a late delivery occurs. Missions
  are the engine's name for what the DB calls "quests"
  (`letaa_gamification.quests`) — `FIVE_DELIVERIES` is synced to the DB's
  matching "Complete 5 Deliveries" quest; the other two have no same-target
  DB row to sync against yet.
- **Achievements** are derived from cumulative player stats each request;
  already-unlocked achievements are never re-awarded or re-XP'd. Four of the
  five are synced field-for-field (description/target/xp/coin/token reward)
  against their matching `letaa_gamification.achievements` rows; `ELITE_RIDER`
  has no DB counterpart and points at level 7 ("Elite Courier") instead.
- **Reputation** is a weighted blend of punctuality, rating, and completion
  rate (`src/constants/reputation.constants.ts`), clamped to 0-100. This is
  computed fresh each request; syncing it to the persisted
  `riders.reputation_score`/`performance_grade` columns is still open (see
  `MERGE_PLAN.md`).
- **Rewards** are eligibility-only — this engine decides *if* a reward is
  earned, not how it's issued. Turning `rewardEligible` into a real
  `letaa_rewards.rewards`/blockchain transaction is a separate, not-yet-built
  service.
- **Feedback** is generated from a priority list (level-up > achievement >
  mission complete > mission nudge > late-delivery warning > next-level
  progress) so the message is always the most relevant one, never generic
  filler. `FeedbackResponse` (currently unused by `FeedbackService`, which
  returns a plain string) mirrors the full `letaa_gamification.feedback` row
  shape for when persistence is wired up.

## Running

```bash
npm install
npm run dev      # ts-node-dev, path aliases resolved via tsconfig-paths
npm run build    # tsc + tsc-alias (rewrites @/* to relative paths in dist/)
npm start        # node dist/server.js
npm test         # jest
```

## Database

Backend database for the Leta delivery rider platform (`letaa_db.sql`) — see
`MERGE_PLAN.md` for how this schema maps onto the engine above.

### Quick Start (for new devs)

1. Install PostgreSQL:
   ```bash
   sudo apt install postgresql -y
   sudo pg_ctlcluster 18 main start
   ```

2. Clone and run setup:
   ```bash
   git clone https://github.com/IanMugwe/letaa.git
   cd letaa
   ./setup.sh
   ```

3. Create your PostgreSQL role (one-time):
   ```bash
   sudo -u postgres psql -c "CREATE ROLE <your_linux_username> WITH LOGIN SUPERUSER;"
   ```

That's it. Database `leta_db` is ready.

### Schemas & Key Tables

| Schema | Tables | Purpose |
|---|---|---|
| `letaa_core` | `users`, `riders`, `customers`, `levels`, `reputation_tiers` | Identity, wallet, rider progression |
| `letaa_delivery` | `categories`, `orders`, `deliveries` | Delivery lifecycle |
| `letaa_gamification` | `xp_actions`, `xp_history`, `achievements`, `rider_achievements`, `quests`, `rider_quests`, `streaks`, `feedback` | XP, achievements, quests, streaks, per-delivery feedback |
| `letaa_rewards` | `rewards`, `nfts`, `blockchain_transactions`, `wallet_balances` | Reward issuance and on-chain ledger |
| `letaa_analytics` | 10 leaderboard views, `rider_statistics`, `customer_statistics` | Read-only aggregates |

### Connection

```
postgresql://<your_user>@localhost:5432/leta_db
```
