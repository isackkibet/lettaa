import { useEffect, useState } from 'react';
import { BrowserProvider, Contract } from 'ethers';

const TOKEN_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)'
];

interface RewardBalanceProps {
  address: string;
  tokenAddress?: string;
}

export function RewardBalance({ address, tokenAddress }: RewardBalanceProps) {
  const [balance, setBalance] = useState<string>('—');
  const [symbol, setSymbol] = useState<string>('RXP');
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!address || !window.ethereum) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const contract = new Contract(
        tokenAddress || import.meta.env.VITE_TOKEN_ADDRESS,
        TOKEN_ABI,
        provider
      );

      const [bal, dec, sym] = await Promise.all([
        contract.balanceOf(address),
        contract.decimals(),
        contract.symbol()
      ]);

      setSymbol(sym);
      setBalance(ethers.formatUnits(bal, dec));
    } catch (error) {
      console.error('[RewardBalance] Fetch failed:', error);
      setBalance('—');
    } finally {
      setLoading(false);
    }
  }, [address, tokenAddress]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  if (loading) return <div className="reward-balance">Loading rewards...</div>;

  return (
    <div className="reward-balance">
      <span className="label">On-Chain Rewards:</span>
      <span className="value">{balance} {symbol}</span>
    </div>
  );
}