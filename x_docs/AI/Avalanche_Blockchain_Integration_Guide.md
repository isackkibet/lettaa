# Gamified Delivery Rider System — Avalanche Blockchain Integration Guide

Full-stack guide for wiring the on-chain reward layer (Problem 03 — Logistics & Last-Mile Delivery, signature principle: **Feedback**) into the rest of the system: frontend, backend, and database.

---

## 1. Where Blockchain Sits in the Architecture

A critical design decision first, because it shapes everything else: **don't put XP on-chain.**

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────────┐
│  Frontend    │◄────►│  Backend (API)    │◄────►│  Database (Supabase) │
│  React+Vite  │      │  Node/NestJS      │      │  Riders, XP, Levels   │
└─────────────┘      │  + ethers.js      │      │  Missions, Rewards    │
                      └────────┬──────────┘      └─────────────────────┘
                               │ only on milestone events
                               ▼
                      ┌──────────────────┐
                      │ Avalanche Fuji    │
                      │ RiderRewardHub.sol│
                      │ (+ ERC20 token)   │
                      └──────────────────┘
```

**Off-chain (DB):** every delivery event, XP calculation, streaks, levels, mission progress, leaderboard ranking. This needs to be fast, cheap, and mutable — a blockchain is the wrong tool for this.

**On-chain (Avalanche Fuji):** only the *proof of achievement* — when a rider crosses a milestone (level-up, badge, weekly goal), the backend triggers **one** transaction that mints/transfers tokens or issues a badge. This is what the pitch deck calls "immutable achievement badges" and "on-chain reputation" — it's a reward/receipt layer, not the whole game engine.

Why this matters for judging: your problem statement's signature principle is **Feedback**, and Routledge's principle is about the *loop* (where am I / how am I doing / what's next), which lives in your backend + frontend. The chain's job is just to make the reward tamper-proof and verifiable — over-engineering it to store XP on-chain will burn your 12 hours on gas costs and confirmation latency instead of the feedback loop that's actually being judged.

---

## 2. Wallets: One Per Rider

You said every rider needs an individual wallet to accumulate XP. One thing to get right immediately: **decide custody model, because it changes your whole build.**

| Model | How it works | Effort | Recommended for hackathon? |
|---|---|---|---|
| **Non-custodial (rider brings own wallet)** | Rider connects MetaMask/Core; contract mints/transfers directly to their address | Low backend complexity, but onboarding friction (rider needs a wallet + testnet AVAX) | ✅ Yes — matches your MVP flow ("Connect wallet" is step 1) |
| **Custodial (platform generates a wallet per rider)** | Backend generates a keypair per rider, stores encrypted private key, signs on their behalf | You now own key management, encryption at rest, and signing infra | ❌ Avoid for 12 hours — real product feature, not hackathon scope |

**Recommendation:** non-custodial. Store the rider's wallet address as a column on their profile (`riders.wallet_address`), captured once at wallet-connect time on the frontend. The backend never touches rider private keys — only its own deployer/operator key (see §4).

---

## 3. ERC20 Token Setup

### 3.1 Decide what the token represents
Two common shapes, and you can do both:
- **Fungible reward token (ERC20)** — e.g. `RiderXP` or `RIDE` — represents earned points/coins that convert to AVAX bonuses or in-app perks.
- **Non-fungible achievement badge (ERC721, "soulbound")** — for level-up badges / NFTs mentioned in your deck. Soulbound just means you override `transfer`/`transferFrom` to revert, so badges can't be sold — they're reputation, not currency.

For a 12-hour build, ship the ERC20 first. If time remains, add a minimal non-transferable ERC721 for badges.

### 3.2 Minimal ERC20 contract (OpenZeppelin)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RiderXPToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("Rider XP Token", "RXP")
        Ownable(initialOwner)
    {}

    // Only the backend's operator wallet (owner) can mint rewards.
    function mintReward(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

Notes:
- `decimals()` defaults to 18 in OpenZeppelin's ERC20 — fine to leave as-is unless you want whole-number XP display, in which case override `decimals()` to return `0` so 1 token = 1 XP with no fractional confusion in the UI.
- `onlyOwner` on `mintReward` is your access control — **this is the single most important line in the file.** Without it, anyone could mint themselves unlimited rewards.

### 3.3 The reward-distribution hub

Your team's plan already calls for a `RiderRewardHub.sol` with a `distributeReward` helper. Keep the hub as a thin wrapper that calls the token, so business logic (which milestone → how much) stays in your backend, not in Solidity (cheaper to iterate on scoring rules without redeploying):

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./RiderXPToken.sol";

contract RiderRewardHub {
    RiderXPToken public immutable token;
    address public operator;

    event RewardDistributed(address indexed rider, uint256 amount, string reason);

    modifier onlyOperator() {
        require(msg.sender == operator, "not authorized");
        _;
    }

    constructor(address tokenAddress, address operatorAddress) {
        token = RiderXPToken(tokenAddress);
        operator = operatorAddress;
    }

    function distributeReward(address rider, uint256 amount, string calldata reason)
        external
        onlyOperator
    {
        token.mintReward(rider, amount);
        emit RewardDistributed(rider, amount, reason);
    }
}
```

