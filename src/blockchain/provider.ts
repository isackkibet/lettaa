import { ethers } from 'ethers';

const RPC_URL = process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const HUB_ADDRESS = process.env.HUB_CONTRACT_ADDRESS || '';
const TOKEN_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS || '';

if (!PRIVATE_KEY && process.env.MOCK_CHAIN !== 'true') {
  console.warn('[Blockchain] PRIVATE_KEY not set. Real transactions will fail.');
}

export const provider = new ethers.JsonRpcProvider(RPC_URL);

export const getOperatorWallet = (): ethers.Wallet => {
  if (!PRIVATE_KEY) {
    throw new Error('PRIVATE_KEY not configured');
  }
  return new ethers.Wallet(PRIVATE_KEY, provider);
};

const HUB_ABI = [
  'function distributeReward(address rider, uint256 amount, string reason) external',
  'event RewardDistributed(address indexed rider, uint256 amount, string reason, uint256 timestamp)',
  'function operator() view returns (address)'
] as const;

const TOKEN_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
] as const;

export const getHubContract = (wallet?: ethers.Wallet): ethers.Contract => {
  const signer = wallet || getOperatorWallet();
  return new ethers.Contract(HUB_ADDRESS, HUB_ABI, signer);
};

export const getTokenContract = (wallet?: ethers.Wallet): ethers.Contract => {
  const signer = wallet || getOperatorWallet();
  return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
};

export const getReadOnlyTokenContract = (): ethers.Contract => {
  return new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, provider);
};

export const getReadOnlyHubContract = (): ethers.Contract => {
  return new ethers.Contract(HUB_ADDRESS, HUB_ABI, provider);
};