# Merge Plan: `letadbinitial` (Leta DB schema) → `main` (Gamification Engine)

## 1. What's actually being merged

This repo currently holds **two unrelated git histories** (both are root commits —
`git merge-base --is-ancestor` confirms neither is an ancestor of the other):

| Branch | Root commit | Author | Contents |
|---|---|---|---|
| `letadbinitial` (checked out now) | `1223d3c` | Letha Developer `<dev@letha.app>` | `letaa_db.sql` — a 5-schema Postgres DB (`letaa_core`, `letaa_delivery`, `letaa_gamification`, `letaa_rewards`, `letaa_analytics`) for a blockchain-integrated delivery-rider platform. 20 tables, 12 leaderboard/stat views, full seed data. |
| `main` | `9a40df6` | ian_mugwe | The actual "gamification-engine" TS service — a **stateless** Express API (`POST /api/game/delivery`) that computes XP/levels/missions/achievements/reputation/reward-eligibility/feedback from an in-memory `Player` + `DeliveryEvent`. |
| `feat/backend` | `902bd47` | ian_mugwe | One-line fix on top of `main` (`feedback-response.interface.ts`). |

The TS engine's own README and code are explicit that persistence is deliberately
unbuilt and waiting on someone else:

> "It does **not** own persistence, wallets, smart contracts, or authentication —
> those belong to Backend Developer 2 and the Avalanche integration."

There are three `TODO(Backend Developer 2)` markers in the code
(`game.controller.ts` ×2, `achievement.service.ts` ×1) pointing at exactly the
gap `letaa_db.sql` fills. So this isn't a conflict to resolve — it's the missing
half of the system arriving. The work is bridging two independently-designed
domain models, not resolving competing implementations.

## 2. Git-level merge (mechanical — do this first, it's cheap)

Because the histories are unrelated, a normal merge won't work; it needs
`--allow-unrelated-histories`. File-level overlap is minimal:

- **Conflicts**: `README.md` only (both branches have one, describing different
  halves of the system).
- **No conflict, just additions**: `.gitignore` (only `letadbinitial` has one —
  main currently has *no* `.gitignore` at all, which is worth fixing regardless),
  `setup.sh`, `letaa_db.sql` (unique to `letadbinitial`) alongside `src/`,
  `package.json`, `tsconfig.json`, etc. (unique to `main`).

Recommended sequence:
```bash
git checkout main
git merge --allow-unrelated-histories letadbinitial
# resolve README.md — combine both, or keep the engine's README and add
# a "Database" section pointing at letaa_db.sql / setup.sh
git merge feat/backend   # normal fast-forward-able merge on top
```

## 3. Domain-model reconciliation (the actual work)

This is the part git can't do for you. Engine construct ↔ DB equivalent, with
the concrete mismatch in each:

- **`Player` ↔ `letaa_core.riders` + `users`** — engine's `Player` is a flat,
  minimal shape (`totalXp`, `level`, `deliveriesCompleted`, `onTimeDeliveries`,
  `lateDeliveries`, `fiveStarRatings`, `totalRatedDeliveries`,
  `currentOnTimeStreak`, `dailyMissionProgress`, `unlockedAchievementIds`).
  `riders` has ~30 columns including wallet/coins/gems/tokens/ranks that the
  engine has no concept of. **Needs a repository/adapter layer** that maps
  `riders`+`users` rows → `Player` on read, and the delta from
  `applyDeliveryToPlayer` → an `UPDATE` (+ an `xp_history` insert) on write.

- **`DeliveryEvent` ↔ `letaa_delivery.deliveries`/`orders`** — engine's event is
  `{deliveryCompleted, onTime, rating}`. The DB row carries category, distance,
  duration, locations, payment/tx fields. The controller needs to *derive* the
  engine's minimal event from a full delivery row (e.g. `onTime` from
  `actual_duration <= expected_duration`).

- **`Mission` ↔ `letaa_gamification.quests`** — naming mismatch throughout
  (engine says "mission" everywhere; DB says "quest" everywhere). The deeper
  issue: the engine ships **3 hardcoded daily missions** via a `MissionId` enum
  and a switch statement in `MissionService.getProgressCount`. The DB seeds
  **25 quests** across `DAILY`/`WEEKLY`/`MONTHLY`/`SEASONAL`/`HOLIDAY_EVENT`/
  `REFERRAL`/`COMMUNITY_CHALLENGE`/`EMERGENCY`. `MissionService`'s hardcoded
  logic doesn't generalize to arbitrary DB-defined quests — this is the
  largest redesign in the plan: mission/quest evaluation has to become
  data-driven against `quests` rows instead of a fixed enum + switch.

