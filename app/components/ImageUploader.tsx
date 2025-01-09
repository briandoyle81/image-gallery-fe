import React, { useState } from "react";

type ImageUploaderProps = {
  setUploadedBase64Image: (base64: string) => void; // Function to set the uploaded base64 image
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  setUploadedBase64Image,
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setError("No file selected");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed");
      return;
    }

    // if (file.size > 30 * 1024) {
    //   setError("Image size must be 30KB or smaller");
    //   return;
    // }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setUploadedBase64Image(base64);
      setError(null);
    };
    reader.onerror = () => {
      setError("Failed to read file");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center space-y-4">
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
      </div>
    </div>
  );
};

export default ImageUploader;