Important: after deploying `RiderXPToken`, you must transfer its `Ownable` ownership to the `RiderRewardHub` contract address (or set the hub as a minter role) — otherwise the hub calling `mintReward` will revert with an ownership check failure. This is a common first-deploy mistake.

---

## 4. RPC URL and Private Key — How They're Actually Used

These two things do different jobs and beginners often conflate them:

- **RPC URL** = the door to the network. It's how any tool (Hardhat, ethers.js, MetaMask) *reads* chain state and *submits* signed transactions. It is not a secret — you can share it freely.
- **Private key** = what *signs* a transaction, proving you authorized it. This is the secret. Whoever holds it can move funds/call `onlyOwner` functions as that address.

### 4.1 Avalanche Fuji testnet details (confirmed current as of this guide)
- RPC URL: `https://api.avax-test.network/ext/bc/C/rpc`
- Chain ID: `43113`
- Currency: `AVAX` (testnet, from faucet — not real value)
- Explorer: `https://testnet.snowtrace.io`
- Faucet: `https://core.app/tools/testnet-faucet/` (or the Avalanche Discord faucet channel) — request testnet AVAX for your **deployer/operator** address before anything else; every deployment and every `distributeReward` call costs gas.

### 4.2 Environment variables, never hardcoded

Create `.env` in your project root (backend + Hardhat project — keep them separate if they're different repos/folders):

```bash
# .env  — NEVER COMMIT THIS FILE
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_deployer_wallet_private_key_without_0x_prefix
CHAIN_ID=43113
TOKEN_CONTRACT_ADDRESS=
HUB_CONTRACT_ADDRESS=
```

Load it with `dotenv`:

```javascript
require("dotenv").config();
```

**Hardhat config (`hardhat.config.js`):**

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.24",
  networks: {
    fuji: {
      url: process.env.AVALANCHE_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 43113,
    },
  },
};
```

Deploy:

```bash
npx hardhat run scripts/deploy.js --network fuji
```

Where does the private key come from? Generate a **fresh** wallet for this project (MetaMask → new account, or `npx hardhat node` won't help here since you need a real Fuji-funded key) — do **not** reuse a personal wallet's key, and do **not** use a key that holds real mainnet funds, ever, even for a hackathon.

---

## 5. Backend Integration (ethers.js)

The backend holds the **operator** private key (same one used to deploy, or a separate operator wallet you've set as `operator` in the hub contract) and is the only thing that ever signs on-chain transactions server-side.

```javascript
// blockchain/rewardService.js
const { ethers } = require("ethers");
require("dotenv").config();

const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);
const operatorWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const hubAbi = [
  "function distributeReward(address rider, uint256 amount, string reason) external",
  "event RewardDistributed(address indexed rider, uint256 amount, string reason)",
];

const hub = new ethers.Contract(process.env.HUB_CONTRACT_ADDRESS, hubAbi, operatorWallet);

async function distributeReward(walletAddress, amount, reason) {
  const tx = await hub.distributeReward(walletAddress, amount, reason);
  const receipt = await tx.wait(); // wait for confirmation before telling frontend "done"
  return { txHash: receipt.hash, status: receipt.status };
}

module.exports = { distributeReward };
```

Call this **only** from your milestone-detection logic (e.g. inside the level-up or mission-completion handler) — never on every single delivery, or every XP tick, because each call is a real transaction with real (testnet) gas and 1-2s confirmation latency. Batch: accumulate XP off-chain, fire one on-chain call when a threshold is crossed.

Wrap it so a chain hiccup never breaks the core game loop:

```javascript
try {
  const result = await distributeReward(rider.wallet_address, amount, reason);
  await db.rewards.insert({ rider_id: rider.id, tx_hash: result.txHash, amount, reason });
} catch (err) {
  console.error("On-chain reward failed, will retry:", err);
  await db.rewards.insert({ rider_id: rider.id, amount, reason, status: "pending_retry" });
  // don't block the API response to the frontend on this
}
```

---

## 6. Database: What to Store

Add these fields/tables to your Supabase schema:

```sql
alter table riders add column wallet_address text unique;

