'use client';

import React, { useState } from 'react';
import CameraModal from './CameraModal';

interface ImageUploaderProps {
  onImageUpload: (base64Image: string) => void;
}

export default function ImageUploader({ onImageUpload }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageSize, setUploadedImageSize] = useState<number | null>(
    null
  );
  const [showCamera, setShowCamera] = useState(false);

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
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = base64Str;
        img.onerror = (err) => reject(err);
        img.onload = () => {
          try {
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
          } catch (err) {
            reject(err);
          }
        };
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
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
    } catch (err) {
      console.error('Error handling file:', err);
    }
  };

  const checkCameraPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      console.error('Camera permission error:', err);
      return false;
    }
  };

  const handleCameraClick = async () => {
    const hasPermission = await checkCameraPermissions();
    if (hasPermission) {
      setShowCamera(true);
    } else {
      setError('Camera permission denied');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCameraClick}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
              </svg>
            </button>
            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
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
        <CameraModal
          isOpen={showCamera}
          onClose={() => setShowCamera(false)}
          onCapture={async (imageData) => {
            const sizeInKB = getStringSizeInKB(imageData);
            let finalImage;
            if (sizeInKB > 32) {
              finalImage = await resizeAndConvertToJpeg(imageData);
            } else {
              finalImage = await resizeAndConvertToJpeg(imageData);
            }
            onImageUpload(finalImage);
            setUploadedImageSize(getStringSizeInKB(finalImage));
          }}
        />
      </div>
    </div>
  );
}
