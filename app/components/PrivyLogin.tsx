'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useBalance } from 'wagmi';
import { formatEther } from 'viem';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function LoginWithPrivy() {
  const [mounted, setMounted] = useState(false);
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { data: balance } = useBalance({
    address: user?.wallet?.address as `0x${string}`,
  });
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatBalance = (value: bigint) => {
    const formatted = formatEther(value);
    const [whole, decimal] = formatted.split('.');
    return `${whole}${decimal?.slice(0, 2) ? `.${decimal.slice(0, 2)}` : ''} ${balance?.symbol || ''}`;
  };

  if (!mounted || !ready) return null;

  return (
    <>
      <div className="card">
        {authenticated ? (
          <div>
            {user?.telegram && (
              <p className="connected-text">
                Welcome, <span className="connected-username">{String(user?.telegram?.username)}</span>!
              </p>
            )}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowQR(true)}
                  className="p-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M2 2h2v2H2V2Z"/>
                    <path d="M6 0v6H0V0h6ZM5 1H1v4h4V1ZM4 12H2v2h2v-2Z"/>
                    <path d="M6 10v6H0v-6h6Zm-5 1v4h4v-4H1Zm11-9h2v2h-2V2Z"/>
                    <path d="M10 0v6h6V0h-6Zm5 1v4h-4V1h4ZM8 1V0h1v2H8v2H7V1h1Zm0 5V4h1v2H8ZM6 8V7h1V6h1v2h1V7h5v1h-4v1H7V8H6Zm0 0v1H2V8H1v1H0V7h3v1h3Zm10 1h-1V7h1v2Zm-1 0h-1v2h2v-1h-1V9Zm-4 0h2v1h-1v1h-1V9Zm2 3v-1h-1v1h-1v1H9v1h3v-2h1Zm0 0h3v1h-2v1h-1v-2Zm-4-1v1h1v-2H7v1h2Z"/>
                    <path d="M7 12h1v3h4v1H7v-4Zm9 2v2h-3v-1h2v-1h1Z"/>
                  </svg>
                </button>
                <p className="text-sm font-bold">
                  {balance ? formatBalance(balance.value) : '...'}
                </p>
              </div>
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
              Log In with Privy
            </button>
          </div>
        )}
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowQR(false)}>
          <div 
            className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full relative" 
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowQR(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="mb-6">
              <h3 className="text-xl font-bold mb-2">Wallet Address QR Code</h3>
              <p className="text-sm text-gray-600 break-all font-mono">{user?.wallet?.address}</p>
            </div>
            <div className="flex justify-center bg-gray-50 p-6 rounded-lg">
              <QRCodeSVG value={user?.wallet?.address || ''} size={256} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}