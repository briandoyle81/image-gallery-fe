'use client';

import { DynamicWidget, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { useAccount } from 'wagmi';
import { useEffect } from 'react';

export default function Header() {
  const { primaryWallet, user } = useDynamicContext();
  const { status } = useAccount();

  useEffect(() => {
    console.log('Dynamic Auth:', !!user);
    console.log('Dynamic Wallet:', primaryWallet?.address);
    console.log('Wagmi Status:', status);
  }, [primaryWallet, user, status]);

  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">FlowtoBooth</h1>
          <h4 className="text-sm">A fun benchmark, not a production app</h4>
        </div>
        <DynamicWidget />
      </div>
    </header>
  );
} 