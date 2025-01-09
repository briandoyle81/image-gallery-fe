import React from "react";

export type ImageGalleryImage = {
  description: string;
  base64EncodedImage: string;
};

type ImageGalleryProps = {
  images: ImageGalleryImage[]; // Array of image objects
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  if (images.length === 0) {
    return (
      <div className="container mx-auto px-4">
        <p className="text-center text-xl font-bold">No images to display</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => {
          const isValidBase64Image =
            typeof image.base64EncodedImage === "string" &&
            image.base64EncodedImage.startsWith("data:image/") &&
            image.base64EncodedImage.includes("base64,");

          return (
            <div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-md"
            >
              {isValidBase64Image ? (
                <img
                  src={image.base64EncodedImage}
                  alt={image.description || `Image ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="p-4 text-center text-red-500">
                  Invalid image data
                </div>
              )}
              <div className="p-2 bg-gray-100 text-center text-sm text-gray-700">
                {image.description || "No description available"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImageGallery;
