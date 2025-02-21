'use client';

import { useAccount } from 'wagmi';
import LoginWithPrivy from './PrivyLogin';
import { useState, useEffect } from 'react';

export default function Header() {
  const { status } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="bg-white shadow-md p-4">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">FlowtoBooth</h1>
            <h4 className="text-sm">A fun benchmark, not a production app</h4>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">FlowtoBooth</h1>
          <h4 className="text-sm">A fun benchmark, not a production app</h4>
        </div>
        {status !== 'reconnecting' && <LoginWithPrivy />}
      </div>
    </header>
  );
} 