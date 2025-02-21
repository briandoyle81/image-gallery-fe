'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'wagmi';
import {PrivyProvider, PrivyClientConfig} from '@privy-io/react-auth';
// Make sure to import these from `@privy-io/wagmi`, not `wagmi`
import {WagmiProvider, createConfig} from '@privy-io/wagmi';
import { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';

import {
  // base,
  flowMainnet,
  // bsc,
  // arbitrum,
  // avalanche,
  // polygon,
} from 'viem/chains';

const privyConfig: PrivyClientConfig = {
  embeddedWallets: {
    createOnLogin: 'users-without-wallets',
    requireUserPasswordOnCreate: false,
    showWalletUIs: true,
  },
  // loginMethods: ['wallet', 'sms'],
  loginMethods: ['email', 'sms'],
  appearance: {
    showWalletLoginFirst: false,
    theme: 'light',
    accentColor: '#676FFF',
    logo: 'https://cryptologos.cc/logos/flow-flow-logo.png', // Replace with your logo
    walletChainType: 'ethereum-only'
  },
  defaultChain: flowMainnet,
  supportedChains: [flowMainnet],
};

const wagmiConfig = createConfig({
  // chains: [flowMainnet, base, arbitrum, avalanche, polygon, bsc],
  chains: [flowMainnet],
  ssr: true,
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
    <StyleSheetManager shouldForwardProp={isPropValid}>
      <PrivyProvider appId={"cm7evbru70128dckxaxaqn62w"} config={privyConfig}>
        <QueryClientProvider client={queryClient}>
          <WagmiProvider config={wagmiConfig}>
            {children}
          </WagmiProvider>
        </QueryClientProvider>
      </PrivyProvider>
    </StyleSheetManager>
  );
}
