'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import { useReadContract } from 'wagmi';
import useContracts from '../contracts/contracts';
import { ImageGalleryImage } from '../components/GalleryDisplay';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';

// Dynamically import components with no SSR
const Header = dynamic(() => import('../components/Header'), { ssr: false });
const ImageGallery = dynamic(() => import('../components/GalleryDisplay'), { ssr: false });

export default function GalleryPage() {
  const params = useParams();
  const address = params.address as string;
  const [images, setImages] = useState<ImageGalleryImage[]>([]);
  const { galleryMinter } = useContracts();
  const { status } = useAccount();

  const { data: galleryData } = useReadContract({
    abi: galleryMinter.abi,
    address: address as `0x${string}`,
    functionName: 'getImages',
  });

  useEffect(() => {
    if (galleryData) {
      const newImages = galleryData as ImageGalleryImage[];
      setImages(newImages);
    }
  }, [galleryData]);

  if (status === 'reconnecting') return null;

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-500 hover:text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to App
          </Link>
        </div>
        <ImageGallery images={images} galleryAddress={address} />
      </div>
    </>
  );
} 