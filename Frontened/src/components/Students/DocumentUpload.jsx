import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Upload,
  FileText,
  Image,
  X,
  Check,
  ArrowLeft,
  UtensilsCrossed,
  GraduationCap,
  CreditCard,
  CheckCircle, // Added for a better UI experience
} from "lucide-react";

const DocumentUpload = ({ data, updateData, onPrev }) => {
  // NEW: State holds an object of files, keyed by their title, e.g., { "Student ID Card": File }
  const [uploadedFiles, setUploadedFiles] = useState(data.documents || {});

  // NEW: State tracks which specific box is being dragged over
  const [dragActive, setDragActive] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const acceptedFileTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const requiredDocuments = [
    {
      key: "studentIdCard",
      title: "Student ID Card",
      description: "Clear photo of your student identification card",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "hostelAllotmentLetter",
      title: "Hostel Allotment Letter",
      description: "Official hostel room allotment document",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      // Added the missing 'key' for consistency
      key: "feePaymentReceipt",
      title: "Fee Payment Receipt",
      description: "Proof of mess/canteen fee payment",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  // MODIFIED: Handlers now accept a 'docType' to know which box is being used
  const handleDrag = (e, docType) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(docType);
    } else {
      setDragActive(null);
    }
  };

  const handleDrop = (e, docType) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], docType);
    }
  };

  const handleChange = (e, docType) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], docType);
    }
  };

  // MODIFIED: Handles a single file for a specific document type
  const handleFile = (file, docType) => {
    if (!acceptedFileTypes.includes(file.type)) {
      toast.error(`File type ${file.type} is not supported`);
      return;
    }
    if (file.size > maxFileSize) {
      toast.error(`File is too large. Maximum size is 10MB`);
      return;
    }

    // Updates the state object with the new file
    const newFiles = { ...uploadedFiles, [docType]: file };
    setUploadedFiles(newFiles);
    updateData({ documents: newFiles });
  };

  // MODIFIED: Removes a file from the state object by its title
  const removeDocument = (docType) => {
    const newFiles = { ...uploadedFiles };
    delete newFiles[docType];
    setUploadedFiles(newFiles);
    updateData({ documents: newFiles });
  };

  const getFileIcon = (type) =>
    type === "application/pdf" ? (
      <FileText className="w-8 h-8 text-red-500" />
    ) : (
      <Image className="w-8 h-8 text-orange-500" />
    );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // NEW: A check to see if all required documents have been uploaded
  const allDocumentsUploaded =
    Object.keys(uploadedFiles).length === requiredDocuments.length;

  const handleSubmit = async () => {
    if (!allDocumentsUploaded) {
      toast.error("Please upload all required documents to continue.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    // Append files and their specific types to FormData
    requiredDocuments.forEach((doc) => {
      const file = uploadedFiles[doc.title];
      if (file) {
        formData.append("documents", file);
        formData.append("documentTypes", doc.key); // Send a consistent key to the backend
      }
    });

    try {
      const response = await axios.post(
        `http://13.232.235.205:5000/api/personaldetail/upload-documents/${data.studentId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Documents uploaded successfully!");
      updateData({
        documents: response.data.documents,
        verificationStatus: "pending",
      });

      // Delay setting isComplete to allow the toast notification to render first
      setTimeout(() => setIsComplete(true), 500);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload documents. Please try again.");
      setIsSubmitting(false); // Allow the user to try again on failure
    }
  };

  if (isComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-12 h-12 text-white" />
          </div>
        </div>
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          🎉 Welcome to PU FOOD HUB!
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Your registration is complete! Get ready for an amazing dining
          experience.
        </p>
        <div className="text-center text-gray-700">
          <button className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600" onClick={() => {
            window.location.href = "/";
          }}
          >
            Go to HOME
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <div className="flex items-center gap-2 text-orange-600">
            <UtensilsCrossed className="w-5 h-5" />
            <span className="font-semibold">Fresh Meals Daily</span>
          </div>
          <div className="flex items-center gap-2 text-amber-600">
            <span className="text-2xl">⭐</span>
            <span className="font-semibold">Premium Quality</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Upload Required Documents
        </h2>
        <p className="text-lg text-gray-600">
          Upload your documents to complete the registration process
        </p>
      </div>

      {/* REPLACEMENT: Individual upload boxes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {requiredDocuments.map((doc) => {
          const file = uploadedFiles[doc.title];
          const Icon = doc.icon;

          return (
            <div
              key={doc.title}
              className={`border rounded-2xl p-6 text-center transition-all ${
                doc.bgColor
              } ${
                dragActive === doc.title ? "transform scale-105 shadow-lg" : ""
              }`}
              onDragEnter={(e) => handleDrag(e, doc.title)}
              onDragLeave={(e) => handleDrag(e, null)}
              onDragOver={(e) => handleDrag(e, doc.title)}
              onDrop={(e) => handleDrop(e, doc.title)}
            >
              <div
                className={`w-16 h-16 rounded-xl mx-auto mb-4 flex justify-center items-center ${doc.bgColor}`}
              >
                <Icon className={`w-8 h-8 ${doc.color}`} />
              </div>
              <h3 className="font-bold text-gray-900">{doc.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{doc.description}</p>

              {file ? (
                // If file is uploaded, show its details
                <div className="flex items-center justify-between p-2 bg-white border rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 text-gray-500">
                      {getFileIcon(file.type).props.children}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 text-xs truncate max-w-28">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.title)}
                    className="hover:text-red-600 text-gray-400 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // If no file, show the "Upload File" button
                <label className="text-orange-600 font-bold underline cursor-pointer hover:text-orange-700">
                  Upload File
                  <input
                    type="file"
                    onChange={(e) => handleChange(e, doc.title)}
                    className="hidden"
                    accept={acceptedFileTypes.join(",")}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {/* The large, single dropzone and the separate file list have been removed */}

      <div className="flex justify-between mt-12">
        <button
          onClick={onPrev}
          className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
        >
          <ArrowLeft className="w-4 h-4 inline-block mr-2" />
          Previous
        </button>

        <button
          onClick={handleSubmit}
          // The button is disabled until all required documents are present
          disabled={isSubmitting || !allDocumentsUploaded}
          className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Processing..." : "Complete Registration"}
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
