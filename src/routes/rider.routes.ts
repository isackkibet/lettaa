import { Router, Request, Response } from 'express';
import { supabase } from '@/database/supabase.client';
import { getTokenBalance } from '@/blockchain/reward.service';

const router = Router();

router.post('/wallet', async (req: Request, res: Response): Promise<void> => {
  const { riderId, address } = req.body;

  if (!riderId || !address) {
    res.status(400).json({ error: 'riderId and address required' });
    return;
  }

  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    res.status(400).json({ error: 'Invalid Ethereum address format' });
    return;
  }

  const normalizedAddress = address.toLowerCase();

  const { data: existing } = await supabase
    .from('riders')
    .select('id')
    .eq('wallet_address', normalizedAddress)
    .neq('id', riderId)
    .maybeSingle();

  if (existing) {
    res.status(409).json({ error: 'Wallet address already linked to another rider' });
    return;
  }

  const { data, error } = await supabase
    .from('riders')
    .update({ wallet_address: normalizedAddress, updated_at: new Date().toISOString() })
    .eq('id', riderId)
    .select()
    .single();

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ rider: data });
});

router.get('/:id/rewards', async (req: Request, res: Response): Promise<void> => {
  const { data, error } = await supabase
    .from('reward_transactions')
    .select('*')
    .eq('rider_id', req.params.id)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json({ rewards: data });
});

router.get('/:id/balance', async (req: Request, res: Response): Promise<void> => {
  const { data: rider } = await supabase
    .from('riders')
    .select('wallet_address')
    .eq('id', req.params.id)
    .single();

  if (!rider?.wallet_address) {
    res.status(404).json({ error: 'Rider not found or wallet not connected' });
    return;
  }

  const balance = await getTokenBalance(rider.wallet_address);
  res.json({ address: rider.wallet_address, balance, symbol: 'RXP' });
});

export default router;