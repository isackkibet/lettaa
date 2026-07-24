# Status Report: Smart Contract Integration

**Branch reviewed**: `smart-contract/avalanche-delivery-rider` (5 commits: contracts →
backend Avalanche integration → DB migration → frontend wallet UI → CI)
**Reference doc**: `x_docs/smart_contract` (system flow: Frontend → Backend →
Supabase → Gamification Engine → Reward Service → Avalanche → back to Backend/Frontend)
**Method**: read every file in the diff, cross-checked against the doc's flow,
then actually ran `npm install`, `npm run lint`, `npm test`, `npm run build`
rather than trusting `progress.md`'s self-reported checklist. Updated after
reading `x_docs/AI/` — the hackathon's own problem-statement packet, pitch
deck, team task allocation, blockchain integration guide, and design taxonomy
(`GameJam ProblemStatements.pdf`, `Gamified Delivery Rider System on
Avalanche.pdf`, `Team Structure & Task Allocation (12-Hour Hackathon).pdf`,
`Avalanche_Blockchain_Integration_Guide.md`, `tables.md`, `commit.md`) — which
supplies the actual judging bar this branch is being built against.
`x_docs/AI/roadmap.md` and `x_docs/AI/README.md` are byte-identical to the
root `roadmap.md` and an earlier version of the root `README.md`, so no new
facts there; the other five files are new context, folded in below.

---

## 🚨 New context: this is being judged against a hard gate, tonight

`GameJam ProblemStatements.pdf` (the actual event brief — 6:00 PM–6:00 AM,
Problem 03 = Logistics & Last-Mile Delivery, signature principle =
**Feedback**) states the submission standard in one line: *"Working software,
deployed on-chain, is the standard. A great gamification concept with
nothing built behind it does not advance."* The non-negotiable gate is three
things: (1) a verifiable **on-chain deployment** — a contract address or tx
judges can check themselves, not a screenshot; (2) a 1-minute screen
recording with on-chain proof visible; (3) a 3-minute live demo at 5:00 AM.

None of the three exist yet — as already noted below, contracts compile but
have never been deployed to Fuji. This reframes "Contracts not deployed" from
a "Pending" checklist item into **the actual blocker for advancing**,
regardless of how complete the off-chain engine is.

Separately, `Team Structure & Task Allocation.pdf`'s MVP success criteria is
a 10-step, under-90-second demo loop (connect wallet → open Rider Dashboard →
view mission → simulate delivery → feedback → XP → level progress → reward →
Avalanche tx → refreshed dashboard). Developer 3's assigned deliverables for
that loop — Rider Dashboard, Mission Panel, XP Progress Bar, Level
Progression UI, Achievement Popups, Delivery Simulator buttons — are not in
the diff at all; only 3 of the ~9 listed frontend pieces exist
(`WalletConnect`, `RewardBalance`, `RewardHistory`), and none of them is the
actual game-loop screen a judge would click through. Even with contracts
deployed and persistence wired, there is currently no UI to run this demo in.

---

## ✅ Done right

- **Smart contracts match the doc's "trusted reward layer" description exactly, and
  compile cleanly.** `RiderXPToken` (0-decimal ERC20, owner-only mint) +
  `RiderRewardHub` (operator-gated `distributeReward`, emits `RewardDistributed`,
  `setOperator` for key rotation) are a clean, minimal implementation of "receive
  reward requests → transfer → record → return tx hash." Verified this session:
  `npm run compile` in `contracts/` succeeds (8 Solidity files, evm target paris).
  The underlying auth logic is sound — `onlyOperator`/`onlyOwner` correctly gate
  every privileged call — but see the test-suite bug below before trusting the test
  file itself.
- **Backend reward flow follows the doc's flow diagram step for step.**
  `GameController.handleDelivery` → checks `progress.rewardEligible` → looks up the
  rider's `wallet_address` → calls `distributeReward()` → logs the tx hash. This is
  exactly "Reward Service → if rewardEligible == true → Avalanche Smart Contract →
  returns Transaction Hash."
