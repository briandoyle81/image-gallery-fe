'use client';

import React, { useState } from 'react';

interface ImageUploaderProps {
  onImageUpload: (base64Image: string) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageSize, setUploadedImageSize] = useState<number | null>(
    null
  );

  const getStringSizeInKB = (str: string) => {
    const blob = new Blob([str]); // Create a Blob from the string
    const sizeInBytes = blob.size; // Size in bytes
    const sizeInKB = sizeInBytes / 1024; // Convert to KB
    return sizeInKB;
  };

  const resizeAndConvertToJpeg = async (
    base64Str: string,
    maxDimension: number = 256
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxDimension) {
            height = height * (maxDimension / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = width * (maxDimension / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        // Start with high quality and reduce until size is under 32KB
        let quality = 1.0;
        let result = canvas.toDataURL('image/jpeg', quality);

        while (result.length > 32 * 1024 && quality > 0.1) {
          quality -= 0.1;
          result = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(result);
      };
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      setError('No file selected');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      const sizeInKB = getStringSizeInKB(base64);

      let finalImage;
      if (sizeInKB > 32) {
        finalImage = await resizeAndConvertToJpeg(base64);
      } else {
        finalImage = await resizeAndConvertToJpeg(base64); // Convert to JPEG without resizing
      }

      onImageUpload(finalImage);
      setUploadedImageSize(getStringSizeInKB(finalImage));
      setError(null);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center space-y-4">
        <br />
        <div className="text-center">
          <p className="text-sm text-gray-500">Max upload size: 32KB</p>
        </div>
        <label
          htmlFor="image-upload"
          className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
        >
          Upload Image
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {uploadedImageSize && uploadedImageSize > 40 && (
          <div>
            <p className="text-red-500 text-sm">
              Warning: Base64 size is {uploadedImageSize}KB
            </p>
            <p className="text-red-500 text-sm">
              Size limit for image + description is ~41.18 KB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
