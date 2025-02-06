'use client';

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider, webSocket } from 'wagmi';
import {
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { base, flowMainnet } from 'viem/chains';
import { coinbaseWallet, metaMaskWallet, walletConnectWallet } from '@rainbow-me/rainbowkit/wallets';
import { flowWallet } from './flowWallet';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID as string;

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [flowWallet],
    },
    {
      groupName: 'Other',
      wallets: [metaMaskWallet, coinbaseWallet, walletConnectWallet],
    }
  ],
  {
    appName: 'Onchain Image Gallery',
    projectId: projectId,
  }
);

const wagmiConfig = createConfig({
  connectors,
  chains: [flowMainnet, base],
  ssr: true,
  transports: {
    [flowMainnet.id]: http('https://mainnet-preview.evm.nodes.onflow.org'),
    [base.id]: http(),
  }
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}