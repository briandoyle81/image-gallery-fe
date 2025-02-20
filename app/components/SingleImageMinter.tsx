'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { flowMainnet } from 'viem/chains';
import useContracts from '../contracts/contracts';

type SingleImageMinterProps = {
  galleryAddress: string;
  imageIndex: number;
};

export default function SingleImageMinter({ galleryAddress, imageIndex }: SingleImageMinterProps) {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const isFlowNetwork = chainId === flowMainnet.id;
  const { galleryMinter } = useContracts();
  const [isMinting, setIsMinting] = useState(false);
  const [hasMinted, setHasMinted] = useState(false);

  const { data, writeContract, error: writeError } = useWriteContract();

  const { data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (receipt) {
      console.log('Minting complete:', receipt);
      setIsMinting(false);
      setHasMinted(true);
    }
  }, [receipt]);

  useEffect(() => {
    if (writeError || receiptError) {
      console.error('Minting error:', writeError || receiptError);
      setIsMinting(false);
    }
  }, [writeError, receiptError]);

  const handleMint = () => {
    setIsMinting(true);
    writeContract({
      abi: galleryMinter.abi,
      address: galleryAddress as `0x${string}`,
      functionName: 'mint',
      args: [address as `0x${string}`, imageIndex, 1],
    });
  };

  if (!isFlowNetwork) return null;

  return (
    <div className="p-4 text-center">
      <button
        className={`px-6 py-3 rounded-lg text-white text-lg ${
          isConnected && !isMinting
            ? 'bg-blue-500 hover:bg-blue-600'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
        disabled={!isConnected || isMinting}
        onClick={handleMint}
      >
        {isMinting 
          ? 'Processing...' 
          : hasMinted 
            ? 'Mint Again' 
            : 'Mint'
        }
      </button>
    </div>
  );
} 