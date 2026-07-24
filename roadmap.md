# LETAA - Gamified Delivery Rider System on Avalanche
## End-to-End Implementation Roadmap & Blueprint

---

## 📋 Project Overview

**Project**: LETAA - Gamified Delivery Rider System on Avalanche  
**Hackathon**: MiniHack Game Jam - Problem 03 (Logistics & Last-Mile Delivery)  
**Signature Principle**: Feedback (Routledge's Feedback Loop)  
**Timeline**: 12-Hour Hackathon  
**Team**: 4 Developers (1 Blockchain, 1 Backend/Gamification, 1 Frontend, 1 Integration/QA)

---

## 🎯 Core Architecture

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────────┐
│  Frontend    │◄────►│  Backend (API)    │◄────►│  Database (Supabase) │
│  React+Vite  │      │  Node/Express     │      │  Riders, XP, Levels   │
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

**Key Architectural Decision**: XP stays OFF-CHAIN (fast, cheap, mutable). Only MILESTONE PROOFS go on-chain (immutable achievement badges, token rewards).

---

## 🗓️ Phase-by-Phase Roadmap

---

### 📦 PHASE 0: Foundation & Setup (Hours 0-1)

#### 0.1 Repository & Environment Setup
- [ ] Initialize monorepo structure (`/contracts`, `/backend`, `/frontend`)
- [ ] Set up `.gitignore` with `.env` protection
- [ ] Create `.env.example` with all required variables
- [ ] Set up shared TypeScript config and linting
- [ ] Configure GitHub Actions for CI (lint, test, build)

#### 0.2 Avalanche Fuji Testnet Setup
- [ ] Generate fresh deployer wallet (NEVER reuse personal wallet)
- [ ] Fund deployer wallet with Fuji testnet AVAX from faucet
- [ ] Verify RPC URL: `https://api.avax-test.network/ext/bc/C/rpc`
- [ ] Verify Chain ID: `43113` (0xA869)
- [ ] Add to `.env`: `AVALANCHE_RPC_URL`, `PRIVATE_KEY`, `CHAIN_ID=43113`

#### 0.3 Database Schema (Supabase)
```sql
-- Run in Supabase SQL Editor
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

create index idx_reward_tx_rider on reward_transactions(rider_id);
create index idx_reward_tx_status on reward_transactions(status);
create unique index idx_reward_tx_idempotent on reward_transactions(rider_id, reason) 
  where status in ('pending', 'confirmed');
```

---

### ⛓️ PHASE 1: Smart Contracts (Hours 1-3) — **Blockchain Dev**

#### 1.1 Project Structure
```
/contracts
├── hardhat.config.js
├── package.json
├── contracts/
│   ├── RiderXPToken.sol
│   └── RiderRewardHub.sol
├── scripts/
│   ├── deploy.js
│   ├── verify.js
│   └── test-reward.js
├── test/
│   └── RiderRewardHub.test.js
└── .env
```

#### 1.2 Smart Contracts

**RiderXPToken.sol** — ERC20 Reward Token
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

    // Override decimals to 0 for whole-number XP display (1 token = 1 XP)
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    // Only owner (RewardHub) can mint rewards
    function mintReward(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
```

**RiderRewardHub.sol** — Reward Distribution Hub
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

    function distributeReward(
        address rider,
        uint256 amount,
        string calldata reason
    ) external onlyOperator {
        token.mintReward(rider, amount);
        emit RewardDistributed(rider, amount, reason);
    }

    // Emergency: update operator if key compromised
    function setOperator(address newOperator) external onlyOperator {
        operator = newOperator;
    }
}
```

#### 1.3 Deployment Script
```javascript
// scripts/deploy.js
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. Deploy Token
  const Token = await ethers.getContractFactory("RiderXPToken");
  const token = await Token.deploy(deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("RiderXPToken deployed to:", tokenAddress);

  // 2. Deploy Hub
  const Hub = await ethers.getContractFactory("RiderRewardHub");
  const hub = await Hub.deploy(tokenAddress, deployer.address);
  await hub.waitForDeployment();
  const hubAddress = await hub.getAddress();
  console.log("RiderRewardHub deployed to:", hubAddress);

  // 3. CRITICAL: Transfer token ownership to Hub
  const tx = await token.transferOwnership(hubAddress);
  await tx.wait();
  console.log("Token ownership transferred to Hub");

  // 4. Save addresses
  const fs = require("fs");
  const addresses = {
    token: tokenAddress,
    hub: hubAddress,
    deployer: deployer.address,
    chainId: 43113,
    network: "fuji",
    deployedAt: new Date().toISOString()
  };
  fs.writeFileSync("./deployed-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("Addresses saved to deployed-addresses.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

#### 1.4 Verification Script
```javascript
// scripts/verify.js
async function main() {
  const addresses = require("../deployed-addresses.json");
  
  await hre.run("verify:verify", {
    address: addresses.token,
    constructorArguments: [addresses.deployer],
  });
  
  await hre.run("verify:verify", {
    address: addresses.hub,
    constructorArguments: [addresses.token, addresses.deployer],
  });
}
```

#### 1.5 Testing Checklist
- [ ] Deploy to Fuji testnet
- [ ] Verify both contracts on Snowtrace
- [ ] Test `distributeReward` with test rider address
- [ ] Verify event emission on Snowtrace
- [ ] Save deployed addresses to backend `.env`

---

### ⚙️ PHASE 2: Backend Integration (Hours 2-5) — **Backend Dev**

#### 2.1 Project Structure
```
/backend
├── src/
│   ├── blockchain/
│   │   ├── reward.service.ts
│   │   ├── provider.ts
│   │   ├── contracts/
│   │   │   ├── RiderRewardHub.abi.json
│   │   │   └── RiderXPToken.abi.json
│   │   └── mock-reward.service.ts
│   ├── services/
│   │   ├── game.service.ts (existing - extend)
│   │   ├── xp.service.ts (existing)
│   │   ├── level.service.ts (existing)
│   │   ├── mission.service.ts (existing)
│   │   └── achievement.service.ts (existing)
│   ├── routes/
│   │   ├── game.routes.ts (existing)
│   │   └── rider.routes.ts (new - wallet connect)
│   ├── middleware/
│   │   └── idempotency.middleware.ts
│   └── database/
│       └── supabase.client.ts
├── package.json
└── .env
```

#### 2.2 Blockchain Provider (`blockchain/provider.ts`)
```typescript
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

export const provider = new ethers.JsonRpcProvider(process.env.AVALANCHE_RPC_URL);

export const getOperatorWallet = () => {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY not set in environment");
  }
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
};

export const getHubContract = (wallet = getOperatorWallet()) => {
  const abi = [
    "function distributeReward(address rider, uint256 amount, string reason) external",
    "event RewardDistributed(address indexed rider, uint256 amount, string reason)"
  ];
  return new ethers.Contract(process.env.HUB_CONTRACT_ADDRESS!, abi, wallet);
};

export const getTokenContract = (wallet = getOperatorWallet()) => {
  const abi = [
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function symbol() view returns (string)"
  ];
  return new ethers.Contract(process.env.TOKEN_CONTRACT_ADDRESS!, abi, wallet);
};
```

#### 2.3 Reward Service with Idempotency & Retry (`blockchain/reward.service.ts`)
```typescript
import { getHubContract, getTokenContract } from "./provider";
import { supabase } from "../database/supabase.client";
import { ethers } from "ethers";

interface RewardResult {
  success: boolean;
  txHash?: string;
  status?: number;
  error?: string;
  mocked?: boolean;
}

const MOCK_CHAIN = process.env.MOCK_CHAIN === "true";

export async function distributeReward(
  riderId: string,
  walletAddress: string,
  amount: number,
  reason: string
): Promise<RewardResult> {
  // 1. IDEMPOTENCY CHECK - prevent duplicate rewards
  const { data: existing } = await supabase
    .from("reward_transactions")
    .select("id, tx_hash, status")
    .eq("rider_id", riderId)
    .eq("reason", reason)
    .in("status", ["pending", "confirmed"])
    .maybeSingle();

  if (existing) {
    console.log(`[RewardService] Duplicate reward prevented for ${riderId}: ${reason}`);
    return { 
      success: true, 
      txHash: existing.tx_hash || undefined,
      status: existing.status === "confirmed" ? 1 : 0,
      mocked: false
    };
  }

  // 2. Create pending transaction record
  const { data: txRecord, error: insertError } = await supabase
    .from("reward_transactions")
    .insert({
      rider_id: riderId,
      amount,
      reason,
      status: "pending"
    })
    .select()
    .single();

  if (insertError) {
    console.error("[RewardService] Failed to create transaction record:", insertError);
    return { success: false, error: "Database error" };
  }

  // 3. MOCK CHAIN MODE - for demo safety
  if (MOCK_CHAIN) {
    const mockTxHash = `0x${"0".repeat(60)}${Date.now().toString(16).padStart(4, "0")}`;
    await supabase
      .from("reward_transactions")
      .update({ tx_hash: mockTxHash, status: "confirmed" })
      .eq("id", txRecord.id);
    
    console.log(`[MOCK_CHAIN] Reward simulated: ${amount} RXP to ${walletAddress} for ${reason}`);
    return { success: true, txHash: mockTxHash, status: 1, mocked: true };
  }

  // 4. REAL CHAIN CALL
  try {
    const hub = getHubContract();
    const tx = await hub.distributeReward(walletAddress, amount, reason);
    console.log(`[RewardService] Transaction sent: ${tx.hash}`);
    
    // Update to pending with tx hash
    await supabase
      .from("reward_transactions")
      .update({ tx_hash: tx.hash, status: "pending" })
      .eq("id", txRecord.id);

    // Wait for confirmation
    const receipt = await tx.wait();
    
    await supabase
      .from("reward_transactions")
      .update({ status: receipt.status === 1 ? "confirmed" : "failed" })
      .eq("id", txRecord.id);

    return { 
      success: receipt.status === 1, 
      txHash: receipt.hash, 
      status: receipt.status 
    };
  } catch (error: any) {
    console.error("[RewardService] Chain error:", error);
    
    await supabase
      .from("reward_transactions")
      .update({ status: "pending_retry" })
      .eq("id", txRecord.id);

    return { success: false, error: error.message };
  }
}

export async function getTokenBalance(walletAddress: string): Promise<number> {
  if (MOCK_CHAIN) return 0;
  
  try {
    const token = getTokenContract();
    const balance = await token.balanceOf(walletAddress);
    const decimals = await token.decimals();
    return Number(ethers.formatUnits(balance, decimals));
  } catch (error) {
    console.error("[RewardService] Balance check failed:", error);
    return 0;
  }
}

export async function retryFailedRewards(): Promise<number> {
  const { data: failed } = await supabase
    .from("reward_transactions")
    .select("*")
    .eq("status", "pending_retry")
    .limit(10);

  if (!failed?.length) return 0;

  let retried = 0;
  for (const tx of failed) {
    const { data: rider } = await supabase
      .from("riders")
      .select("wallet_address")
      .eq("id", tx.rider_id)
      .single();

    if (rider?.wallet_address) {
      const result = await distributeReward(
        tx.rider_id,
        rider.wallet_address,
        Number(tx.amount),
        tx.reason
      );
      if (result.success) retried++;
    }
  }
  return retried;
}
```

#### 2.4 Wallet Connection Endpoint (`routes/rider.routes.ts`)
```typescript
import { Router, Request, Response } from "express";
import { supabase } from "../database/supabase.client";

const router = Router();

// POST /api/riders/wallet - Connect wallet
router.post("/wallet", async (req: Request, res: Response) => {
  const { riderId, address } = req.body;
  
  if (!riderId || !address) {
    return res.status(400).json({ error: "riderId and address required" });
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: "Invalid Ethereum address" });
  }

  const { data, error } = await supabase
    .from("riders")
    .update({ wallet_address: address.toLowerCase() })
    .eq("id", riderId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ rider: data });
});

