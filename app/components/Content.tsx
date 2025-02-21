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

  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

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

  const { data: galleryAddressesData } = useReadContract({
    abi: getCurrentFactory().abi,
    address: getCurrentFactory().address,
    functionName: 'getGalleries',
    args: [account.address as `0x${string}`],
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
    if (!account.address) return;
    setAwaitingResponse(true);
    writeContract({
      abi: getCurrentFactory().abi,
      address: getCurrentFactory().address,
      functionName: getCreateFunctionName(),
      args: [account.address as `0x${string}`],
    });
  }

  function handleSetActiveAddress(address: string) {
    setReload(true);
    setActiveAddress(address);
    console.log(address);
  }

  const handleSaveOnchain = async () => {
    try {
      setAwaitingResponse(true);
      writeContract({
        abi: personalImageGallery.abi,
        address: activeAddress as `0x${string}`,
        functionName: 'addImage',
        args: ['', uploadedBase64Image],
      });
    } catch (err) {
      console.error('Error saving onchain:', err);
    } finally {
      setAwaitingResponse(false);
    }
  };

  if (!isBrowser) return <div>Loading...</div>;

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
                        <div className="flex items-center justify-center gap-2 text-green-600">
                          <span>✅</span>
                          <a
                            href={`/${activeAddress}`}
                            className="text-green-600 hover:text-green-700"
                          >
                            View Image in Gallery
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
              Connect your wallet to view your galleries.  Use the Flow Wallet for sponsored gas!
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
