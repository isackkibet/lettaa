# Gamification Engine

The game engine for the Avalanche courier platform hackathon MVP. It owns XP,
levels, missions, achievements, reputation, and reward eligibility. It does
**not** own persistence, wallets, smart contracts, or authentication — those
belong to Backend Developer 2 and the Avalanche integration.

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
  types/          Shared type aliases used across services
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
  "xpEarned": 100,
  "totalXp": 100,
  "level": 1,
  "levelTitle": "Rookie",
  "levelUp": false,
  "achievementUnlocked": ["First Delivery"],
  "missionProgress": { "completed": 1, "target": 2 },
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
   fallback with a fetch of the authenticated player's row from Supabase.
2. **`src/controllers/game.controller.ts`** — persist the updated player
   state after `GameService.processDelivery()` runs, and trigger Avalanche
   reward issuance when `rewardEligible` is true.
3. **`src/services/achievements/achievement.service.ts`** — once achievements
   are persisted with real timestamps, stop stamping already-earned
   achievements with `now` and pass their stored `earnedAt` through instead.

No other file needs to change to add persistence — `GameService` and every
service beneath it are pure functions of `(player, event) -> result`.

## Design Notes

- **XP** is a sum of configurable constants (`src/constants/xp.constants.ts`).
  No magic numbers live in the services.
- **Levels** are five fixed thresholds (`src/constants/levels.constants.ts`).
  `LevelService` compares the level before and after applying XP to detect
  a level-up in the same request that caused it.
- **Missions** reset daily; `dailyMissionProgress` on `Player` is assumed to
  already reflect "today" (day-rollover reset is a persistence-layer
  concern). Mission 2 ("100% on-time today") shares Mission 1's 5-delivery
  volume but fails for the day the moment a late delivery occurs.
- **Achievements** are derived from cumulative player stats each request;
  already-unlocked achievements are never re-awarded or re-XP'd.
- **Reputation** is a weighted blend of punctuality, rating, and completion
  rate (`src/constants/reputation.constants.ts`), clamped to 0-100.
- **Rewards** are eligibility-only — this engine decides *if* a reward is
  earned, not how it's issued.
- **Feedback** is generated from a priority list (level-up > achievement >
  mission complete > mission nudge > late-delivery warning > next-level
  progress) so the message is always the most relevant one, never generic
  filler.

## Running

```bash
npm install
npm run dev      # ts-node-dev, path aliases resolved via tsconfig-paths
npm run build    # tsc + tsc-alias (rewrites @/* to relative paths in dist/)
npm start        # node dist/server.js
npm test         # jest
```
