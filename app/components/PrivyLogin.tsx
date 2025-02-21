'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useBalance } from 'wagmi';
import { formatEther } from 'viem';

export default function LoginWithPrivy() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { data: balance } = useBalance({
    address: user?.wallet?.address as `0x${string}`,
  });

  const formatBalance = (value: bigint) => {
    const formatted = formatEther(value);
    const [whole, decimal] = formatted.split('.');
    return `${whole}.${decimal.slice(0, 2)} ${balance?.symbol}`;
  };

  if (!ready) return <p className="text-center text-gray-600">Loading...</p>;

  return (
    <div className="card">
      {authenticated ? (
        <div>
          {user?.telegram && (
            <p className="connected-text">
              Welcome,{' '}
              <span className="connected-username">
                {String(user?.telegram?.username)}
              </span>
              !
            </p>
          )}
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-bold">
              {balance ? formatBalance(balance.value) : '...'}
            </p>
            <button
              onClick={logout}
              className="button button-disconnect bg-gray-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-gray-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={login}
            className="button button-connect bg-green-500 text-white font-semibold w-full py-2 px-4 rounded-md hover:bg-green-600 transition"
          >
            Login with Privy
          </button>
        </div>
      )}
    </div>
  );
}