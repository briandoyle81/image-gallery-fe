'use client';

import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { Wallet, getWalletConnectConnector } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createConfig, WagmiProvider } from 'wagmi';
import {
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { flowMainnet } from 'viem/chains';
import { http } from 'wagmi';

const projectId = "51407fcf066d74968d9a1a4c6da0d994"; // Replace with your actual project ID

export interface MyWalletOptions {
  projectId: string;
}

const flowWallet = ({ projectId }: MyWalletOptions): Wallet => ({
  id: 'flow-wallet',
  name: 'Flow Wallet',
  iconUrl: 'https://lilico.app/logo_mobile.png',
  iconBackground: '#41CC5D',
  downloadUrls: {
    android: 'https://play.google.com/store/apps/details?id=com.flowfoundation.wallet',
    ios: 'https://apps.apple.com/ca/app/flow-wallet-nfts-and-crypto/id6478996750',
    chrome: 'https://chromewebstore.google.com/detail/flow-wallet/hpclkefagolihohboafpheddmmgdffjm',
    qrCode: 'https://link.lilico.app',
  },
  mobile: {
    getUri: (uri: string) => uri,
  },
  qrCode: {
    getUri: (uri: string) => uri,
    instructions: {
      learnMoreUrl: 'https://wallet.flow.com',
      steps: [
        {
          description: 'We recommend putting Flow Wallet on your home screen for faster access to your wallet.',
          step: 'install',
          title: 'Open the Flow Wallet app',
        },
        {
          description: 'You can find the scan button on home page, a connection prompt will appear for you to connect your wallet.',
          step: 'scan',
          title: 'Tap the scan button',
        },
      ],
    },
  },
  extension: {
    instructions: {
      learnMoreUrl: 'https://wallet.flow.com',
      steps: [
        {
          description:
            'We recommend pinning Flow Wallet to your taskbar for quicker access to your wallet.',
          step: 'install',
          title: 'Install the Flow Wallet extension',
        },
        {
          description:
            'Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.',
          step: 'create',
          title: 'Create or Import a Wallet',
        },
        {
          description:
            'Once you set up your wallet, click below to refresh the browser and load up the extension.',
          step: 'refresh',
          title: 'Refresh your browser',
        },
      ],
    },
  },
  createConnector: getWalletConnectConnector({ projectId }),
});

const connectors = connectorsForWallets(
  [
    {
      groupName: 'Recommended',
      wallets: [flowWallet],
    },
  ],
  {
    appName: 'Onchain Image Gallery',
    projectId: projectId,
  }
);

const wagmiConfig = createConfig({
  connectors,
  chains: [flowMainnet],
  ssr: true,
  transports: {
    [flowMainnet.id]: http(),
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