- **`src/blockchain/reward.service.ts` exceeds what the doc asks for**: idempotency
  (unique DB index on `(rider_id, reason)` + a pre-check) prevents double-minting on
  retries, and a `pending_retry` status + `retryFailedRewards()` gives a recovery path
  the doc doesn't even mention.
- **Credentials handling matches the doc's "Uses backend credentials (.env)" step**:
  `PRIVATE_KEY`/`AVALANCHE_RPC_URL`/`*_CONTRACT_ADDRESS` are read from env in
  `blockchain/provider.ts`, `.env` is gitignored, and `.env.example` files exist at
  root, `contracts/`, and `frontend/` with placeholder values only.
- **`MOCK_CHAIN` fallback** is a reasonable addition for demo safety not in the doc.
- **Frontend pieces implement the doc's Frontend responsibilities at the code level**:
  `useWallet.ts` (connect, auto-detect, Fuji chain switch, POST to `/api/riders/wallet`),
  `WalletConnect.tsx`, `RewardBalance.tsx` (polls on-chain balance), `RewardHistory.tsx`
  (reward list with Snowtrace links + status colors).
- **Backend actually builds and passes once dependencies are installed** — verified in
  this session: `npm run lint` (tsc --noEmit) clean, `npm test` → 6/6 suites, 20/20
  tests, `npm run build` clean.

## ⏳ Pending (acknowledged, not yet built)

- **No persistence wiring** — `GameController` still calls `createDefaultPlayer(riderId)`
  on every request instead of loading a rider's accumulated XP/level/streak from
  Supabase, and never writes the post-delivery state back. The doc's flow step
  "Database (Supabase) → Rider completes delivery → Gamification Engine" isn't actually
  connected yet — the reward-issuance half of the pipeline works, but the gamification
  half still runs stateless every time. (`progress.md` itself flags this as the next
  focus for "Backend Dev 2.")
- **Frontend has no runnable app** — `frontend/` contains only loose `hooks/`/
  `components/` files. There's no `package.json`, `App.tsx`, `vite.config`, or
  `index.html`, so "coming soon" in the README is accurate, but `progress.md` marking
  the frontend phase "✅ Complete" overstates it — the components exist, the project
  that would build/run them doesn't.
- **Contracts not deployed** — no `deployed-addresses.json` / `contracts/deployments/`
  present, `TOKEN_CONTRACT_ADDRESS`/`HUB_CONTRACT_ADDRESS` are empty everywhere.
  Expected pre-deployment state, not a bug — just the next step.
- **No retry scheduler** — `retryFailedRewards()` exists but nothing calls it on an
  interval; the roadmap lists a cron job for this as a to-do.
- **No `/health/chain` endpoint** — only the generic `/health` from before this branch
  exists, despite the roadmap listing an RPC-connectivity health check as a demo-safety
  deliverable.

## ⚠️ Needs a workaround or fix

- **Feedback quality is a mixed bag against the project's own signature
  principle.** Problem 03's signature principle is literally *Feedback*, and
  its stated common pitfall is *"Ego-level feedback only ('Nice work!').
  Riders need to know how they're doing and what to change next — task and
  process feedback, not praise."* The team's own pitch deck gives the bar to
  clear: *"Your delivery speed improved by 8%. Maintain this for 5 more trips
  to unlock Silver Status."* Checked against `FEEDBACK_TEMPLATES`
  (`src/constants/feedback.constants.ts`): `NEXT_LEVEL_PROGRESS`
  (`'{xpRemaining} XP to reach {nextLevelTitle}.'`) and `MISSION_PROGRESS`
  clear that bar — concrete numbers, concrete next step. But
  `ACHIEVEMENT_UNLOCKED` (`'Achievement unlocked: {achievementTitle}!'`),
  `DEFAULT` (`'Delivery recorded. Keep up the momentum.'`), and especially
  `LATE_DELIVERY` (`'That delivery was late. Stay sharp to protect your
  reputation.'` — no number, no concrete guidance) read as exactly the
  generic praise/notification pattern the problem statement calls out as the
  failure mode to avoid. Worth revisiting those three before judging, since
  this is the exact axis being scored.
