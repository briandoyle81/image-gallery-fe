'use client';

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import {
  base,
  flowMainnet,
  // bsc,
  arbitrum,
  avalanche,
  polygon,
} from 'viem/chains';
import {
  // coinbaseWallet,
  metaMaskWallet,
  walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
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
      wallets: [metaMaskWallet, walletConnectWallet],
    },
  ],
  {
    appName: 'Onchain Image Gallery',
    projectId: projectId,
  }
);

const wagmiConfig = createConfig({
  connectors,
  chains: [flowMainnet, base, arbitrum, avalanche, polygon],
  ssr: true,
  multiInjectedProviderDiscovery: false,
  transports: {
    // [flowMainnet.id]: http('https://mainnet-preview.evm.nodes.onflow.org'),
    // [flowMainnet.id]: http('https://mainnet.evm.nodes.onflow.org'),
    [flowMainnet.id]: http('https://white-bold-sound.flow-mainnet.quiknode.pro/ed505487257d3fad3671bcae7eb001dd6de5ea49'),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [avalanche.id]: http(),
    [polygon.id]: http(),
    // [bsc.id]: http(),
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider modalSize="compact">
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
