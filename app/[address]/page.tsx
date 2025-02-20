'use client';

import '@rainbow-me/rainbowkit/styles.css';

import { useParams } from 'next/navigation';
import { useReadContract } from 'wagmi';
import useContracts from '../contracts/contracts';
import ImageGallery, { ImageGalleryImage } from '../components/GalleryDisplay';
import { useEffect, useState } from 'react';
import Header from '../components/Header';

export default function GalleryPage() {
  const params = useParams();
  const address = params.address as string;
  const [images, setImages] = useState<ImageGalleryImage[]>([]);
  const { personalImageGallery, galleryMinter } = useContracts();

  const { data: galleryData } = useReadContract({
    abi: galleryMinter.abi,
    address: address as `0x${string}`,
    functionName: 'getImages',
  });

  useEffect(() => {
    if (galleryData) {
      const newImages = galleryData as ImageGalleryImage[];
      newImages.reverse();
      setImages(newImages);
    }
  }, [galleryData]);

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
        <ImageGallery images={images} galleryAddress={address} />
      </div>
    </>
  );
} 