- **Reward-sink messaging doesn't match what's actually deployed.** The pitch
  deck's "Reward Economy Architecture" slide describes the reward sink as
  *"AVAX Payouts & Benefits Access."* The actual contracts mint an ERC20
  ("Rider XP Token", RXP) — not native AVAX. Not a code bug, but if judges
  were shown the deck, they'll expect AVAX balances and see RXP token
  balances instead; either update the deck's claim or clarify it in the demo
  script.
- **No serialization around concurrent reward calls, despite the team's own
  integration guide flagging exactly this risk.**
  `Avalanche_Blockchain_Integration_Guide.md` §8.7 warns: *"if you have
  multiple backend processes/workers using the same operator wallet, they
  can race and produce nonce errors. Keep reward-sending in one
  process/queue."* `GameController.handleDelivery` calls `distributeReward()`
  inline, per-request, with no queue or mutex — `provider.ts` constructs a
  fresh `ethers.Wallet` on every call, and ethers fetches the "next" nonce
  from chain state each time. Two `/api/game/delivery` requests that both
  trigger a reward and land close together (plausible under any real demo
  traffic, and trivial to trigger by just double-clicking "simulate
  delivery") can race for the same nonce and one transaction will fail. Low
  risk for a single-judge live demo clicking slowly, real risk under any
  concurrent load.
- **The contract test suite fails: 7 passing, 6 failing** (verified this session —
  `npm test` in `contracts/`, after `npm install` completed). The contracts themselves
  are not the problem; the tests have drifted from them in two distinct ways:
  1. Three `RiderXPToken` assertions expect string revert reasons
     (`'Ownable: caller is not the owner'`, `'zero address'`) but OpenZeppelin v5's
     `Ownable` (the version actually pinned in `contracts/package.json`) reverts with
     a custom error (`OwnableUnauthorizedAccount(...)`) instead — Chai's
     `revertedWith` never matches. Needs `revertedWithCustomError` assertions, or a
     pin to OZ v4-style string reverts.
  2. `"owner can mint rewards"` fails outright: `beforeEach` transfers token
     ownership to the hub, then this test calls `mintReward` as `deployer` (no
     longer the owner) instead of connecting as the hub — a test-setup ordering bug,
     not a contract bug.
  3. Three `RiderRewardHub` assertions expect the revert reason `'not authorized'`,
     but the contract's actual `require` string is `'RiderRewardHub: not authorized'`
     (`contracts/contracts/RiderRewardHub.sol:20`) — the contract's message was
     prefixed after the tests were written and the tests were never updated to match.

  None of this means the contracts are broken (the failures are all "reverted for the
  right reason, wrong string/setup" — the auth logic itself is intact), but it does
  mean **the test suite cannot currently be trusted as a safety net**, and CI's
  `lint-and-test` job only runs backend tests + contract *compile* — it doesn't run
  `contracts` tests at all, so this has been silently red without anyone noticing.

- **Dependencies aren't installed by default.** `ethers`, `@supabase/supabase-js`, and
  `dotenv` are in `package.json` but were missing from `node_modules` in this checkout —
  `npm run lint`/`build` fail immediately with `Cannot find module 'ethers'` etc. Fix:
  `npm install` at repo root (confirmed this resolves it and all checks pass clean).
- **The two "duplicate" migration files have diverged.** `database/migrations/001_...sql`
  and `supabase/migrations/001_...sql` are meant to be identical (per `progress.md`:
  "duplicate for clarity") but aren't: one adds a `rider_rewards_summary` view and no
  trigger, the other adds an `updated_at` trigger and no view, plus different check
  constraints and index names. Running "the" migration is ambiguous — pick one as
  canonical and delete (or regenerate) the other before this goes near a real Supabase
  project.
- **Neither migration creates the `riders` table.** Both only run
  `ALTER TABLE riders ADD COLUMN wallet_address ...` — they assume `riders` already
  exists with columns matching `database.types.ts` (`total_xp`, `deliveries_completed`,
  `on_time_deliveries`, etc., which do mirror `Player` 1:1 — that part is internally
  consistent). But nothing in this repo actually creates that table. Someone needs to
  either commit a `000_create_riders.sql` or confirm it already exists in the target
  Supabase project.
- **This schema conflicts with the earlier `letaa_db.sql` work.** The DB-merge analysis
  in `x_docs/MERGE_PLAN.md` describes a much richer `letaa_core.riders`/
  `letaa_gamification.*` schema (wallet on `users`, coins/gems/tokens, reputation tiers,
  quests, NFTs — see that doc for detail). This branch's implicit `public.riders`
  (flat, five gamification counters + wallet) is a different, incompatible table in a
  different schema namespace. The two were built independently and never reconciled —
  worth deciding which one is canonical before wiring real persistence, or the
  `playerRepository` from the "Pending" item above will be built against the wrong table.
- **README's Quick Start doesn't match the repo layout.** It says `cd backend && npm install`,
  but there is no `backend/` directory — the Express app is at the repo root (`src/`,
  `package.json` live at top level, same as before this branch). Following the README
  literally fails at step 2; the actual command is just `npm install` from the root.
- **CI's `build-frontend` job will fail as configured.** It runs `npm ci` /
  `npm run build` in `./frontend`, but `frontend/package.json` doesn't exist yet (see
  "Pending" above). This job needs either a real frontend scaffold or to be disabled
  until one exists, or every push will show a red CI check.
- **Stray `AI` line in `.gitignore`** (between the `node_modules/` and `dist/` blocks) —
  looks like a paste artifact rather than an intentional ignore rule. Harmless but worth
  removing.
- **Two same-named, different-purpose `reward.service.ts` files** —
  `src/services/rewards/reward.service.ts` (pure eligibility check, pre-existing) and
  `src/blockchain/reward.service.ts` (on-chain issuance, new). That's a reasonable split
  architecturally, but the eligibility one still carries a stale
  `TODO(Backend Developer 2): wire actual reward issuance (Avalanche)` comment even
  though issuance is now wired — worth updating so it doesn't mislead the next reader
  into thinking this is still unbuilt.

---

## Bottom line

**The one thing that actually gates advancement — a verifiable on-chain deployment —
hasn't happened.** Everything else in this report is real engineering debt, but per the
event's own rules, a fully-built, undeployed system does not advance and a deployed-but-
rough one might. Deploying to Fuji and verifying on Snowtrace should be the next action,
not the last one.

Underneath that: the **contract ↔ backend ↔ chain** half of the doc's flow is real and
functionally sound: eligibility → reward service → smart contract → tx hash → logged,
with idempotency and a mock-chain demo fallback. The contracts compile cleanly, but their
own test suite is currently broken (7/13, all string-matching/setup bugs, not contract
logic bugs) and CI never runs it — fix that before treating the contracts as verified.
The **database ↔ gamification engine** half — the part that would make `rewardEligible`
reflect a rider's *actual* accumulated progress rather than a fresh default player every
request — is the biggest remaining backend gap, compounded by the fact that two
incompatible ideas of the `riders` table now exist in the project. The **frontend is
component-level scaffolding, not yet an app** — no dashboard, mission panel, or delivery
simulator exists for a judge to actually click through the demo loop. And the
**feedback copy**, on the axis this whole problem statement is actually scored on,
partially — not fully — clears the bar the team set for itself. None of this blocks a
`MOCK_CHAIN=true` local demo of the reward-issuance path; it does block both a real
end-to-end delivery → persisted XP → reward flow and, more urgently, the on-chain
deployment the judging gate requires.
