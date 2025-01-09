'use client';

import { useEffect, useState } from 'react';
import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import useContracts from '../contracts/contracts';
import AddressList from './AddressList';
import { useQueryClient } from '@tanstack/react-query';
import ImageGallery, { ImageGalleryImage } from './GalleryDisplay';
import ImageUploader from './ImageUploader';

export default function Content() {
  const [reload, setReload] = useState(false); // TODO: Not good practice to reload all data for every transaction
  const [awaitingResponse, setAwaitingResponse] = useState(false);
  const [galleryAddresses, setGalleryAddresses] = useState<string[]>([]);
  const [imageGallery, setImageGallery] = useState<ImageGalleryImage[]>([]);
  const [activeAddress, setActiveAddress] = useState<string>('');
  const [uploadedBase64Image, setUploadedBase64Image] = useState<string>('');

  const account = useAccount();
  const queryClient = useQueryClient();
  const { personalImageGallery, personalImageGalleryFactory } = useContracts();

  const { data, writeContract, error: writeError } = useWriteContract();

  const { data: receipt, error: receiptError } = useWaitForTransactionReceipt({
    hash: data,
  });

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
  }, [reload]);

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

  const {
    data: galleryAddressesData,
    queryKey: galleryAddressesQueryKey,
  } = useReadContract({
    abi: personalImageGalleryFactory.abi,
    address: personalImageGalleryFactory.address,
    functionName: 'getGalleries',
    args: [account.address],
  });

  useEffect(() => {
    if (galleryAddressesData) {
      const newAddresses = galleryAddressesData as string[];
      newAddresses.reverse();
      setGalleryAddresses(newAddresses);
    }
  }, [galleryAddressesData]);

  const {
    data: galleryData,
    queryKey: galleryQueryKey,
  } = useReadContract({
    abi: personalImageGallery.abi,
    address: activeAddress as `0x${string}`,
    functionName: 'getImages',
  });

  useEffect(() => {
    if (galleryData) {
      const newImages = galleryData as ImageGalleryImage[];
      // reverse the array so the latest images are shown first
      newImages.reverse();
      setImageGallery(newImages);
    }
  }, [galleryData]);

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
    setReload(true);
    setActiveAddress(address);
  }

  function handleSaveOnchain() {
    // console.log(uploadedBase64Image);
    setAwaitingResponse(true);
    writeContract({
      abi: personalImageGallery.abi,
      address: activeAddress as `0x${string}`,
      functionName: 'addImage',
      args: ['test', uploadedBase64Image],
    });
  }

  return (
    <div className="card gap-1">
      {account.isConnected && (
        <div>
          <div className="mb-4">
            <button onClick={handleCreateGallery} disabled={awaitingResponse}
              className={`px-4 py-2 rounded-lg text-white ${!awaitingResponse
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-300 cursor-not-allowed"
                }`}>
              {awaitingResponse ? 'Creating gallery...' : 'Create Gallery'}
            </button>
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