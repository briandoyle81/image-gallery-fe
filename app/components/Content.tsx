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
import ImageGallery, { ImageGalleryImage } from './GalleryDisplay';
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
  // bsc,
} from 'viem/chains';
import Image from 'next/image';

export default function Content() {
  const [reload, setReload] = useState(false);
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [galleryAddresses, setGalleryAddresses] = useState<string[]>([]);
  const [imageGallery, setImageGallery] = useState<ImageGalleryImage[]>([]);
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [uploadedBase64Image, setUploadedBase64Image] = useState<string>('');
  const [costDetails, setCostDetails] = useState<ChainCost[]>(
    Object.entries(chainLogos).map(([chainName, logo]) => ({
      chainName,
      logo,
      totalCost: undefined,
    }))
  );
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);

  const account = useAccount();
  const queryClient = useQueryClient();
  const {
    personalImageGallery,
    flowImageGalleryFactory,
    polygonImageGalleryFactory,
    baseImageGalleryFactory,
    arbitrumImageGalleryFactory,
    avalancheImageGalleryFactory,
  } = useContracts();

  const chainId = useChainId();

  function getCurrentFactory() {
    if (account.chainId) {
      switch (account.chainId) {
        case flowMainnet.id:
          return flowImageGalleryFactory;
        case polygon.id:
          return polygonImageGalleryFactory;
        case base.id:
          return baseImageGalleryFactory;
        case arbitrum.id:
          return arbitrumImageGalleryFactory;
        case avalanche.id:
          return avalancheImageGalleryFactory;
        // case bsc.id:
        //   return bscImageGalleryFactory;
        default:
          throw new Error('Unsupported chain ' + account.chainId);
      }
    } else {
      return flowImageGalleryFactory;
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

  const { data: galleryData, queryKey: galleryQueryKey } = useReadContract({
    abi: personalImageGallery.abi,
    address: activeAddress as `0x${string}`,
    functionName: 'getImages',
  });

  useEffect(() => {
    if (galleryAddressesData) {
      const newAddresses = galleryAddressesData as string[];
      newAddresses.reverse();
      setGalleryAddresses(newAddresses);
      if (activeAddress === null && newAddresses.length > 0) {
        console.log('Setting active address to first gallery', newAddresses);
        setActiveAddress(newAddresses[0]);
      }
    }
  }, [galleryAddressesData, activeAddress]);

  useEffect(() => {
    if (galleryData) {
      const newImages = galleryData as ImageGalleryImage[];
      newImages.reverse();
      setImageGallery(newImages);
    }
  }, [galleryData]);

  useEffect(() => {
    if (receipt) {
      console.log(receipt);
      setReload(true);
      setAwaitingResponse(false);
    }
  }, [receipt]);

  useEffect(() => {
    if (reload) {
      setReload(false);
      queryClient.invalidateQueries({ queryKey: galleryAddressesQueryKey });
      queryClient.invalidateQueries({ queryKey: galleryQueryKey });
    }
  }, [reload, queryClient, galleryAddressesQueryKey, galleryQueryKey]);

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
    setImageGallery([]);
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
      setImageGallery([]);
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
      functionName: 'createPersonalImageGallery',
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
        <div className="mb-4">
          <p className="text-lg">
            This is a fun benchmark. It is not best practice and is not a
            production app.
          </p>
        </div>
        {account.isConnected && (
          <div className="flex justify-between items-center mb-8">
            <div>
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
            <button
              onClick={handleCreateGallery}
              disabled={awaitingResponse}
              className={`px-4 py-2 rounded-lg text-white ${
                !awaitingResponse
                  ? 'bg-blue-500 hover:bg-blue-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {awaitingResponse ? 'Creating gallery...' : 'Create Gallery'}
            </button>
          </div>
        )}

        {account.isConnected && (
          <div>
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === 'upload'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Upload
                </button>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === 'gallery'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  Gallery
                </button>
              </nav>
            </div>

            {activeTab === 'upload' && (
              <div>
                <div className="mb-8">
                  <TransactionCostBox
                    costDetails={costDetails}
                    isLoading={isLoadingPrices}
                  />
                </div>
                <div className="mb-4">
                  <ImageUploader
                    onImageUpload={(base64Image) =>
                      setUploadedBase64Image(base64Image)
                    }
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
                      <button
                        onClick={handleSaveOnchain}
                        disabled={awaitingResponse || activeAddress === null}
                        className={`px-4 py-2 rounded-lg text-white ${
                          !awaitingResponse && activeAddress !== null
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                      >
                        {awaitingResponse ? 'Saving image...' : 'Save Onchain'}
                      </button>
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

            {activeTab === 'gallery' && (
              <div className="mb-4">
                <ImageGallery images={imageGallery} />
              </div>
            )}
          </div>
        )}
        {!account.isConnected && (
          <div className="text-center">
            <p className="text-xl font-bold">
              Connect your wallet to view your galleries
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
