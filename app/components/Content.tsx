'use client';

import { useEffect, useState } from 'react';
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  useChainId,
} from 'wagmi';
import useContracts from '../contracts/contracts';
import { useQueryClient } from '@tanstack/react-query';
import ImageUploader from './ImageUploader';
import TransactionCostBox from './TransactionCostBox';
import { ChainCost } from '../util/EstimateTxCosts';
import { chainLogos } from '../util/ChainConstants';
import {
  flowMainnet,
  polygon,
  base,
  arbitrum,
  avalanche,
  bsc,
} from 'viem/chains';
import Image from 'next/image';

export default function Content() {
  const [reload, setReload] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [galleryAddresses, setGalleryAddresses] = useState<string[]>([]);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [uploadedBase64Image, setUploadedBase64Image] = useState<string>('');
  const [costDetails, setCostDetails] = useState<ChainCost[]>(
    Object.entries(chainLogos).map(([chainName, logo]) => ({
      chainName,
      logo,
      totalCost: undefined,
    }))
  );

  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const account = useAccount();
  const queryClient = useQueryClient();
  const {
    personalImageGallery,
    // galleryMinter,
    // flowImageGalleryFactory,
    flowMinterFactory,
    polygonImageGalleryFactory,
    baseImageGalleryFactory,
    arbitrumImageGalleryFactory,
    avalancheImageGalleryFactory,
    bscImageGalleryFactory,
  } = useContracts();

  const chainId = useChainId();

  function getCurrentFactory() {
    if (account.chainId) {
      switch (account.chainId) {
        case flowMainnet.id:
        // return flowImageGalleryFactory;
          return flowMinterFactory;
        case polygon.id:
          return polygonImageGalleryFactory;
        case base.id:
          return baseImageGalleryFactory;
        case arbitrum.id:
          return arbitrumImageGalleryFactory;
        case avalanche.id:
          return avalancheImageGalleryFactory;
        case bsc.id:
          return bscImageGalleryFactory;
        default:
          throw new Error('Unsupported chain ' + account.chainId);
      }
    } else {
      // return flowImageGalleryFactory;
      return flowMinterFactory;
    }
  }

  function getCreateFunctionName() {
    if (account.chainId) {
      switch (account.chainId) {
        case flowMainnet.id:
          return 'createGalleryAndMinter';
        default:
          return 'createPersonalImageGallery';
      }
    } else {
      return 'createGalleryAndMinter';
    }
  }

  const { data, writeContract, error: writeError } = useWriteContract();

  const { data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: data,
  });

  const { data: galleryAddressesData, queryKey: galleryAddressesQueryKey } =
    useReadContract({
      abi: getCurrentFactory().abi,
      address: getCurrentFactory().address,
      functionName: 'getGalleries',
      args: [account.address],
    });

  useEffect(() => {
    if (galleryAddressesData) {
      const newAddresses = galleryAddressesData as string[];
      newAddresses.reverse();
      setGalleryAddresses(newAddresses);
      if (activeAddress === null && newAddresses.length > 0) {
        console.log('Setting active address to first gallery', newAddresses);
        setActiveAddress(newAddresses[0]);
      } else if (newAddresses.length === 0) {
        setActiveAddress(null);
      }
    } else {
      setGalleryAddresses([]);
      setActiveAddress(null);
    }
  }, [galleryAddressesData, activeAddress]);

  useEffect(() => {
    if (receipt) {
      console.log(receipt);
      setReload(true);
      setAwaitingResponse(false);
      setUploadSuccess(true);
    }
  }, [receipt]);

  useEffect(() => {
    if (reload) {
      setReload(false);
      queryClient.invalidateQueries({ queryKey: galleryAddressesQueryKey });
    }
  }, [reload, queryClient, galleryAddressesQueryKey]);

  useEffect(() => {
    if (writeError) {
      console.error(writeError);
      setAwaitingResponse(false);
    }
  }, [writeError]);

  useEffect(() => {
    if (receiptError) {
      console.error(receiptError);
      setAwaitingResponse(false);
    }
  }, [receiptError]);

  useEffect(() => {
    if (uploadedBase64Image) {
      setIsLoadingPrices(true);
      fetch('/api/getPrices', {
        method: 'POST',
        body: JSON.stringify({
          base64ImageStringLength: uploadedBase64Image.length,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          setCostDetails(data);
          setIsLoadingPrices(false);
        })
        .catch((error) => {
          console.error('Error fetching cost details:', error);
          setIsLoadingPrices(false);
        });
    }
  }, [uploadedBase64Image]);

  useEffect(() => {
    // Reset state when network changes
    setGalleryAddresses([]);
    setActiveAddress(null);
  }, [chainId]);

  useEffect(() => {
    // Refetch gallery addresses when activeAddress is cleared
    if (activeAddress === null) {
      queryClient.invalidateQueries({ queryKey: galleryAddressesQueryKey });
    }
  }, [activeAddress, queryClient, galleryAddressesQueryKey]);

  useEffect(() => {
    // Reset state when wallet disconnects
    if (!account.isConnected) {
      setGalleryAddresses([]);
      setActiveAddress(null);
      setUploadedBase64Image('');
    }
  }, [account.isConnected]);

  function handleCreateGallery() {
    setAwaitingResponse(true);
    writeContract({
      abi: getCurrentFactory().abi,
      address: getCurrentFactory().address,
      functionName: getCreateFunctionName(),
      args: [account.address],
    });
  }

  function handleSetActiveAddress(address: string) {
    setReload(true);
    setActiveAddress(address);
    console.log(address);
  }

  function handleSaveOnchain() {
    setAwaitingResponse(true);
    writeContract({
      abi: personalImageGallery.abi,
      address: activeAddress as `0x${string}`,
      functionName: 'addImage',
      args: ['', uploadedBase64Image],
    });
  }

  return (
    <div className="card gap-1">
      <div className="flex flex-col gap-4">
        {account.isConnected && (
          <div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8">
              <div className="w-full sm:w-1/2">
                <label className="block text-sm font-medium text-gray-700">
                  Select a Gallery
                </label>
                <select
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 
                  focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 
                  sm:text-sm rounded-md"
                  value={activeAddress || ''}
                  onChange={(e) => handleSetActiveAddress(e.target.value)}
                >
                  {galleryAddresses.map((address) => (
                    <option key={address} value={address}>
                      {address}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-row gap-2 sm:justify-end sm:flex-shrink-0">
                {activeAddress && (
                  <>
                    <a
                      href={`/${activeAddress}`}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 text-center"
                    >
                      View Gallery
                    </a>
                    <a
                      href={`https://evm.flowscan.io/address/${activeAddress}`}
                      target="_blank"
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600 text-center"
                    >
                      View Contract
                    </a>
                  </>
                )}
                <button
                  onClick={handleCreateGallery}
                  disabled={awaitingResponse}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-white text-center ${
                    !awaitingResponse
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {awaitingResponse ? 'Loading...' : 'Create Gallery'}
                </button>
              </div>
            </div>
            {galleryAddresses.length > 0 && (
              <div>
                <div className="mb-8">
                  <TransactionCostBox
                    costDetails={costDetails}
                    isLoading={isLoadingPrices}
                  />
                </div>
                <div className="mb-4">
                  <ImageUploader
                    onImageUpload={(base64Image) => {
                      setUploadedBase64Image(base64Image);
                      setUploadSuccess(false);
                    }}
                  />
                  {uploadedBase64Image && (
                    <div className="mt-6 text-center">
                      <div className="relative w-64 h-64 mx-auto mb-4">
                        <Image
                          src={uploadedBase64Image}
                          alt="Uploaded"
                          fill
                          className="object-contain rounded-lg"
                          sizes="(max-width: 768px) 100vw, 256px"
                        />
                      </div>
                      {uploadSuccess ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              const tweetText = "I just put a photo 100% onchain with FlowtoBooth!  Mint it from my gallery!🖼️\n";
                              const url = `https://flowtobooth.vercel.app/${activeAddress}`;
                              window.open(
                                `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(url)}`,
                                '_blank'
                              );
                            }}
                            className="px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] transition-colors flex items-center gap-2"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z" />
                            </svg>
                            Share
                          </button>
                          <a
                            href={`/${activeAddress}`}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            View Gallery
                          </a>
                        </div>
                      ) : (
                        <button
                          onClick={handleSaveOnchain}
                          disabled={awaitingResponse || activeAddress === null}
                          className={`px-4 py-2 rounded-lg text-white ${
                            !awaitingResponse && activeAddress !== null
                              ? 'bg-blue-500 hover:bg-blue-600'
                              : 'bg-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {awaitingResponse ? 'Loading...' : 'Save Onchain'}
                        </button>
                      )}
                      {activeAddress === null && (
                        <p className="text-sm text-gray-500 mt-2">
                          Create a gallery to save image onchain
                        </p>
                      )}
                    </div>
                  )}
                  {writeError && (
                    <p className="text-red-500">
                      There was an error with the last transaction:
                    </p>
                  )}
                  {writeError && (
                    <p className="text-red-500">{writeError.message}</p>
                  )}
                </div>
              </div>
            )}

            {galleryAddresses.length === 0 && (
              <div className="text-center mt-4">
                <p className="text-gray-600">Create a gallery to start uploading images</p>
              </div>
            )}
          </div>
        )}
        {!account.isConnected && (
          <div className="text-center">
            <p className="text-xl font-bold">
              Connect your wallet to view your galleries.
            </p>
          </div>
        )}

        <footer className="mt-8 text-center border-t border-gray-200 pt-4">
          <a
            href="https://developers.flow.com?utm_source=flowtobooth&utm_id=beacon"
            target="_blank"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            Learn to Build on Flow
          </a>
        </footer>
      </div>
    </div>
  );
}
