import { useRef, useState, useEffect } from 'react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export default function CameraModal({ isOpen, onClose, onCapture }: CameraModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCamera = async () => {
    console.log('Starting camera...');
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }
      });
      console.log('Got media stream:', mediaStream.active, mediaStream.getVideoTracks().length);
      
      if (videoRef.current) {
        console.log('Setting video source');
        videoRef.current.srcObject = mediaStream;
        // Ensure video plays after source is set
        await videoRef.current.play().catch(e => {
          console.error('Error playing video:', e);
          throw e;
        });
      } else {
        console.error('No video element reference');
        throw new Error('Video element not found');
      }
      
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setError('Camera access denied. Please enable camera access and try again.');
      } else {
        setError('Unable to access camera. Please make sure your device has a camera and try again.');
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const takePicture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');
      onCapture(imageData);
      stopCamera();
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      console.log('Modal opened');
      startCamera();
    }
    return () => {
      console.log('Cleaning up camera');
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-[90%]">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Take a Picture</h2>
        </div>
        <div className="relative w-full aspect-[4/3]">
          {!stream && !error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    startCamera();
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className={`w-full h-full object-contain scale-x-[-1] ${!stream ? 'hidden' : ''}`}
            onPlay={() => videoRef.current?.play()}
          />
        </div>
        <div className="p-4 flex justify-between">
          <button
            onClick={takePicture}
            className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </button>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="bg-gray-500 text-white p-3 rounded-full hover:bg-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
} 