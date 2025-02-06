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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setError('No file selected');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed');
      return;
    }

    if (file.size > 32 * 1024) {
      setError('Image size must be 32KB or smaller');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      onImageUpload(base64);
      setUploadedImageSize(getStringSizeInKB(base64));
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