// GET /api/riders/:id/rewards - Get reward history
router.get("/:id/rewards", async (req: Request, res: Response) => {
  const { data, error } = await supabase
    .from("reward_transactions")
    .select("*")
    .eq("rider_id", req.params.id)
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ rewards: data });
});

export default router;
```

#### 2.5 Integrate with Game Service (`services/game.service.ts`)
```typescript
// In processDeliveryEvent or levelUp handler
import { distributeReward } from "../blockchain/reward.service";

// After detecting level up:
if (levelUp) {
  const { data: rider } = await supabase
    .from("riders")
    .select("wallet_address")
    .eq("id", riderId)
    .single();

  if (rider?.wallet_address) {
    // Reward: 100 RXP per level
    const rewardAmount = newLevel * 100;
    const result = await distributeReward(
      riderId,
      rider.wallet_address,
      rewardAmount,
      `level_up_${newLevel}`
    );
    
    if (result.success) {
      console.log(`Level up reward sent: ${result.txHash}`);
    } else if (!result.mocked) {
      console.error("Reward failed, will retry:", result.error);
    }
  }
}

// After mission completion:
if (missionCompleted) {
  const { data: rider } = await supabase
    .from("riders")
    .select("wallet_address")
    .eq("id", riderId)
    .single();

  if (rider?.wallet_address) {
    await distributeReward(
      riderId,
      rider.wallet_address,
      mission.rewardXP,
      `mission_${mission.id}`
    );
  }
}
```

---

### 🎨 PHASE 3: Frontend Integration (Hours 4-7) — **Frontend Dev**

#### 3.1 Wallet Connection Hook (`hooks/useWallet.ts`)
```typescript
import { useState, useCallback } from "react";
import { ethers } from "ethers";

