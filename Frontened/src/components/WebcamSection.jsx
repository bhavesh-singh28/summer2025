// src/components/WebcamSection.jsx
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
    <div className="webcam-section">
      <video ref={videoRef} autoPlay playsInline width="400" height="300" />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button onClick={captureImage} className="capture-btn">Capture</button>
    </div>
  );
};

export default WebcamSection;