create table reward_transactions (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid references riders(id),
  amount numeric not null,
  reason text not null,
  tx_hash text,
  status text default 'pending', -- pending | confirmed | failed | pending_retry
  created_at timestamptz default now()
);
```

Why a separate `reward_transactions` table instead of just a column: you need an audit trail (which milestone triggered which transaction), a way to detect **duplicate triggers** (see §8), and a retry queue for failed chain calls that shouldn't block gameplay.

---

## 7. Frontend: Wallet Connect + Reading State

Two moments the frontend touches chain:
1. **Wallet connect** (once, onboarding) — capture the address, `POST` it to your backend to store on the rider's profile.
2. **Displaying reward status / balance** — read-only, doesn't need a private key.

```javascript
// wallet connect (ethers v6 + browser wallet)
async function connectWallet() {
  if (!window.ethereum) throw new Error("No wallet found — install MetaMask or Core");
  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_requestAccounts", []);
  const address = accounts[0];

  // ensure they're on Fuji
  await window.ethereum.request({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: "0xA869" }], // 43113 in hex
  }).catch(async (err) => {
    if (err.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0xA869",
          chainName: "Avalanche Fuji Testnet",
          nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
          rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
          blockExplorerUrls: ["https://testnet.snowtrace.io"],
        }],
      });
    }
  });

  await fetch("/api/riders/wallet", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
  return address;
}
```

The frontend **never** holds the operator private key — that lives only in the backend's `.env`. The frontend only ever asks the rider's own wallet to sign things the rider initiates (like connecting), never reward transactions — those are server-signed.

---

## 8. Things You're Likely Missing (Grey Areas to Close Before Judging)

1. **Ownership handoff after deploy.** Deploying `RiderXPToken` then `RiderRewardHub` separately leaves the token owned by your deployer wallet, not the hub. Add a step in your deploy script: `await token.transferOwnership(hubAddress)`. Test one real `distributeReward` call end-to-end before demo night — this is exactly the kind of thing that silently reverts at 4:45am.

2. **Duplicate-trigger protection.** If your milestone check runs more than once (retry logic, webhook fired twice, page refresh), you could mint the same reward twice. Add an idempotency key: check `reward_transactions` for an existing row with the same `(rider_id, reason)` before calling the chain.

3. **Gas funding for the operator wallet.** Every `distributeReward` call costs testnet AVAX gas. Fund the operator address generously from the faucet *before* the demo, and check its balance is non-zero right before judging — an empty gas tank is the single most common last-minute hackathon failure.

4. **Confirmation latency in the UI.** Fuji has ~2s block times, but network hiccups happen. Show a "pending" state on the frontend the moment the backend call is fired, then update to "confirmed" once `tx.wait()` resolves — don't make the UI hang silently.

5. **Contract verification on Snowtrace.** Judges said they want a "contract address judges can check themselves." Run `npx hardhat verify --network fuji <address> <constructorArgs>` so the source code is readable on `testnet.snowtrace.io`, not just a bytecode blob.

6. **The screen recording requirement.** Per the problem-statement rules, you need a 1-minute recording with on-chain proof *visible on screen* — plan to have Snowtrace open in a tab showing the transaction confirm live, not just the app UI.

7. **Rate-limit / nonce handling if you fire multiple rewards close together.** ethers.js manages nonces automatically per-provider-instance, but if you have multiple backend processes/workers using the *same* operator wallet, they can race and produce nonce errors. Keep reward-sending in one process/queue for the hackathon.

8. **.env in `.gitignore` before your first commit — not after.** This is the most common way hackathon teams leak a private key on GitHub. Check `git status` right now:

   ```bash
   echo ".env" >> .gitignore
   git rm --cached .env  # if it was already committed
   ```

   Commit a `.env.example` instead, with placeholder values, so teammates know what variables are needed without the secrets:

   ```bash
   AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
   PRIVATE_KEY=
   CHAIN_ID=43113
   TOKEN_CONTRACT_ADDRESS=
   HUB_CONTRACT_ADDRESS=
   ```

   If a private key **does** get pushed to GitHub at any point, treat that wallet as burned — generate a new one and redeploy, even on testnet, since it's good practice for the real thing.

9. **Never reuse the deployer key as a rider wallet, and never ask riders for their private key.** The frontend should only ever request signatures/connections through the wallet extension's own popup (`eth_requestAccounts`) — if any code path asks a user to paste a private key into a form, that's a critical bug, not a shortcut.

10. **Decide now what happens if the chain call fails during the live demo.** Per your team's own hackathon notes: "if blockchain becomes a blocker, provide mocked responses so the rest of the team keeps moving." Have a feature flag or `MOCK_CHAIN=true` env var that fakes a successful `tx_hash` response so the full demo loop (Challenge → Action → Feedback → Progress → Reward) can still complete even if Fuji is flaky mid-demo — the judging gate cares about a verifiable on-chain deployment existing, not that every single click during your 90-second walkthrough goes on-chain live.

---

## 9. Quick Setup Checklist

- [ ] Generate a fresh operator wallet (not your personal one)
- [ ] Fund it with Fuji testnet AVAX from the faucet
- [ ] `.env` created and added to `.gitignore` before first commit
- [ ] `.env.example` committed with blank values
- [ ] Deploy `RiderXPToken`, then `RiderRewardHub`
- [ ] Transfer token ownership to the hub contract
- [ ] Verify both contracts on Snowtrace
- [ ] Test one full `distributeReward` call manually via script before wiring the UI
- [ ] Add `wallet_address` to riders table + `reward_transactions` audit table
- [ ] Add idempotency check before every on-chain trigger
- [ ] Add a `MOCK_CHAIN` fallback flag for demo-night safety
- [ ] Record the 1-minute screen capture with Snowtrace visible

---

*This guide assumes the team structure and MVP flow from your hackathon planning doc (Developer 1: blockchain, Developer 2: backend/gamification, Developer 3: frontend, Developer 4: integration/QA) and the Problem 03 (Logistics & Last-Mile Delivery) signature principle of Feedback from the MiniHack Game Jam problem set.*