const FUJI_CHAIN_ID = "0xA869"; // 43113 in hex

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("No wallet found — install MetaMask or Core");
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send("eth_requestAccounts", []);
      const addr = accounts[0];
      setAddress(addr);

      // Switch to Fuji
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: FUJI_CHAIN_ID }],
        });
      } catch (err: any) {
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: FUJI_CHAIN_ID,
              chainName: "Avalanche Fuji Testnet",
              nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
              rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
              blockExplorerUrls: ["https://testnet.snowtrace.io"],
            }],
          });
        }
      }

      const network = await provider.getNetwork();
      setChainId(network.chainId.toString());

      // Send to backend
      await fetch("/api/riders/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ riderId: getCurrentRiderId(), address: addr }),
      });

      return addr;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return { address, chainId, isConnecting, connect, isConnected: !!address };
}
```

#### 3.2 Reward Balance Display (`components/RewardBalance.tsx`)
```typescript
import { useEffect, useState } from "react";
import { ethers } from "ethers";

const TOKEN_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)"
];

export function RewardBalance({ address }: { address: string }) {
  const [balance, setBalance] = useState<string>("—");
  const [symbol, setSymbol] = useState("RXP");

  useEffect(() => {
    if (!address || !window.ethereum) return;
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const contract = new ethers.Contract(
      import.meta.env.VITE_TOKEN_ADDRESS,
      TOKEN_ABI,
      provider
    );

    const fetchBalance = async () => {
      try {
        const [bal, dec, sym] = await Promise.all([
          contract.balanceOf(address),
          contract.decimals(),
          contract.symbol()
        ]);
        setSymbol(sym);
        setBalance(ethers.formatUnits(bal, dec));
      } catch (e) {
        console.error("Balance fetch failed:", e);
        setBalance("—");
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [address]);

  return (
    <div className="reward-balance">
      <span className="label">On-Chain Rewards:</span>
      <span className="value">{balance} {symbol}</span>
    </div>
  );
}
```

#### 3.3 Reward Transaction History (`components/RewardHistory.tsx`)
```typescript
import { useEffect, useState } from "react";

interface RewardTx {
  id: string;
  amount: number;
  reason: string;
  tx_hash: string | null;
  status: string;
  created_at: string;
}

export function RewardHistory({ riderId }: { riderId: string }) {
  const [rewards, setRewards] = useState<RewardTx[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/riders/${riderId}/rewards`)
      .then(r => r.json())
      .then(data => {
        setRewards(data.rewards || []);
        setLoading(false);
      });
  }, [riderId]);

  const getStatusColor = (status: string) => 
    status === "confirmed" ? "green" : status === "pending" ? "yellow" : "red";

  if (loading) return <div>Loading rewards...</div>;

  return (
    <div className="reward-history">
      <h3>Reward History</h3>
      {rewards.length === 0 ? (
        <p>No rewards yet — complete missions to earn RXP!</p>
      ) : (
        <table>
          <thead>
            <tr><th>Reason</th><th>Amount</th><th>Status</th><th>Tx Hash</th></tr>
          </thead>
          <tbody>
            {rewards.map(tx => (
              <tr key={tx.id}>
                <td>{tx.reason.replace(/_/g, " ")}</td>
                <td>{tx.amount} RXP</td>
                <td style={{color: getStatusColor(tx.status)}}>
                  {tx.status}
                </td>
                <td>
                  {tx.tx_hash ? (
                    <a href={`https://testnet.snowtrace.io/tx/${tx.tx_hash}`} 
                       target="_blank" rel="noopener">
                       View
                    </a>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

---

### 🔗 PHASE 4: Integration & Polish (Hours 7-10) — **Integration/QA Dev**

#### 4.1 End-to-End Flow Test
```
Rider Login → Connect Wallet → Complete Delivery → 
XP Calculated → Level Up Detected → 
Reward Distributed (on-chain) → 
UI Shows Confirmed Tx → Snowtrace Link Works
```

#### 4.2 Idempotency & Retry System
- [ ] Add cron job to retry failed rewards every 5 minutes
- [ ] Add admin dashboard to view pending/failed rewards
- [ ] Add manual "retry all" button for demo safety

#### 4.3 Contract Verification
```bash
# Run after deployment
npx hardhat verify --network fuji <TOKEN_ADDRESS> <DEPLOYER_ADDRESS>
npx hardhat verify --network fuji <HUB_ADDRESS> <TOKEN_ADDRESS> <DEPLOYER_ADDRESS>
```
- Verify both contracts show "Verified" on testnet.snowtrace.io
- Save verified URLs for judge submission

#### 4.4 Demo Safety Features
- [ ] `MOCK_CHAIN=true` in `.env` for risk-free demo
- [ ] Health check endpoint: `GET /health/chain` returns RPC connectivity
- [ ] Pre-fund operator wallet with 2+ AVAX before demo
- [ ] Record 1-minute screen capture with Snowtrace visible

---

### 📦 PHASE 5: Documentation & Submission (Hours 10-12)

#### 5.1 Required Deliverables
- [ ] **Contract Addresses** (verified on Snowtrace)
  - RiderXPToken: `0x...`
  - RiderRewardHub: `0x...`
- [ ] **Deployed Backend URL** (Railway/Render/Fly.io)
- [ ] **Deployed Frontend URL** (Vercel/Netlify)
- [ ] **GitHub Repo** (public, with `.env.example`)
- [ ] **1-minute screen recording** showing:
  1. Rider completes delivery
  2. Level up triggers
  3. Backend sends reward transaction
  4. Snowtrace shows confirmed transaction
  5. Frontend shows updated RXP balance

#### 5.2 Submission Checklist
- [ ] `.env` in `.gitignore` (verify: `git ls-files | grep .env` returns nothing)
- [ ] `.env.example` committed with all required keys
- [ ] README with setup instructions
- [ ] Contract addresses in README
- [ ] Video link in README
- [ ] Team info in README

---

## 🔑 Environment Variables Reference

### Backend (`.env`)
```bash
# Avalanche
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_operator_private_key_without_0x
CHAIN_ID=43113
TOKEN_CONTRACT_ADDRESS=0x...
HUB_CONTRACT_ADDRESS=0x...

# Demo safety
MOCK_CHAIN=false

# Database (Supabase)
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
VITE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
```

### Contracts (`.env`)
```bash
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=your_deployer_private_key_without_0x
CHAIN_ID=43113
```

---

## 🎯 Milestone Definitions (On-Chain Triggers)

| Milestone | Trigger | RXP Reward | Reason String |
|-----------|---------|------------|---------------|
| Level Up | `levelUp: true` in game response | `newLevel * 100` | `level_up_${newLevel}` |
| Daily Mission Complete | All daily missions done | `500` | `daily_mission_complete` |
| Weekly Mission Complete | All weekly missions done | `2000` | `weekly_mission_complete` |
| Achievement Unlock | New achievement unlocked | `achievement.rarity * 100` | `achievement_${id}` |
| Streak Milestone | 7/14/30 day streak | `streakDays * 50` | `streak_${streakDays}` |
| First Delivery | `deliveriesCompleted === 1` | `100` | `first_delivery` |
| 100 Deliveries | `deliveriesCompleted === 100` | `5000` | `century_deliveries` |

**Rule**: Only trigger on-chain reward when milestone is **first achieved** (idempotency key prevents duplicates).

---

## 🚨 Common Pitfalls & Solutions

| Pitfall | Prevention |
|---------|------------|
| Private key committed to git | `.env` in `.gitignore` BEFORE first commit; use `.env.example` |
| Operator wallet runs out of gas | Fund with 2+ AVAX; check balance before demo |
| Token ownership not transferred to Hub | Deployment script MUST call `transferOwnership(hubAddress)` |
| Duplicate rewards on retry | Unique index on `(rider_id, reason)` + idempotency check |
| Nonce errors from parallel workers | Single reward queue/process; `MOCK_CHAIN=true` for demo |
| Contract not verified on Snowtrace | Run verify script immediately after deploy |
| Frontend can't switch to Fuji | Add chain config to `wallet_addEthereumChain` call |
| Demo fails due to chain latency | `MOCK_CHAIN=true` fallback; show pre-recorded Snowtrace as backup |

---

## 📁 Final Project Structure

```
letaa/
├── contracts/                 # Hardhat project
│   ├── contracts/
│   │   ├── RiderXPToken.sol
│   │   └── RiderRewardHub.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   ├── verify.js
│   │   └── test-reward.js
│   ├── test/
│   │   └── RiderRewardHub.test.js
│   ├── hardhat.config.js
│   ├── package.json
│   └── .env
├── backend/                   # Express + TypeScript
│   ├── src/
│   │   ├── blockchain/
│   │   │   ├── provider.ts
│   │   │   ├── reward.service.ts
│   │   │   └── mock-reward.service.ts
│   │   ├── routes/
│   │   │   └── rider.routes.ts
│   │   ├── services/
│   │   │   └── game.service.ts (extended)
│   │   └── database/
│   │       └── supabase.client.ts
│   ├── package.json
│   └── .env
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── hooks/
│   │   │   └── useWallet.ts
│   │   ├── components/
│   │   │   ├── WalletConnect.tsx
│   │   │   ├── RewardBalance.tsx
│   │   │   └── RewardHistory.tsx
│   │   └── App.tsx
│   ├── package.json
│   └── .env
├── roadmap.md                 # THIS FILE
├── .gitignore
└── README.md
```

---

## 🏁 Definition of Done

- [ ] Contracts deployed & verified on Fuji
- [ ] Backend integrates reward distribution with idempotency
- [ ] Frontend connects wallet, shows balance & history
- [ ] End-to-end flow works: Delivery → Level Up → On-chain Reward
- [ ] `MOCK_CHAIN=true` works for safe demo
- [ ] All env vars documented in `.env.example`
- [ ] GitHub repo public with README
- [ ] 1-minute demo video recorded with Snowtrace visible
- [ ] Team can run project locally with `npm install && npm run dev` in each folder

---

*Roadmap Version: 1.0*  
*Created for LETAA Hackathon MVP*  
*Based on Avalanche Blockchain Integration Guide & Problem 03 Spec*