import React, { useState } from "react";
import axios from "axios";
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
  Sparkles,
  RotateCw,
} from "lucide-react";

const DocumentUpload = ({ data, updateData, onPrev, isTestMode }) => {
  const [uploadedFiles, setUploadedFiles] = useState(() => {
    if (data.documents && Array.isArray(data.documents)) {
      return data.documents.reduce((acc, doc) => {
        const requiredDoc = requiredDocuments.find(rd => rd.key === doc.type);
        if (requiredDoc) {
          if (doc.mimetype === "image/png" || doc.mimetype === "image/jpeg") {
            acc[requiredDoc.title] = {
              name: doc.originalName,
              type: doc.type,
              mimetype: doc.mimetype,
              size: 0,
              url: doc.url
            };
          } else {
            console.warn(`Pre-loaded document "${doc.originalName}" ignored (not PNG/JPG).`);
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
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [generalSuccess, setGeneralSuccess] = useState("");

  // 🧪 Helper to populate mock valid test documents (50KB - 200KB)
  const fillTestDocuments = () => {
    const mockBlob = new Blob([new Uint8Array(80 * 1024)], { type: "image/png" });
    const testDocs = {
      "Student ID Card": new File([mockBlob], "test_student_id.png", { type: "image/png" }),
      "Hostel Allotment Letter": new File([mockBlob], "test_hostel_allotment.png", { type: "image/png" }),
      "Fee Payment Receipt": new File([mockBlob], "test_fee_receipt.png", { type: "image/png" }),
    };
    setUploadedFiles(testDocs);
    setErrors({});
    setGeneralSuccess("All 3 test documents attached!");
  };

  // Accept only images
  const acceptedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
  const maxFileSize = 10 * 1024 * 1024; // 10 MB
  const minSizeKB = 50;
  const maxSizeKB = 200;

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
      icon: FileText,
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
    setErrors(prev => ({ ...prev, [docType]: null }));

    if (!acceptedFileTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [docType]: `File "${file.name}" is not valid. Only PNG and JPG are allowed.`,
      }));
      return;
    }

    const sizeKB = file.size / 1024;

    if (sizeKB < minSizeKB || sizeKB > maxSizeKB) {
      setErrors(prev => ({
        ...prev,
        [docType]: `File "${file.name}" must be between 50KB and 200KB (current: ${sizeKB.toFixed(
          1
        )}KB).`,
      }));
      return;
    }

    setUploadedFiles(prev => ({ ...prev, [docType]: file }));
  };

  const removeDocument = (docType) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[docType];
      return newFiles;
    });
  };

  const getFileIcon = () => <Image className="w-8 h-8 text-orange-500" />;

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const allDocumentsUploaded =
    Object.keys(uploadedFiles).length === requiredDocuments.length;

  const handleSubmit = async () => {
    setGeneralError("");
    setGeneralSuccess("");

    if (!allDocumentsUploaded) {
      setGeneralError("Please upload all required documents to continue.");
      return;
    }

    setIsSubmitting(true);

    // 🧪 In Test Mode: bypass backend upload!
    if (isTestMode || data?.isTestMode) {
      setTimeout(() => {
        setIsSubmitting(false);
        setGeneralSuccess("Documents verified! (Test Mode - No backend saved)");
        updateData({
          documents: [
            { type: "studentIdCard", originalName: "test_student_id.png" },
            { type: "hostelAllotmentLetter", originalName: "test_hostel_allotment.png" },
            { type: "feePaymentReceipt", originalName: "test_fee_receipt.png" },
          ],
          verificationStatus: "pending",
        });
        setTimeout(() => setIsComplete(true), 400);
      }, 600);
      return;
    }

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

      setGeneralSuccess("Documents uploaded successfully!");
      const documentsWithUrls = {};
      response.data.documents.forEach((uploadedDoc) => {
        const originalDoc = requiredDocuments.find(rd => rd.key === uploadedDoc.type);
        if (originalDoc) {
          documentsWithUrls[originalDoc.title] = {
            name: uploadedDoc.originalName,
            type: uploadedDoc.type,
            mimetype: uploadedDoc.mimetype,
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
      setGeneralError("Failed to upload documents. Please try again.");
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
        <p className="text-xl text-gray-600 mb-6">
          Your registration is complete! Get ready for an amazing dining experience.
        </p>

        {(isTestMode || data?.isTestMode) && (
          <div className="mb-8 p-5 bg-orange-50 border border-orange-200 rounded-2xl max-w-md mx-auto text-left shadow-sm">
            <span className="font-bold text-orange-900 flex items-center gap-1.5 text-sm mb-2">
              <Sparkles className="w-4 h-4 text-orange-600" />
              Test Registration Preview Complete
            </span>
            <div className="space-y-1 text-xs text-orange-800">
              <p>Name: <span className="font-semibold text-gray-900">{data.firstName} {data.lastName}</span></p>
              <p>Unique Roll No: <span className="font-semibold text-gray-900">{data.studentId}</span></p>
              <p>Email: <span className="font-semibold text-gray-900">{data.email}</span></p>
            </div>
            <p className="mt-3 text-[11px] text-gray-500 border-t border-orange-200 pt-2">
              ✓ Pure frontend visualization — No records written to backend database.
            </p>
          </div>
        )}

        <button
          className="bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 font-semibold cursor-pointer shadow-md transition"
          onClick={() => (window.location.href = "/")}
        >
          Go to HOME
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        {generalError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {generalError}
          </div>
        )}
        {generalSuccess && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">
            {generalSuccess}
          </div>
        )}
        <div className="w-24 h-24 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Upload Required Documents
        </h2>
        <p className="text-lg text-gray-600">
          Upload your documents to complete the registration process.
        </p>
        <p className="text-sm text-gray-500 mt-2">
          <strong>Note:</strong> Only{" "}
          <span className="text-orange-600 font-semibold">PNG</span> or{" "}
          <span className="text-orange-600 font-semibold">JPG</span> files are allowed,
          and each image must be between{" "}
          <span className="font-semibold">50KB–200KB</span>.
        </p>
      </div>

      {/* Test Documents Helper */}
      <div className="mb-6 p-4 rounded-2xl bg-orange-50 border-2 border-dashed border-orange-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div>
          <p className="text-sm font-bold text-orange-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-600" />
            Test Signup: Auto-attach Documents
          </p>
          <p className="text-xs text-orange-700">
            Attaches valid sample files for Student ID, Hostel Allotment, and Fee Receipt.
          </p>
        </div>
        <button
          type="button"
          onClick={fillTestDocuments}
          className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm rounded-xl hover:from-orange-600 hover:to-amber-600 shadow transition cursor-pointer whitespace-nowrap"
        >
          Attach Test Documents
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {requiredDocuments.map((doc) => {
          const file = uploadedFiles[doc.title];
          const Icon = doc.icon;

          return (
            <div
              key={doc.title}
              className={`border rounded-2xl p-6 text-center transition-all ${doc.bgColor} ${
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
                    <Image className="w-6 h-6 text-orange-500" />
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
                    accept=".png, .jpg, .jpeg"
                  />
                </label>
              )}

              {errors[doc.title] && (
                <p className="text-red-600 text-sm mt-2">{errors[doc.title]}</p>
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
          className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isSubmitting ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Complete Registration</span>
          )}
        </button>
      </div>
    </div>
  );
};

export default DocumentUpload;
