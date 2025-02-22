'use client';

import { useAccount } from 'wagmi';
import LoginWithPrivy from './PrivyLogin';
export default function Header() {
  const { status } = useAccount();

  return (
    <header className="bg-white shadow-md p-4">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">FlowtoBooth Alpha</h1>
          <h4 className="text-sm">A fun benchmark, not a production app</h4>
        </div>
        {status !== 'reconnecting' && <LoginWithPrivy />}
      </div>
    </header>
  );
} 