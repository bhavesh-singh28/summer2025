import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Upload,
  FileText, // Keeping FileText just in case, but it won't be used for accepted types
  Image,
  X,
  Check,
  ArrowLeft,
  UtensilsCrossed,
  GraduationCap,
  CreditCard,
  CheckCircle,
} from "lucide-react";

const DocumentUpload = ({ data, updateData, onPrev }) => {
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    if (data.documents && Array.isArray(data.documents)) {
      return data.documents.reduce((acc, doc) => {
        const requiredDoc = requiredDocuments.find(rd => rd.key === doc.type);
        if (requiredDoc) {
          // Ensure that pre-loaded documents also adhere to the new type restriction
          // This assumes the backend also enforces it, but for frontend consistency:
          if (doc.mimetype === "image/png" || doc.mimetype === "image/jpeg") {
            acc[requiredDoc.title] = {
              name: doc.originalName,
              type: doc.type,
              mimetype: doc.mimetype, // Store mimetype for icon logic
              size: 0,
              url: doc.url
            };
          } else {
             // Optionally, log a warning or filter out non-image documents
             console.warn(`Pre-loaded document "${doc.originalName}" is not an allowed image type and will be ignored.`);
          }
        }
        return acc;
      }, {});
    }
    return {};
  });

  const [dragActive, setDragActive] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // MODIFIED: Only allow image types
  const acceptedFileTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
  ];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const requiredDocuments = [
    {
      key: "studentIdCard",
      title: "Student ID Card",
      description: "Clear photo of your student identification card (PNG or JPG)",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      key: "hostelAllotmentLetter",
      title: "Hostel Allotment Letter",
      description: "Official hostel room allotment document (PNG or JPG)",
      icon: FileText, // Keeping FileText icon, but content will be image
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      key: "feePaymentReceipt",
      title: "Fee Payment Receipt",
      description: "Proof of mess/canteen fee payment (PNG or JPG)",
      icon: CreditCard,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

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

  const handleFile = (file, docType) => {
    // Only allow image types
    if (!acceptedFileTypes.includes(file.type)) {
      toast.error(`File "${file.name}" is not a valid image type. Only PNG and JPG are supported.`);
      return;
    }
    if (file.size > maxFileSize) {
      toast.error(`File is too large. Maximum size is 10MB`);
      return;
    }

    const newFiles = { ...uploadedFiles, [docType]: file };
    setUploadedFiles(newFiles);
  };

  const removeDocument = (docType) => {
    const newFiles = { ...uploadedFiles };
    delete newFiles[docType];
    setUploadedFiles(newFiles);
  };

  // MODIFIED: getFileIcon will now always return an Image icon
  const getFileIcon = () => (
    <Image className="w-8 h-8 text-orange-500" />
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const allDocumentsUploaded =
    Object.keys(uploadedFiles).length === requiredDocuments.length;

  const handleSubmit = async () => {
    if (!allDocumentsUploaded) {
      toast.error("Please upload all required documents to continue.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    requiredDocuments.forEach((doc) => {
      const file = uploadedFiles[doc.title];
      if (file) {
        formData.append("documents", file);
        formData.append("documentTypes[]", doc.key);
      }
    });

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/personaldetail/upload-documents/${data.studentId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Documents uploaded successfully!");
      
      const documentsWithUrls = {};
      response.data.documents.forEach((uploadedDoc) => {
        const originalDoc = requiredDocuments.find(rd => rd.key === uploadedDoc.type);
        if (originalDoc) {
          documentsWithUrls[originalDoc.title] = {
            name: uploadedDoc.originalName,
            type: uploadedDoc.type,
            mimetype: uploadedDoc.mimetype, // Make sure to store mimetype
            size: 0,
            url: uploadedDoc.url
          };
        }
      });

      setUploadedFiles(documentsWithUrls);
      updateData({
        documents: response.data.documents,
        verificationStatus: "pending",
      });

      setTimeout(() => setIsComplete(true), 500);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload documents. Please try again.");
      setIsSubmitting(false);
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {requiredDocuments.map((doc) => {
          const file = uploadedFiles[doc.title];
          const Icon = doc.icon; // This icon will still render based on `requiredDocuments` definition

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
                <div className="flex items-center justify-between p-2 bg-white border rounded-lg shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 text-gray-500">
                      {getFileIcon().props.children} {/* Always show image icon now */}
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
                <label className="text-orange-600 font-bold underline cursor-pointer hover:text-orange-700">
                  Upload File
                  <input
                    type="file"
                    onChange={(e) => handleChange(e, doc.title)}
                    className="hidden"
                    // MODIFIED: Only accept image file extensions
                    accept=".png, .jpg, .jpeg"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

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