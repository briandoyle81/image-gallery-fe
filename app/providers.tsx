'use client';

import {
  DynamicContextProvider,
} from "@dynamic-labs/sdk-react-core";
import { FlowWalletConnectors } from "@dynamic-labs/flow";
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, http, WagmiProvider } from 'wagmi';
import {
  // base,
  flowMainnet,
  // bsc,
  // arbitrum,
  // avalanche,
  // polygon,
} from 'viem/chains';


const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_ID as string;

const wagmiConfig = createConfig({
  // chains: [flowMainnet, base, arbitrum, avalanche, polygon, bsc],
  chains: [flowMainnet],
  ssr: true,
  multiInjectedProviderDiscovery: false,
  transports: {
    // [flowMainnet.id]: http('https://mainnet-preview.evm.nodes.onflow.org'),
    // [flowMainnet.id]: http('https://mainnet.evm.nodes.onflow.org'),
    [flowMainnet.id]: http('https://white-bold-sound.flow-mainnet.quiknode.pro/ed505487257d3fad3671bcae7eb001dd6de5ea49'),
    // [base.id]: http(),
    // [arbitrum.id]: http(),
    // [avalanche.id]: http(),
    // [polygon.id]: http(),
    // [bsc.id]: http(),
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  return (
    <DynamicContextProvider
      settings={{
        environmentId: "2f3d8eac-f390-4188-ae5f-0d6fe95659c0",
        walletConnectors: [FlowWalletConnectors],
      }}
    >
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            {children}
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
