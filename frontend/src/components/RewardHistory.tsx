import { useEffect, useState } from 'react';

interface RewardTx {
  id: string;
  amount: number;
  reason: string;
  tx_hash: string | null;
  status: string;
  created_at: string;
}

interface RewardHistoryProps {
  riderId: string;
  apiUrl?: string;
}

export function RewardHistory({ riderId, apiUrl }: RewardHistoryProps) {
  const [rewards, setRewards] = useState<RewardTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl || import.meta.env.VITE_API_URL || '/api'}/riders/${riderId}/rewards`);
        const data = await res.json();
        if (data.rewards) setRewards(data.rewards);
      } catch (err) {
        setError('Failed to load rewards');
      } finally {
        setLoading(false);
      }
    };

    fetchRewards();
  }, [riderId, apiUrl]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return { color: '#22c55e', background: '#dcfce7' };
      case 'pending': return { color: '#f59e0b', background: '#fef3c7' };
      case 'pending_retry': return { color: '#ef4444', background: '#fee2e2' };
      default: return { color: '#6b7280', background: '#f3f4f6' };
    }
  };

  if (loading) return <div className="reward-history">Loading rewards...</div>;
  if (error) return <div className="reward-history error">{error}</div>;

  return (
    <div className="reward-history">
      <h3>Reward History</h3>
      {rewards.length === 0 ? (
        <p className="empty">No rewards yet — complete missions to earn RXP!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Reason</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Transaction</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.reason.replace(/_/g, ' ')}</td>
                <td>{tx.amount} RXP</td>
                <td>
                  <span
                    style={{
                      ...getStatusStyle(tx.status),
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      textTransform: 'capitalize'
                    }}
                  >
                    {tx.status}
                  </span>
                </td>
                <td>
                  {tx.tx_hash ? (
                    <a
                      href={`https://testnet.snowtrace.io/tx/${tx.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                      View on Snowtrace
                    </a>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}