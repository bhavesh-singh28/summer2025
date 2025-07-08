import React, { useEffect, useRef } from 'react';

const WebcamSection = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(err => {
        alert("Webcam access denied or not available");
        console.error(err);
      });

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, []);

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (canvas && video) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      const image = canvas.toDataURL('image/jpeg');
      onCapture(image);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[400px] p-4">
      <div className="rounded-2xl shadow-lg border border-gray-300 p-4 bg-white flex flex-col items-center space-y-4 w-full max-w-md">
        <h2 className="text-xl font-semibold text-gray-700">Live Webcam</h2>
        <div className="rounded-lg overflow-hidden border-2 border-gray-200">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-auto object-cover max-h-[300px]"
          />
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <button
          onClick={captureImage}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
           Capture
        </button>
      </div>
    </div>
  );
};

export default WebcamSection;
