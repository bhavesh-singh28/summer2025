import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  User,
  X as CloseIcon,
} from "lucide-react";
import "react-toastify/dist/ReactToastify.css";

const PersonalDetails = () => {
  const [personalDetails, setPersonalDetails] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showCompleteDetails, setShowCompleteDetails] = useState(false);

  // NEW: State for the image viewer modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [largeImageUrl, setLargeImageUrl] = useState("");

  const getAllpersonalDetails = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/personaldetail/view`)
      .then((res) => {
        if (res.data.status) {
          setPersonalDetails(res.data.personaldetailList);
        }
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  };

  useEffect(() => {
    getAllpersonalDetails();
  }, []);

  const handleVerifyDocuments = async (studentId, status) => {
    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/personaldetail/verify-documents/${studentId}`,
        { status }
      );
      toast.success(`Documents ${status} successfully`);
      getAllpersonalDetails(); // Refresh data to show updated status
    } catch (error) {
      console.error("Verification error:", error);
      toast.error("Failed to update verification status");
    }
  };

  // NEW: Function to open the image modal
  const viewLargeImage = (imageUrl) => {
    setLargeImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const viewDocuments = (student) => {
    setSelectedStudent(student);
    setShowDocuments(true);
  };

  const viewCompleteDetails = (student) => {
    setSelectedStudent(student);
    setShowCompleteDetails(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  // NEW: Helper function to format document types for better readability
  const formatDocType = (type) => {
    if (!type) return "Document";
    // Adds a space before each capital letter (e.g., "studentIdCard" -> "Student Id Card")
    return type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="w-auto mx-auto no-scrollbar">
      <div className="space-y-6 p-4 md:p-6 lg:p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          🎓 Student Management
        </h1>

        <div className="flex justify-between items-center">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto rounded-lg shadow bg-white">
          <table className="w-full table-auto border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left text-sm uppercase text-gray-600">
                <th className="px-4 py-4 whitespace-nowrap">Image</th>
                <th className="px-4 py-4 whitespace-nowrap">Name</th>
                <th className="px-4 py-4 whitespace-nowrap">DOB</th>
                <th className="px-4 py-4 whitespace-nowrap">Phone</th>
                <th className="px-4 py-4 whitespace-nowrap">Room</th>
                <th className="px-4 py-4 whitespace-nowrap">Documents</th>
                <th className="px-4 py-4 whitespace-nowrap">Status</th>
                <th className="px-4 py-4 whitespace-nowrap">
                  Complete Details
                </th>
                <th className="px-4 py-4 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody>
              {personalDetails.map((detail, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition-all duration-200"
                >
                  <td className="px-4 py-2">
                    <button
                      onClick={() => viewLargeImage(detail.imageUrl)}
                      className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full"
                    >
                      <img
                        src={detail.imageUrl}
                        alt={`${detail.firstname} ${detail.lastname}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 hover:border-blue-500 transition"
                      />
                    </button>
                  </td>
                  <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {detail.firstname} {detail.lastname}
                  </td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                    {detail.DOB}
                  </td>
                  <td className="px-4 py-4 text-gray-600 whitespace-nowrap">
                    {detail.phone}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {detail.roomno}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">
                        {detail.documents?.length || 0} files
                      </span>
                      {detail.documents?.length > 0 && (
                        <button
                          onClick={() => viewDocuments(detail)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(detail.verificationStatus)}
                      <span className="text-sm capitalize">
                        {detail.verificationStatus || "pending"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={() => viewCompleteDetails(detail)}
                      className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm">View</span>
                    </button>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {detail.documents?.length > 0 &&
                        detail.verificationStatus === "pending" && (
                          <>
                            {/* ✅ Approve button */}
                            <button
                              onClick={async () => {
                                setPersonalDetails((prev) =>
                                  prev.map((item) =>
                                    item.studentid === detail.studentid
                                      ? { ...item, approving: true }
                                      : item
                                  )
                                );
                                await handleVerifyDocuments(
                                  detail.studentid,
                                  "approved"
                                );
                                setPersonalDetails((prev) =>
                                  prev.map((item) =>
                                    item.studentid === detail.studentid
                                      ? { ...item, approving: false }
                                      : item
                                  )
                                );
                              }}
                              disabled={detail.approving}
                              className={`flex items-center bg-green-500 text-white px-3 py-1 rounded text-sm 
              ${
                detail.approving
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-green-600"
              }`}
                            >
                              {detail.approving ? (
                                <>
                                  <svg
                                    className="mr-2 h-4 w-4 animate-spin text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                  </svg>
                                  Processing…
                                </>
                              ) : (
                                "Approve"
                              )}
                            </button>

                            {/* ❌ Reject button */}
                            <button
                              onClick={async () => {
                                setPersonalDetails((prev) =>
                                  prev.map((item) =>
                                    item.studentid === detail.studentid
                                      ? { ...item, rejecting: true }
                                      : item
                                  )
                                );
                                await handleVerifyDocuments(
                                  detail.studentid,
                                  "rejected"
                                );
                                setPersonalDetails((prev) =>
                                  prev.map((item) =>
                                    item.studentid === detail.studentid
                                      ? { ...item, rejecting: false }
                                      : item
                                  )
                                );
                              }}
                              disabled={detail.rejecting}
                              className={`flex items-center bg-red-500 text-white px-3 py-1 rounded text-sm 
              ${
                detail.rejecting
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-red-600"
              }`}
                            >
                              {detail.rejecting ? (
                                <>
                                  <svg
                                    className="mr-2 h-4 w-4 animate-spin text-white"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                    ></path>
                                  </svg>
                                  Processing…
                                </>
                              ) : (
                                "Reject"
                              )}
                            </button>
                          </>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL 1: Image Viewer Modal */}
        {showImageModal && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-50"
              aria-label="Close image viewer"
            >
              <CloseIcon className="w-8 h-8" />
            </button>
            <div className="relative max-w-3xl max-h-[90vh]">
              <img
                src={largeImageUrl}
                alt="Student Profile"
                className="w-full h-auto object-contain rounded-lg shadow-lg"
                onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking the image
              />
            </div>
          </div>
        )}

        {/* MODAL 2: Redesigned Document Viewer Modal */}
        {showDocuments && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Documents - {selectedStudent.firstname}{" "}
                  {selectedStudent.lastname}
                </h3>
                <button
                  onClick={() => setShowDocuments(false)}
                  className="text-gray-400 hover:text-gray-700 p-1 rounded-full"
                  aria-label="Close document viewer"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {selectedStudent.documents?.map((doc, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-xl p-4 shadow-sm bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-lg text-gray-800">
                        {formatDocType(doc.type)}
                      </h4>
                      <a
                        href={`http://localhost:5000/${doc.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition"
                        title="Download Document"
                      >
                        <Download className="w-5 h-5" />
                      </a>
                    </div>
                    <p
                      className="text-sm text-gray-600 mb-1 truncate"
                      title={doc.originalName}
                    >
                      {doc.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODAL 3: Complete Details Modal */}
        {showCompleteDetails && selectedStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Complete Student Details
                </h3>
                <button
                  onClick={() => setShowCompleteDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                  aria-label="Close details viewer"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.firstname}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.lastname}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.phone}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {new Date(selectedStudent.DOB).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-green-800 mb-4">
                    Address Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.address}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.city}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.state}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.zipcode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Student & Hostel Information */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-purple-800 mb-4">
                    Student & Hostel Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Student ID
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border font-mono">
                        {selectedStudent.studentid}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hostel Block
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.hostelblock}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Room Number
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.roomno}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Document Status */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-6">
                  <h4 className="text-lg font-semibold text-orange-800 mb-4">
                    Document Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Documents Uploaded
                      </label>
                      <p className="text-gray-900 bg-white px-3 py-2 rounded border">
                        {selectedStudent.documents?.length || 0} files
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Verification Status
                      </label>
                      <div className="flex items-center space-x-2 bg-white px-3 py-2 rounded border">
                        {getStatusIcon(selectedStudent.verificationStatus)}
                        <span className="capitalize">
                          {selectedStudent.verificationStatus || "pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalDetails;
