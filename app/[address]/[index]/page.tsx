'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { useParams } from 'next/navigation';
import { useReadContract } from 'wagmi';
import useContracts from '../../contracts/contracts';
import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Image from 'next/image';
import SingleImageMinter from '../../components/SingleImageMinter';
import type { ImageGalleryImage } from '../../components/GalleryDisplay';

export default function SingleImagePage() {
  const params = useParams();
  const address = params.address as string;
  const index = parseInt(params.index as string);
  const [image, setImage] = useState<ImageGalleryImage | null>(null);
  const { galleryMinter } = useContracts();

  const { data: galleryData } = useReadContract({
    abi: galleryMinter.abi,
    address: address as `0x${string}`,
    functionName: 'getImages',
  });

  useEffect(() => {
    if (galleryData) {
      const images = galleryData as ImageGalleryImage[];
      if (images[index]) {
        setImage(images[index]);
      }
    }
  }, [galleryData, index]);

  function Disclaimer() {
    return (
      <div className="mb-4">
        <p className="text-lg">
          This is a fun benchmark. It is not best practice and is not a production app.
        </p>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Disclaimer />
        {image ? (
          <div className="max-w-2xl mx-auto">
            <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md">
              <div className="relative w-full aspect-square">
                <Image
                  src={image.base64EncodedImage}
                  alt={image.description || `Image ${index + 1}`}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <SingleImageMinter 
                galleryAddress={address} 
                imageIndex={index} 
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p>Loading image...</p>
          </div>
        )}
      </div>
    </>
  );
} 