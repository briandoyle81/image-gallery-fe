'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import useContracts from '../contracts/contracts';
import AddressList from './AddressList';
import { useQueryClient } from '@tanstack/react-query';
import ImageGallery, { ImageGalleryImage } from './GalleryDisplay';
import ImageUploader from './ImageUploader';
import TransactionCostBox from './TransactionCostBox';
import { ChainCost } from '../util/EstimateTxCosts';

export default function Content() {
  const [reload, setReload] = useState(false); // TODO: Not good practice to reload all data for every transaction
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [galleryAddresses, setGalleryAddresses] = useState<string[]>([]);
  const [imageGallery, setImageGallery] = useState<ImageGalleryImage[]>([]);
  const [activeAddress, setActiveAddress] = useState<string>('');
  const [uploadedBase64Image, setUploadedBase64Image] = useState<string>('');
  const [costDetails, setCostDetails] = useState<ChainCost[]>([]);

  const account = useAccount();
  const queryClient = useQueryClient();
  const { personalImageGallery, personalImageGalleryFactory } = useContracts();

  const { data, writeContract, error: writeError } = useWriteContract();

  const { data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: data,
  });

  const {
    data: galleryAddressesData,
    queryKey: galleryAddressesQueryKey,
  } = useReadContract({
    abi: personalImageGalleryFactory.abi,
    address: personalImageGalleryFactory.address,
    functionName: 'getGalleries',
    args: [account.address],
  });

  const {
    data: galleryData,
    queryKey: galleryQueryKey,
  } = useReadContract({
    abi: personalImageGallery.abi,
    address: activeAddress as `0x${string}`,
    functionName: 'getImages',
  });

  useEffect(() => {
    if (galleryAddressesData) {
      const newAddresses = galleryAddressesData as string[];
      newAddresses.reverse();
      setGalleryAddresses(newAddresses);
      if (activeAddress === '') {
        setActiveAddress(newAddresses[0]);
      }
    }
  }, [galleryAddressesData, activeAddress]);

  useEffect(() => {
    if (galleryData) {
      const newImages = galleryData as ImageGalleryImage[];
      // reverse the array so the latest images are shown first
      newImages.reverse();
      setImageGallery(newImages);
    }
  }, [galleryData]);

  useEffect(() => {
    if (receipt) {
      console.log(receipt);
      queryClient.invalidateQueries({ queryKey: galleryAddressesQueryKey });
      queryClient.invalidateQueries({ queryKey: galleryQueryKey });
      setAwaitingResponse(false);
    }
  }, [receipt, queryClient, galleryAddressesQueryKey, galleryQueryKey]);

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
      // Call the API to get the cost details
      fetch('/api/getPrices', {
        method: 'POST',
        body: JSON.stringify({ base64ImageStringLength: uploadedBase64Image.length }),
      })
        .then(response => response.json())
        .then(data => setCostDetails(data))
        .catch(error => console.error('Error fetching cost details:', error));
    }
  }, [uploadedBase64Image]);

  function handleCreateGallery() {
    setAwaitingResponse(true);
    writeContract({
      abi: personalImageGalleryFactory.abi,
      address: personalImageGalleryFactory.address,
      functionName: 'createPersonalImageGallery',
      args: [account.address],
    });
  }

  function handleSetActiveAddress(address: string) {
    setActiveAddress(address);
  }

  useEffect(() => {
    if (activeAddress) {
      queryClient.invalidateQueries({ queryKey: galleryQueryKey });
    }
  }, [activeAddress, queryClient, galleryQueryKey]);

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
        <p className="text-lg">
          A decentralized image gallery built on Flow blockchain. All images saved directly on-chain.
        </p>
        <p className="text-lg">
          Free with gas sponsored by Flow with the Flow wallet. Sub-cent to save an image with other wallets.
        </p>
        <p className="text-lg">
          This is a fun demo, not a production app.
        </p>
      </div>
      <div className="mb-8">
        <TransactionCostBox costDetails={costDetails} />
      </div>
      {account.isConnected && (
        <div>

          <div className="mb-4">
            {writeError && <p className="text-red-500">There was an error with the last transaction:</p>}
            {writeError && <p className="text-red-500">{writeError.message}</p>}
            <button onClick={handleCreateGallery} disabled={awaitingResponse}
              className={`px-4 py-2 rounded-lg text-white ${!awaitingResponse
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
                }`}>
              {awaitingResponse ? 'Creating gallery...' : 'Create Gallery'}
            </button>
            {galleryAddresses.length > 0 && (
              <div>
                <AddressList addresses={galleryAddresses} handleSetActiveAddress={handleSetActiveAddress} />
                <ImageUploader setUploadedBase64Image={setUploadedBase64Image} />
                {uploadedBase64Image && (
                  <div className="mt-6 text-center">
                    <img
                      src={uploadedBase64Image}
                      alt="Uploaded"
                      className="max-w-xs mx-auto rounded-lg shadow-md"
                    />
                    <button onClick={handleSaveOnchain} disabled={awaitingResponse}
                      className={`px-4 py-2 rounded-lg text-white ${!awaitingResponse
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-gray-300 cursor-not-allowed"
                        }`}>
                      {awaitingResponse ? 'Saving image...' : 'Save Onchain'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="mb-4">
            <ImageGallery images={imageGallery} />
          </div>
        </div>
      )}
      {!account.isConnected && (
        <div className="text-center">
          <p className="text-xl font-bold">Connect your wallet to view your galleries</p>
        </div>
      )}
    </div>
  );
}