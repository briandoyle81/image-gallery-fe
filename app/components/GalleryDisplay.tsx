'use client';

import React, { useState, useEffect } from "react";
import Image from 'next/image';
import { useChainId, useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { flowMainnet } from 'viem/chains';
import useContracts from '../contracts/contracts';
import Link from 'next/link';

export type ImageGalleryImage = {
  description: string;
  base64EncodedImage: string;
};

type ImageGalleryProps = {
  images: ImageGalleryImage[]; // Array of image objects
  galleryAddress: string;
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, galleryAddress }) => {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const isFlowNetwork = chainId === flowMainnet.id;
  const { galleryMinter } = useContracts();
  const [mintingStates, setMintingStates] = useState<Record<number, boolean>>({});
  const [mintedImages, setMintedImages] = useState<Record<number, boolean>>({});

  const { data, writeContract, error: writeError } = useWriteContract();

  const { data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: data,
  });

  useEffect(() => {
    if (receipt) {
      console.log('Minting complete:', receipt);
      const mintedIndex = Object.keys(mintingStates).find(
        index => mintingStates[Number(index)] === true
      );
      if (mintedIndex) {
        setMintingStates(prev => ({
          ...prev,
          [Number(mintedIndex)]: false
        }));
        setMintedImages(prev => ({
          ...prev,
          [Number(mintedIndex)]: true
        }));
      }
    }
  }, [receipt, mintingStates]);

  useEffect(() => {
    if (writeError || receiptError) {
      console.error('Minting error:', writeError || receiptError);
      // Reset all minting states on error
      setMintingStates({});
    }
  }, [writeError, receiptError]);

  const handleMint = (imageIndex: number) => {
    setMintingStates(prev => ({ ...prev, [imageIndex]: true }));
    writeContract({
      abi: galleryMinter.abi,
      address: galleryAddress as `0x${string}`,
      functionName: 'mint',
      args: [address as `0x${string}`, imageIndex, 1],
    });
  };

  if (images.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <p className="text-center text-xl font-bold">No images to display</p>
      </div>
    );
  }

  // Create reversed array for display
  const displayImages = [...images].reverse();

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayImages.map((image, displayIndex) => {
          const originalIndex = images.length - 1 - displayIndex;
          const isValidBase64Image =
            typeof image.base64EncodedImage === "string" &&
            image.base64EncodedImage.startsWith("data:image/") &&
            image.base64EncodedImage.includes("base64,");

          return (
            <div
              key={originalIndex}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-md"
            >
              {isValidBase64Image ? (
                <Link href={`/${galleryAddress}/${originalIndex}`}>
                  <div className="relative w-full aspect-square cursor-pointer hover:opacity-90 transition-opacity">
                    <Image
                      src={image.base64EncodedImage}
                      alt={image.description || `Image ${displayIndex + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                </Link>
              ) : (
                <div className="p-4 text-center text-red-500">
                  Invalid image data
                </div>
              )}
              {isFlowNetwork && (
                <div className="p-2 text-center">
                  <button
                    className={`px-4 py-2 rounded-lg text-white ${
                      isConnected && !mintingStates[originalIndex]
                        ? 'bg-blue-500 hover:bg-blue-600'
                        : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    disabled={!isConnected || mintingStates[originalIndex]}
                    onClick={() => handleMint(originalIndex)}
                  >
                    {mintingStates[originalIndex] 
                      ? 'Processing...' 
                      : mintedImages[originalIndex] 
                        ? 'Mint Again' 
                        : 'Mint'
                    }
                  </button>
                </div>
              )}
              {/* <div className="p-2 bg-gray-100 text-center text-sm text-gray-700">
                {image.description || "No description available"}
              </div> */}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageGallery;
