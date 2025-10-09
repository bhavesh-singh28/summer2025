import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
} from "lucide-react";

const StudentVerificationManager = () => {
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [allVerifications, setAllVerifications] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [generalSuccess, setGeneralSuccess] = useState("");

  // Fetch pending verifications
  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/personaldetail/pending-verifications`
      );
      if (response.data.status) {
        setPendingVerifications(response.data.pendingVerifications);
      }
    } catch (error) {
      console.error("Error fetching pending verifications:", error);
      setGeneralError("Failed to fetch pending verifications");
    } finally {
      setLoading(false);
    }
  };

  // Fetch all verifications
  const fetchAllVerifications = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/personaldetail/all-verifications`
      );
      if (response.data.status) {
        setAllVerifications(response.data.verifications);
      }
    } catch (error) {
      console.error("Error fetching all verifications:", error);
      setGeneralError("Failed to fetch verifications");
    } finally {
      setLoading(false);
    }
  };

  // Handle verification decision
  const handleVerification = async (studentId, status) => {
    try {
      setLoading(true);
      const response = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/personaldetail/verify-documents/${studentId}`,
        { status }
      );

      if (response.status === 200) {
        const action = status === "approved" ? "approved" : "rejected";
        setGeneralSuccess(`Student verification ${action} successfully!`);

        if (status === "approved" && response.data.emailSent) {
          setGeneralSuccess((s) => s + " Login credentials sent to student's email!");
        }

        // Refresh data
        await fetchPendingVerifications();
        await fetchAllVerifications();
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setGeneralError("Failed to update verification status");
    } finally {
      setLoading(false);
    }
  };

  // View student details
  const viewStudentDetails = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  useEffect(() => {
    fetchPendingVerifications();
    fetchAllVerifications();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
    }
  };

  const StudentCard = ({ student, showActions = true }) => (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {student.firstname} {student.lastname}
            </h3>
            <p className="text-sm text-gray-500">ID: {student.studentid}</p>
          </div>
        </div>
        {getStatusBadge(student.verificationStatus)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center space-x-2">
          <Mail className="w-4 h-4 text-gray-400" />
          <span>{student.email}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span>{student.phone}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>{student.DOB}</span>
        </div>
        <div className="flex items-center space-x-2">
          <GraduationCap className="w-4 h-4 text-gray-400" />
          <span>
            {student.hostelblock} - Room {student.roomno}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <FileText className="w-4 h-4" />
          <span>{student.documents?.length || 0} documents uploaded</span>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => viewStudentDetails(student)}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center space-x-1"
          >
            <Eye className="w-3 h-3" />
            <span>View</span>
          </button>

          {showActions && student.verificationStatus === "pending" && (
            <>
              <button
                onClick={() =>
                  handleVerification(student.studentid, "approved")
                }
                disabled={loading}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Approve</span>
              </button>
              <button
                onClick={() =>
                  handleVerification(student.studentid, "rejected")
                }
                disabled={loading}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center space-x-1 disabled:opacity-50"
              >
                <XCircle className="w-3 h-3" />
                <span>Reject</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {generalError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">{generalError}</div>}
      {generalSuccess && <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md">{generalSuccess}</div>}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Student Verification Manager
        </h1>
        <p className="text-gray-600">
          Review and approve student verification requests
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "pending"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Pending ({pendingVerifications.length})
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === "all"
              ? "bg-blue-100 text-blue-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          All Verifications ({allVerifications.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {activeTab === "pending" && (
            <>
              {pendingVerifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Pending Verifications
                  </h3>
                  <p className="text-gray-600">
                    All verification requests have been processed.
                  </p>
                </div>
              ) : (
                pendingVerifications.map((student) => (
                  <StudentCard key={student._id} student={student} />
                ))
              )}
            </>
          )}

          {activeTab === "all" && (
            <>
              {allVerifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Verifications
                  </h3>
                  <p className="text-gray-600">
                    No student verification requests found.
                  </p>
                </div>
              ) : (
                allVerifications.map((student) => (
                  <StudentCard
                    key={student._id}
                    student={student}
                    showActions={false}
                  />
                ))
              )}
            </>
          )}
        </div>
      )}

      {/* Student Details Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Student Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Name:</span>{" "}
                      {selectedStudent.firstname} {selectedStudent.lastname}
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedStudent.email}
                    </div>
                    <div>
                      <span className="font-medium">Phone:</span>{" "}
                      {selectedStudent.phone}
                    </div>
                    <div>
                      <span className="font-medium">DOB:</span>{" "}
                      {selectedStudent.DOB}
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                    Address Information
                  </h3>
                  <div className="text-sm">
                    <p>
                      {selectedStudent.address}, {selectedStudent.city},{" "}
                      {selectedStudent.state} - {selectedStudent.zipcode}
                    </p>
                  </div>
                </div>

                {/* Hostel Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
                    Hostel Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Student ID:</span>{" "}
                      {selectedStudent.studentid}
                    </div>
                    <div>
                      <span className="font-medium">Hostel Block:</span>{" "}
                      {selectedStudent.hostelblock}
                    </div>
                    <div>
                      <span className="font-medium">Room Number:</span>{" "}
                      {selectedStudent.roomno}
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Documents ({selectedStudent.documents?.length || 0})
                  </h3>
                  {selectedStudent.documents &&
                  selectedStudent.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedStudent.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                          <div>
                            <p className="font-medium text-sm">{doc.type}</p>
                            <p className="text-xs text-gray-600">
                              {doc.originalName}
                            </p>
                          </div>
                          <a
                            href={`${import.meta.env.VITE_BACKEND_URL}/${doc.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                          >
                            <Download className="w-4 h-4" />
                            <span>View</span>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">
                      No documents uploaded
                    </p>
                  )}
                </div>

                {/* Verification Actions */}
                {selectedStudent.verificationStatus === "pending" && (
                  <div className="flex space-x-4 pt-4 border-t">
                    <button
                      onClick={() =>
                        handleVerification(
                          selectedStudent.studentid,
                          "approved"
                        )
                      }
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Send Credentials</span>
                    </button>
                    <button
                      onClick={() =>
                        handleVerification(
                          selectedStudent.studentid,
                          "rejected"
                        )
                      }
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentVerificationManager;
