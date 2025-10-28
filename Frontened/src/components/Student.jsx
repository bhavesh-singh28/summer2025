import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Eye,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  User,
  X as CloseIcon,
} from "lucide-react";

const PersonalDetails = () => {
  const [personalDetails, setPersonalDetails] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDocuments, setShowDocuments] = useState(false);
  const [showCompleteDetails, setShowCompleteDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [largeImageUrl, setLargeImageUrl] = useState("");
  const [generalError, setGeneralError] = useState("");
  const [generalSuccess, setGeneralSuccess] = useState("");

  const getAllpersonalDetails = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/personaldetail/view`)
      .then((res) => {
        if (res.data.status) setPersonalDetails(res.data.personaldetailList);
      })
      .catch((err) => console.error("Error fetching data:", err));
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
      setGeneralSuccess(`Documents ${status} successfully`);
      getAllpersonalDetails();
    } catch (error) {
      console.error("Verification error:", error);
      setGeneralError("Failed to update verification status");
    }
  };

  const viewLargeImage = (imageUrl) => {
    setLargeImageUrl(imageUrl);
    setShowImageModal(true);
  };

  const filteredDetails = personalDetails.filter((detail) => {
    const fullName = `${detail.firstname} ${detail.lastname}`.toLowerCase();
    const room = detail.roomno?.toString() || "";
    const phone = detail.phone?.toString() || "";
    return (
      fullName.includes(searchQuery.toLowerCase()) ||
      room.includes(searchQuery) ||
      phone.includes(searchQuery)
    );
  });

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

  const formatDocType = (type) =>
    type
      ? type.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
      : "Document";

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8 py-4">
      {generalError && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
          {generalError}
        </div>
      )}
      {generalSuccess && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
          {generalSuccess}
        </div>
      )}

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center sm:text-left">
        🎓 Student Management
      </h1>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-3">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, room, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Responsive table wrapper */}
      <div className="overflow-x-auto shadow-md rounded-lg bg-white">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-3 py-3">Image</th>
              <th className="px-3 py-3">Name</th>
              <th className="px-3 py-3">DOB</th>
              <th className="px-3 py-3">Phone</th>
              <th className="px-3 py-3">Room</th>
              <th className="px-3 py-3">Docs</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Details</th>
              <th className="px-3 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredDetails.map((detail, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 transition-all duration-200"
              >
                <td className="px-3 py-2">
                  <button
                    onClick={() => viewLargeImage(detail.imageUrl)}
                    className="focus:outline-none"
                  >
                    <img
                      src={detail.imageUrl}
                      alt={`${detail.firstname} ${detail.lastname}`}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200 hover:border-blue-500 transition"
                    />
                  </button>
                </td>
                <td className="px-3 py-2 font-medium text-gray-900">
                  {detail.firstname} {detail.lastname}
                </td>
                <td className="px-3 py-2 text-gray-600">
                  {detail.DOB || "—"}
                </td>
                <td className="px-3 py-2 text-gray-600">{detail.phone}</td>
                <td className="px-3 py-2">{detail.roomno || "—"}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center space-x-2">
                    <span>{detail.documents?.length || 0}</span>
                    {detail.documents?.length > 0 && (
                      <button
                        onClick={() => {
                          setSelectedStudent(detail);
                          setShowDocuments(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 flex items-center gap-2">
                  {getStatusIcon(detail.verificationStatus)}
                  <span className="capitalize">
                    {detail.verificationStatus || "pending"}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => {
                      setSelectedStudent(detail);
                      setShowCompleteDetails(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                  >
                    <User className="w-4 h-4" />
                    <span>View</span>
                  </button>
                </td>
                <td className="px-3 py-2 text-center">
                  {detail.verificationStatus === "pending" && (
                    <div className="flex flex-col sm:flex-row justify-center gap-2">
                      <button
                        onClick={() =>
                          handleVerifyDocuments(detail.studentid, "approved")
                        }
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs sm:text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() =>
                          handleVerifyDocuments(detail.studentid, "rejected")
                        }
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs sm:text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Image Viewer */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-3xl w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <CloseIcon className="w-8 h-8" />
            </button>
            <img
              src={largeImageUrl}
              alt="Student"
              className="w-full h-auto rounded-lg object-contain max-h-[80vh]"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Modal: Document Viewer (responsive grid) */}
      {showDocuments && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Documents - {selectedStudent.firstname}{" "}
                {selectedStudent.lastname}
              </h3>
              <button
                onClick={() => setShowDocuments(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <CloseIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedStudent.documents?.map((doc, i) => (
                <div
                  key={i}
                  className="border rounded-lg p-3 bg-gray-50 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-800 text-sm">
                      {formatDocType(doc.type)}
                    </h4>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  </div>
                  {doc.mimetype === "application/pdf" ? (
                    <iframe
                      src={doc.url}
                      title={doc.originalName}
                      className="w-full h-40 border rounded"
                    />
                  ) : (
                    <img
                      src={doc.url}
                      alt={doc.originalName}
                      className="w-full h-40 object-cover rounded"
                    />
                  )}
                  <p className="text-xs mt-2 truncate">{doc.originalName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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

    );};

export default PersonalDetails;
