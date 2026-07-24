# LETAA - Gamified Delivery Rider System on Avalanche

A gamification engine for delivery riders with on-chain rewards on Avalanche Fuji testnet. Built for the MiniHack Game Jam (Problem 03: Logistics & Last-Mile Delivery).

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Frontend    │◄───►│  Backend (API)    │◄───►│  Database (Supabase) │
│  React+Vite  │     │  Node/Express    │     │  Riders, XP, Levels  │
└─────────────┘     │  + ethers.js     │     │  Missions, Rewards   │
                    └────────┬─────────┘     └─────────────────────┘
                             │ milestone events
                             ▼
                    ┌──────────────────┐
                    │  Avalanche Fuji   │
                    │  RiderRewardHub   │
                    │  + ERC20 RXP      │
                    └──────────────────┘
```

**Key Design Decision**: XP stays OFF-CHAIN (fast, cheap, mutable). Only MILESTONE PROOFS go on-chain (immutable achievement badges, token rewards).

## Project Structure

```
letaa/
├── contracts/                 # Hardhat smart contract project
│   ├── contracts/
│   │   ├── RiderXPToken.sol   # ERC20 reward token (0 decimals = 1 RXP = 1 XP)
│   │   └── RiderRewardHub.sol # Distribution hub (operator-only mint)
│   ├── scripts/
│   │   ├── deploy.js          # Deploy + transfer ownership
│   │   ├── verify.js          # Verify on Snowtrace
│   │   └── test-reward.js     # Test reward distribution
│   └── test/
│       └── RiderRewardHub.test.js
├── backend/                   # Express + TypeScript API
│   ├── src/
│   │   ├── blockchain/        # Avalanche integration
│   │   │   ├── provider.ts    # ethers.js provider + contracts
│   │   │   └── reward.service.ts  # Idempotent reward distribution
│   │   ├── routes/
│   │   │   ├── game.routes.ts   # Delivery processing endpoint
│   │   │   └── rider.routes.ts  # Wallet connect, reward history
│   │   ├── services/          # Gamification engine
│   │   └── database/
│   │       └── supabase.client.ts
├── frontend/                  # React + Vite (to be created)
│   └── src/
│       ├── hooks/
│       │   └── useWallet.ts   # MetaMask/Core connection + Fuji switch
│       └── components/
│           ├── WalletConnect.tsx
│           ├── RewardBalance.tsx
│           └── RewardHistory.tsx
├── supabase/
│   └── migrations/
│       └── 001_add_wallet_and_rewards.sql
└── roadmap.md                 # Detailed implementation roadmap
```

## Quick Start

### Prerequisites
- Node.js 20+
- Avalanche Fuji testnet AVAX (get from [faucet](https://core.app/tools/testnet-faucet/))
- Supabase project
- MetaMask or Core browser extension

### 1. Smart Contracts

```bash
cd contracts
npm install
cp .env.example .env
# Edit .env with your PRIVATE_KEY and RPC_URL
npm run deploy:fuji
npm run verify:fuji
# Copy deployed addresses to backend .env
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with:
# - Contract addresses from step 1
# - Supabase credentials
# - PRIVATE_KEY (operator wallet)
npm run dev
```

### 3. Database

Run the migration in Supabase SQL Editor:
```sql
-- See supabase/migrations/001_add_wallet_and_rewards.sql
```

### 4. Frontend (coming soon)

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Contracts (`.env`)
```bash
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_deployer_key_no_0x
CHAIN_ID=43113
SNOWTRACE_API_KEY=optional
```

### Backend (`.env`)
```bash
# Avalanche
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_operator_key_no_0x
CHAIN_ID=43113
TOKEN_CONTRACT_ADDRESS=0x...
HUB_CONTRACT_ADDRESS=0x...

# Demo safety
MOCK_CHAIN=false

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx

# Server
PORT=3000
NODE_ENV=development
```

### Frontend (`.env`)
```bash
VITE_API_URL=http://localhost:3000/api
VITE_TOKEN_ADDRESS=0x...
VITE_HUB_ADDRESS=0x...
VITE_CHAIN_ID=43113
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/game/delivery` | Process delivery event → XP, levels, rewards |
| POST | `/api/riders/wallet` | Connect rider wallet address |
| GET | `/api/riders/:id/rewards` | Get reward transaction history |
| GET | `/api/riders/:id/balance` | Get on-chain RXP balance |
| GET | `/health` | Health check |

## Reward Triggers

| Milestone | RXP Amount | Reason String |
|-----------|------------|---------------|
| Level Up | `level * 100` | `level_up_{level}` |
| Achievement | `rarity * 200` | `achievement_{id}` |
| Daily Mission | 500 | `daily_mission_complete` |
| Weekly Mission | 2000 | `weekly_mission_complete` |
| Streak (7/14/30) | `days * 50` | `streak_{days}` |
| First Delivery | 100 | `first_delivery` |
| 100 Deliveries | 5000 | `century_deliveries` |

## Demo Safety Features

1. **MOCK_CHAIN mode**: Set `MOCK_CHAIN=true` in backend `.env` to simulate rewards without real transactions
2. **Idempotency**: Unique index on `(rider_id, reason)` prevents duplicate rewards
3. **Retry queue**: Failed transactions stored as `pending_retry`, retried via cron
4. **Operator wallet isolation**: Backend uses separate operator key, never touches rider keys
5. **Pre-funded operator**: Fund operator wallet with 2+ AVAX before demo

## Testing

```bash
# Backend tests
npm test

# Contract tests
cd contracts && npm test

# Test reward distribution
cd contracts && npm run test:reward
```

## Deployment Checklist

- [ ] Fresh deployer/operator wallet generated
- [ ] Wallet funded with Fuji AVAX
- [ ] `.env` in `.gitignore` (verify: `git ls-files | grep .env` returns nothing)
- [ ] Contracts deployed and verified on Snowtrace
- [ ] Contract addresses added to backend/frontend `.env`
- [ ] Supabase migration run
- [ ] Operator wallet funded (2+ AVAX)
- [ ] `MOCK_CHAIN=false` for real demo
- [ ] 1-minute screen recording with Snowtrace visible

## Security Notes

- **Never** commit `.env` files
- **Never** reuse personal wallet keys for deployer/operator
- **Never** ask users for private keys (use `eth_requestAccounts` only)
- Contract ownership transferred to hub at deploy time
- Idempotency prevents reward double-spending
- Service role key only used server-side

## License

MIT - Built for MiniHack Game Jam