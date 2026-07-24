import { useState, useCallback, useEffect } from 'react';
import { ethers, BrowserProvider } from 'ethers';

const FUJI_CHAIN_ID = '0xA869'; // 43113 in hex
const FUJI_CHAIN_CONFIG = {
  chainId: FUJI_CHAIN_ID,
  chainName: 'Avalanche Fuji Testnet',
  nativeCurrency: { name: 'AVAX', symbol: 'AVAX', decimals: 18 },
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  blockExplorerUrls: ['https://testnet.snowtrace.io']
};

export interface WalletState {
  address: string | null;
  chainId: string | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;
}

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    chainId: null,
    isConnecting: false,
    isConnected: false,
    error: null
  });

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        const network = await provider.getNetwork();
        setState(prev => ({
          ...prev,
          address: accounts[0].address,
          chainId: network.chainId.toString(),
          isConnected: true
        }));
      }
    } catch (error) {
      console.error('[useWallet] Connection check failed:', error);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkConnection);
      window.ethereum.on('chainChanged', checkConnection);

      return () => {
        window.ethereum.removeListener('accountsChanged', checkConnection);
        window.ethereum.removeListener('chainChanged', checkConnection);
      };
    }
  }, [checkConnection]);

  const connect = useCallback(async (riderId?: string): Promise<string | null> => {
    if (!window.ethereum) {
      setState(prev => ({ ...prev, error: 'No wallet found. Install MetaMask or Core Wallet.' }));
      return null;
    }

    setState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      const network = await provider.getNetwork();

      setState(prev => ({
        ...prev,
        address,
        chainId: network.chainId.toString(),
        isConnecting: false,
        isConnected: true,
        error: null
      }));

      if (network.chainId !== 43113n) {
        await switchToFuji(provider);
      }

      if (riderId) {
        await sendWalletToBackend(riderId, address);
      }

      return address;
    } catch (error: any) {
      const message = error.code === 4001 ? 'Connection rejected' : error.message;
      setState(prev => ({ ...prev, isConnecting: false, error: message }));
      return null;
    }
  }, []);

  const switchToFuji = useCallback(async (provider: BrowserProvider) => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: FUJI_CHAIN_ID }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [FUJI_CHAIN_CONFIG]
        });
      } else {
        throw error;
      }
    }

    const network = await provider.getNetwork();
    setState(prev => ({ ...prev, chainId: network.chainId.toString() }));
  }, []);

  const sendWalletToBackend = useCallback(async (riderId: string, address: string) => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || '/api'}/riders/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ riderId, address: address.toLowerCase() })
      });
    } catch (error) {
      console.error('[useWallet] Failed to send wallet to backend:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      chainId: null,
      isConnecting: false,
      isConnected: false,
      error: null
    });
  }, []);

  const isOnFuji = state.chainId === '43113' || state.chainId === '0xA869';

  return {
    ...state,
    connect,
    disconnect,
    isOnFuji,
    checkConnection
  };
}

declare global {
  interface Window {
    ethereum?: any;
  }
}