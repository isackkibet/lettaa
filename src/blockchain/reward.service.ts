import { ethers } from 'ethers';
import { supabase } from '../database/supabase.client';
import { getHubContract, getReadOnlyTokenContract } from './provider';

const MOCK_CHAIN = process.env.MOCK_CHAIN === 'true';

export interface RewardResult {
  success: boolean;
  txHash?: string;
  status?: number;
  error?: string;
  mocked?: boolean;
}

export async function distributeReward(
  riderId: string,
  walletAddress: string,
  amount: number,
  reason: string
): Promise<RewardResult> {
  if (!walletAddress || !ethers.isAddress(walletAddress)) {
    return { success: false, error: 'Invalid wallet address' };
  }
  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' };
  }

  const normalizedReason = reason.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  const { data: existing, error: checkError } = await supabase
    .from('reward_transactions')
    .select('id, tx_hash, status')
    .eq('rider_id', riderId)
    .eq('reason', normalizedReason)
    .in('status', ['pending', 'confirmed'])
    .maybeSingle();

  if (checkError) {
    console.error('[RewardService] Idempotency check failed:', checkError);
    return { success: false, error: 'Database error' };
  }

  if (existing) {
    console.log(`[RewardService] Duplicate reward prevented for ${riderId}: ${normalizedReason}`);
    return {
      success: true,
      txHash: existing.tx_hash || undefined,
      status: existing.status === 'confirmed' ? 1 : 0,
      mocked: false
    };
  }

  const { data: txRecord, error: insertError } = await supabase
    .from('reward_transactions')
    .insert({
      rider_id: riderId,
      amount,
      reason: normalizedReason,
      status: 'pending'
    })
    .select()
    .single();

  if (insertError || !txRecord) {
    console.error('[RewardService] Failed to create transaction record:', insertError);
    return { success: false, error: 'Failed to create transaction record' };
  }

  if (MOCK_CHAIN) {
    const mockTxHash = `0x${'0'.repeat(58)}${Date.now().toString(16).padStart(6, '0')}`;
    await supabase
      .from('reward_transactions')
      .update({ tx_hash: mockTxHash, status: 'confirmed' })
      .eq('id', txRecord.id);

    console.log(`[MOCK_CHAIN] Reward simulated: ${amount} RXP to ${walletAddress} for ${normalizedReason}`);
    return { success: true, txHash: mockTxHash, status: 1, mocked: true };
  }

  try {
    const hub = getHubContract();
    const tx = await hub.distributeReward(walletAddress, amount, normalizedReason);
    console.log(`[RewardService] Transaction sent: ${tx.hash}`);

    await supabase
      .from('reward_transactions')
      .update({ tx_hash: tx.hash, status: 'pending' })
      .eq('id', txRecord.id);

    const receipt = await tx.wait();
    const finalStatus = receipt.status === 1 ? 'confirmed' : 'failed';

    await supabase
      .from('reward_transactions')
      .update({ status: finalStatus })
      .eq('id', txRecord.id);

    return {
      success: receipt.status === 1,
      txHash: receipt.hash,
      status: receipt.status
    };
  } catch (error: any) {
    console.error('[RewardService] Chain error:', error);

    await supabase
      .from('reward_transactions')
      .update({ status: 'pending_retry' })
      .eq('id', txRecord.id);

    return { success: false, error: error.message };
  }
}

export async function getTokenBalance(walletAddress: string): Promise<number> {
  if (MOCK_CHAIN) return 0;

  try {
    const token = getReadOnlyTokenContract();
    const [balance, decimals] = await Promise.all([
      token.balanceOf(walletAddress),
      token.decimals()
    ]);
    return Number(ethers.formatUnits(balance, decimals));
  } catch (error) {
    console.error('[RewardService] Balance check failed:', error);
    return 0;
  }
}

export async function getRewardHistory(riderId: string) {
  const { data, error } = await supabase
    .from('reward_transactions')
    .select('*')
    .eq('rider_id', riderId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[RewardService] Failed to fetch reward history:', error);
    return [];
  }
  return data || [];
}

export async function retryFailedRewards(limit = 10): Promise<number> {
  const { data: failed, error } = await supabase
    .from('reward_transactions')
    .select('*')
    .eq('status', 'pending_retry')
    .limit(limit);

  if (error || !failed?.length) return 0;

  let retried = 0;
  for (const tx of failed) {
    const { data: rider } = await supabase
      .from('riders')
      .select('wallet_address')
      .eq('id', tx.rider_id)
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

export const REWARD_REASONS = {
  LEVEL_UP: (level: number) => `level_up_${level}`,
  ACHIEVEMENT: (achievementId: string) => `achievement_${achievementId}`,
  DAILY_MISSION: () => 'daily_mission_complete',
  WEEKLY_MISSION: () => 'weekly_mission_complete',
  STREAK: (days: number) => `streak_${days}`,
  FIRST_DELIVERY: () => 'first_delivery',
  CENTURY_DELIVERIES: () => 'century_deliveries',
  REPUTATION_TIER: (tier: string) => `reputation_${tier}`
} as const;

export function calculateLevelUpReward(newLevel: number): number {
  return newLevel * 100;
}

export function calculateStreakReward(streakDays: number): number {
  if (streakDays >= 30) return 500;
  if (streakDays >= 14) return 200;
  if (streakDays >= 7) return 100;
  return 0;
}