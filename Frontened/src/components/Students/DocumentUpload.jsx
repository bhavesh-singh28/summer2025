import React, { useState } from 'react';
import { Check } from 'lucide-react';
import WebcamSection from '../WebcamSection';

const dataURLtoFile = (dataurl, filename) => {
  let arr = dataurl.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

const DocumentUpload = ({ data, updateData, onPrev }) => {
  const [documentFile, setDocumentFile] = useState(null);
  const [webcamFile, setWebcamFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showWebcam, setShowWebcam] = useState(false);

  const acceptedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDocumentUpload = (files) => {
    const file = files[0];
    if (!acceptedFileTypes.includes(file.type)) {
      alert(`File type ${file.type} is not supported`);
      return;
    }
    if (file.size > maxFileSize) {
      alert(`File ${file.name} is too large. Maximum size is 10MB`);
      return;
    }
    setDocumentFile(file);
    updateData({ documentFile: file });
  };

  const handleSubmit = async () => {
    if (!documentFile) {
      alert('Please upload your document');
      return;
    }
    if (!webcamFile) {
      alert('Please capture your image using the webcam');
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('document', documentFile);
    formData.append('live', webcamFile);

    try {
      const response = await fetch('http://localhost:8000/api/identity/verify', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setIsComplete(true);
      } else {
        alert(result.message || 'Verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      alert('An error occurred while verifying identity');
    }

    setIsSubmitting(false);
  };

  if (isComplete) {
    return (
      <div className="text-center max-w-2xl mx-auto">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold">🎉 Welcome to FoodieHub!</h2>
        <p className="text-lg mt-2">Your registration is complete!</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <h2 className="text-3xl font-bold text-center">📄 Upload Your ID Document</h2>

      <div
        className="border-2 border-dashed p-6 rounded-lg text-center hover:bg-orange-50 transition"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleDocumentUpload(Array.from(e.dataTransfer.files));
        }}
      >
        <p className="mb-2">Drag and drop your ID here or</p>
        <label className="text-blue-600 underline cursor-pointer">
          Browse
          <input
            type="file"
            onChange={(e) => handleDocumentUpload(Array.from(e.target.files))}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png,.gif"
          />
        </label>
      </div>

      {documentFile && (
        <div className="bg-gray-50 p-4 rounded shadow">
          <p className="font-medium">{documentFile.name}</p>
          <p className="text-sm text-gray-500">{(documentFile.size / 1024).toFixed(1)} KB</p>
          <button
            onClick={() => setDocumentFile(null)}
            className="text-red-500 hover:text-red-700 mt-2"
          >
            ✕ Remove
          </button>
        </div>
      )}

      <button
        onClick={() => setShowWebcam(true)}
        className="w-full py-3 bg-blue-100 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-200"
      >
        📷 Capture Photo from Webcam
      </button>

      {webcamFile && (
        <div className="text-sm text-green-700">✅ Webcam photo captured</div>
      )}

      {showWebcam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 shadow-xl relative">
            <button
              onClick={() => setShowWebcam(false)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
            >
              ×
            </button>
            <WebcamSection
              onCapture={(imageData) => {
                const blob = dataURLtoFile(imageData, `webcam_${Date.now()}.jpg`);
                setWebcamFile(blob);
                setShowWebcam(false);
              }}
            />
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-400 rounded-lg hover:bg-gray-100"
        >
          ← Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !documentFile || !webcamFile}
          className="px-6 py-3 bg-green-500 text-white rounded-lg disabled:opacity-50 hover:bg-green-600"
        >
          {isSubmitting ? 'Processing...' : '✅ Complete Registration'}
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
