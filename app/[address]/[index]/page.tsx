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
import Link from 'next/link';

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

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href={`/${address}`}
            className="inline-flex items-center text-blue-500 hover:text-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to Gallery
          </Link>
        </div>
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