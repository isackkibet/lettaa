import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';

interface WalletConnectProps {
  riderId: string;
  onConnected?: (address: string) => void;
}

export function WalletConnect({ riderId, onConnected }: WalletConnectProps) {
  const { address, isConnecting, isConnected, connect, isOnFuji } = useWallet();
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);

  const handleConnect = async () => {
    const addr = await connect(riderId);
    if (addr) onConnected?.(addr);
  };

  if (isConnected) {
    return (
      <div className="wallet-connected">
        <div className="wallet-info">
          <span className="wallet-icon">🦊</span>
          <span className="wallet-address">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          {!isOnFuji && (
            <span className="wrong-network">⚠️ Switch to Avalanche Fuji</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <button
        className="connect-btn"
        onClick={handleConnect}
        disabled={isConnecting}
        style={{
          padding: '12px 24px',
          background: '#e84142',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 600,
          cursor: isConnecting ? 'not-allowed' : 'pointer',
          opacity: isConnecting ? 0.7 : 1,
          transition: 'opacity 0.2s'
        }}
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      <p className="connect-hint">
        Connect your MetaMask or Core Wallet to receive on-chain rewards
      </p>
    </div>
  );
}