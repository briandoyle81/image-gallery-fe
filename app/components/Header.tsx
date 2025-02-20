'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

export default function Header() {
  const { status } = useAccount();

  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">FlowtoBooth</h1>
          <h4 className="text-sm">A fun benchmark, not a production app</h4>
        </div>
        {status !== 'reconnecting' && <ConnectButton />}
      </div>
    </header>
  );
} 