- **`Achievement` ↔ `letaa_gamification.achievements`** — same shape of
  problem: engine hardcodes **5** achievements with hand-written unlock
  conditions (`AchievementService.evaluate`); DB seeds **27** across 5
  categories with coin/token/NFT rewards attached. Unlock conditions need to
  become data-driven (compare player stats against each row's `target_value`)
  rather than a fixed `Record<AchievementId, boolean>`.

- **Levels** — engine has **5** fixed levels (Rookie → Avalanche Legend,
  thresholds 0–2000, `levels.constants.ts`). DB seeds **10** levels (same
  start/end titles, thresholds 0–20000) with `reward_tokens` per level attached.
  Titles overlap but thresholds and count don't — decide whether DB is the
  source of truth (recommended, then regenerate `levels.constants.ts` from it)
  or the engine's simplified ladder stays for the MVP. This decision cascades
  into `ELITE_RIDER`'s `currentLevel >= MAX_LEVEL - 1` condition.

- **XP values** — engine's `XP_RULES` (5 flat constants) vs DB's `xp_actions`
  table (13 named actions — e.g. `FIVE_STAR_RATING` is 40 in the DB but 30 in
  the engine; the DB has no `LATE_DELIVERY` penalty concept at all). Reconcile
  which numbers are authoritative before wiring persistence, or the same event
  scores differently depending on which layer computed it.

- **Reputation** — engine computes a derived 0–100 score on the fly
  (`ReputationService`, a punctuality/rating/completion-rate weighted blend)
  and never persists it. DB persists `riders.reputation_score` *plus* a
  `performance_grade` enum (S/A/B/C/D/F) and a `reputation_tiers` lookup table
  the engine has no equivalent of. Decide whether the engine's formula becomes
  the write-path for those columns, or another process owns them and
  `ReputationService` is display-only.

- **`Reward` ↔ `letaa_rewards.*`** — the biggest scope gap. Engine's `Reward`
  is `{eligible: boolean, reason: string}` — eligibility-only, explicitly out
  of scope for issuance (`RewardService`'s own comment, and the README: "Rewards
  are eligibility-only"). The DB models full blockchain issuance: `rewards`,
  `nfts`, `blockchain_transactions`, `wallet_balances` — wallet addresses, tx
  hashes, gas, network. This is precisely the seam the TODO in
  `game.controller.ts` names ("trigger Avalanche reward issuance when
  `rewardEligible` is true"): a **new** service, outside today's
  `src/services/rewards/`, is needed to turn `{eligible: true}` into a real
  `letaa_rewards.rewards` row + blockchain transaction. `RewardService` itself
  shouldn't grow this responsibility — it should stay eligibility-only.

- **`FeedbackResponse` ↔ `letaa_gamification.feedback`** — engine's
  `FeedbackResponse` is a single templated string, generated fresh per request,
  never stored. The DB persists structured rows per delivery
  (`performance_score`, `performance_grade`, `feedback_message`,
  `improvement_tip`, `rating`, `earned_xp`). Persisting requires the controller
  to write the generated string (+ whatever score/grade it can derive) into
  this table after `processDelivery()` returns.

## 4. Phased implementation plan

- **Phase 0** — Git merge (mechanical, §2).
- **Phase 1** — Add a DB client + repository layer to the TS project (pick one
  of `pg`/Prisma/Drizzle), scoped to `letaa_core`/`letaa_delivery` only, enough
  to close the two `TODO(Backend Developer 2)` spots in `game.controller.ts`:
  `PlayerRepository.findById` (→ `Player`) and `PlayerRepository.save`
  (persist post-delivery `Player` + insert `xp_history` row).
- **Phase 2** — Resolve the levels/XP/achievement-count mismatches (§3)
  *before* wiring persistence, so returned numbers match what gets written.
- **Phase 3** — Generalize `MissionService`/`AchievementService` from hardcoded
  enums to data-driven evaluation against `quests`/`achievements` rows. Pick
  one naming convention (Mission vs Quest) and use it end-to-end — don't map
  silently at the boundary and keep both names alive.
- **Phase 4** — Build the reward-issuance service that consumes
  `rewardEligible`/`reason` and writes to `letaa_rewards.*` — new component,
  not a change to `RewardService`.
- **Phase 5** — Persist `FeedbackResponse` + computed reputation/grade into
  `letaa_gamification.feedback` and `riders.reputation_score`/
  `performance_grade` after each request.
- **Phase 6** — Add an integration test suite against a real/seeded Postgres
  instance. Keep the existing pure-function unit tests as-is (they don't touch
  a DB and shouldn't need to).

## 5. Open decisions needed before starting

1. Source of truth for levels/XP/achievements/quests — DB seed data
   (recommended: richer, multi-schema) or engine constants?
2. DB client/ORM choice for Phase 1.
3. "Mission" vs "Quest" as the canonical name throughout the engine.
4. Who owns `performance_grade`/`reputation_tiers` — the engine's
   `ReputationService` formula, or a DB-side process/trigger?
