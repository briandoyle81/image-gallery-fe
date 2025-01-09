import '@rainbow-me/rainbowkit/styles.css';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Content from './components/Content';

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold">Personal Image Gallery</h1>
        <p className="text-lg text-center sm:text-left">
          A decentralized image gallery built on Flow blockchain.  All images saved directly onchain.
        </p>
        <p className="text-lg text-center sm:text-left">
          Free with gas sponsored by Flow with the Flow wallet.  Sub-cent to save an image with other wallets.
        </p>
        <ConnectButton />
        <Content />
      </main>
    </div>
  );
}
