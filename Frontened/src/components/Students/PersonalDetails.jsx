// ⬇️ NEW: Import necessary hooks, Webcam component, and new icons
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import Webcam from "react-webcam"; // NEW: Import Webcam
import {
  User,
  Home,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Camera,
  X,
  Check, // Icon for confirm button
  RefreshCw, // Icon for retake button
  Sparkles,
} from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const PersonalDetails = ({ data, updateData, onNext, onPrev, isTestMode }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false); // To prevent multiple submissions
  const [errors, setErrors] = useState({}); // field-level errors
  const [generalError, setGeneralError] = useState("");
  const [generalSuccess, setGeneralSuccess] = useState("");

  // ⬇️ NEW: State for camera modal and image handling
  const [showCamera, setShowCamera] = useState(false);
  const [imgSrc, setImgSrc] = useState(null); // Stores the base64 image
  const webcamRef = useRef(null);

  const [formData, setFormData] = useState({
    firstname: data?.firstName || "",
    lastname: data?.lastName || "",
    phone: data?.phone || "",
    email: data?.email || "",
    DOB: data?.dateOfBirth || "",
    address: data?.address || "",
    city: data?.city || "",
    state: data?.state || "",
    zipcode: data?.zipCode || "",
    studentid: data?.studentId || "",
    hostelblock: data?.hostelBlock || "",
    roomno: data?.roomNumber || "",
    imageUrl: data?.imageUrl || "", // Field to store the image URL from Cloudinary
  });

  useEffect(() => {
    if (data?.email && !formData.email) {
      setFormData((prev) => ({ ...prev, email: data.email }));
    }
  }, [data?.email]);

  // 🧪 Helper to fill test data with consistent fields and unique roll number
  const fillTestData = () => {
    // Generate unique Roll No / Student ID (digits only as required by validation)
    const uniqueRollNo = `25010${Math.floor(1000 + Math.random() * 9000)}`;
    const currentEmail =
      data?.email ||
      formData.email ||
      `student.${Math.floor(100000 + Math.random() * 900000)}@pu.ac.in`;

    // High quality sample avatar SVG
    const sampleAvatar =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23fed7aa'/%3E%3Ccircle cx='100' cy='75' r='40' fill='%23ea580c'/%3E%3Cpath d='M30 180 c0-40 30-65 70-65 s70 25 70 65 Z' fill='%23ea580c'/%3E%3C/svg%3E";

    setFormData((prev) => ({
      ...prev,
      firstname: "Aarav",
      lastname: "Patel",
      phone: "9876543210",
      email: currentEmail,
      DOB: "2003-08-22",
      address: "Room 304, Boys Hostel No 4, PU South Campus",
      city: "Chandigarh",
      state: "Punjab",
      zipcode: "160014",
      studentid: uniqueRollNo,
      hostelblock: "BH-4",
      roomno: "304",
      imageUrl: sampleAvatar,
    }));
    setImgSrc(sampleAvatar);
    setErrors({});
    setGeneralError("");
    setGeneralSuccess(`Test data filled with Unique Roll No: ${uniqueRollNo}`);
  };

  // ⬇️ NEW: Function to capture the image from the webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc); // Store the base64 string
  }, [webcamRef]);

  // ⬇️ MODIFIED: This function now only validates and opens the camera
  const handleNext = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSubmitting || hasSubmitted) {
      return;
    }

    // First, validate the form
    if (!validateForm()) {
      return;
    }

    // 🧪 In Test Mode: bypass backend existence check, camera requirement & backend saving!
    if (isTestMode || data?.isTestMode) {
      setIsSubmitting(true);
      setGeneralSuccess("Test data validated! Proceeding to documents (No backend saved)...");

      const mappedData = {
        firstName: formData.firstname,
        lastName: formData.lastname,
        phone: formData.phone,
        email: formData.email,
        dateOfBirth: formData.DOB,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipcode,
        studentId: formData.studentid,
        hostelBlock: formData.hostelblock,
        roomNumber: formData.roomno,
        imageUrl: formData.imageUrl || imgSrc,
        isTestMode: true,
      };

      updateData(mappedData);

      setTimeout(() => {
        setIsSubmitting(false);
        onNext();
      }, 500);
      return;
    }

    // NEW: Ask backend whether this studentid exists (single-record check)
    try {
      const studentId = String(formData.studentid || "").trim();
      if (!studentId) {
        setErrors((prev) => ({
          ...prev,
          studentid: "Student ID is required.",
        }));
        return;
      }

      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/personaldetail/exists/${encodeURIComponent(studentId)}`
      );
      if (res.data && res.data.exists) {
        setErrors((prev) => ({
          ...prev,
          studentid: "This Student ID already exists.",
        }));
        setGeneralError(
          "A student with this roll number already exists. If this is you, please contact admin."
        );
        return;
      }
    } catch (err) {
      console.error("Error checking student ID uniqueness:", err);
      setGeneralError(
        "Could not verify Student ID uniqueness due to a network error. Please try again."
      );
      return;
    }

    // If form is valid and studentid is unique, show the camera modal to capture the image
    setShowCamera(true);
  };

  // ⬇️ MODIFIED: This function now handles the image upload to YOUR BACKEND
  //              and then the rest of the form submission.
  const uploadImageAndContinue = async () => {
    // In Test Mode: bypass backend upload!
    if (isTestMode || data?.isTestMode) {
      setIsSubmitting(true);
      const mappedData = {
        firstName: formData.firstname,
        lastName: formData.lastname,
        phone: formData.phone,
        email: formData.email,
        dateOfBirth: formData.DOB,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipcode,
        studentId: formData.studentid,
        hostelBlock: formData.hostelblock,
        roomNumber: formData.roomno,
        imageUrl: formData.imageUrl || imgSrc,
        isTestMode: true,
      };
      updateData(mappedData);
      setTimeout(() => {
        setIsSubmitting(false);
        setShowCamera(false);
        onNext();
      }, 500);
      return;
    }

    if (!imgSrc) {
      setErrors((e) => ({
        ...e,
        image: "Please capture an image before continuing.",
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ STEP 1: Upload image to your backend which then sends it to Cloudinary
      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/personaldetail/upload-profile-image`, // New backend endpoint
        { image: imgSrc } // Send the base64 image data
      );

      if (uploadResponse.data.status === 1) {
        const imageUrl = uploadResponse.data.imageUrl;
        setGeneralSuccess("Image uploaded successfully!");

        const updatedFormData = { ...formData, imageUrl };
        setFormData(updatedFormData); // Update form data with the Cloudinary URL

        // ✅ STEP 2: Continue with your original database submission logic
        let saveSuccessful = false;
        try {
          const existingStudent = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/personaldetail/view`
          );
          const studentExists = existingStudent.data.personaldetailList?.some(
            (student) =>
              student.studentid === updatedFormData.studentid ||
              student.email === updatedFormData.email
          );

          if (!studentExists) {
            await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/personaldetail/insert`,
              updatedFormData // Send data with the new imageUrl
            );
            setGeneralSuccess("Personal details saved successfully");
            saveSuccessful = true;
          } else {
            setGeneralSuccess(
              "Student already exists, proceeding to next step"
            );
            saveSuccessful = true;
          }
        } catch (dbError) {
          console.error("Database error:", dbError);
          // Fallback insert attempt
          try {
            await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/personaldetail/insert`,
              updatedFormData
            );
            setGeneralSuccess("Personal details saved successfully");
            saveSuccessful = true;
          } catch (insertError) {
            if (insertError.response?.status === 400) {
              setGeneralSuccess(
                "Student already exists, proceeding to next step"
              );
              saveSuccessful = true;
            } else {
              setGeneralError("Failed to save personal details");
              setIsSubmitting(false);
              return;
            }
          }
        }

        if (saveSuccessful) {
          setHasSubmitted(true);
        }

        const mappedData = {
          firstName: updatedFormData.firstname,
          lastName: updatedFormData.lastname,
          phone: updatedFormData.phone,
          email: updatedFormData.email,
          dateOfBirth: updatedFormData.DOB,
          address: updatedFormData.address,
          city: updatedFormData.city,
          state: updatedFormData.state,
          zipCode: updatedFormData.zipcode,
          studentId: updatedFormData.studentid,
          hostelBlock: updatedFormData.hostelblock,
          roomNumber: updatedFormData.roomno,
          imageUrl: updatedFormData.imageUrl, // Pass the URL to the parent
        };

        updateData(mappedData);

        setTimeout(() => {
          onNext();
        }, 100);
      } else {
        setGeneralError(
          uploadResponse.data.message || "Failed to upload image."
        );
      }
    } catch (error) {
      console.error("Error uploading image or saving data:", error);
      setGeneralError("Failed to upload image or save data.");
    } finally {
      setIsSubmitting(false);
      setShowCamera(false); // Close the modal
      setImgSrc(null); // Reset the image source
    }
  };

  const validateForm = () => {
    setErrors({});
    setGeneralError("");
    setGeneralSuccess("");

    const requiredFields = [
      "firstname",
      "lastname",
      "phone",
      "email",
      "DOB",
      "address",
      "city",
      "state",
      "zipcode",
      "studentid",
      "hostelblock",
      "roomno",
    ];
    const newErrors = {};

    // Empty field check
    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = `${field
          .replace(/([A-Z])/g, " $1")
          .toLowerCase()} is required.`;
      }
    }

    // Name validation (no numbers)
    const nameRegex = /^[A-Za-z\s]+$/;
    if (formData.firstname && !nameRegex.test(formData.firstname)) {
      newErrors.firstname = "First name should only contain letters.";
    }
    if (formData.lastname && !nameRegex.test(formData.lastname)) {
      newErrors.lastname = "Last name should only contain letters.";
    }

    // City and state validation (no numbers)
    if (formData.city && !nameRegex.test(formData.city)) {
      newErrors.city = "City name should only contain letters.";
    }
    if (formData.state && !nameRegex.test(formData.state)) {
      newErrors.state = "State name should only contain letters.";
    }

    // Zipcode validation (6 digits)
    const zipRegex = /^\d{6}$/;
    if (formData.zipcode && !zipRegex.test(formData.zipcode)) {
      newErrors.zipcode = "Zipcode must be exactly 6 digits.";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Phone number validation (10 digits)
    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number.";
    }

    // DOB validation (not in the future)
    if (formData.DOB) {
      const dobDate = new Date(formData.DOB);
      const today = new Date();
      const minDOB = new Date("1950-01-01");

      if (dobDate > today) {
        newErrors.DOB = "Date of Birth cannot be in the future.";
      } else if (dobDate < minDOB) {
        newErrors.DOB = "Date of Birth cannot be before 1950.";
      }
    }

    // Student ID validation (only digits)
    const studentIdRegex = /^\d+$/;
    if (formData.studentid && !studentIdRegex.test(formData.studentid)) {
      newErrors.studentid = "Student ID should contain only digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getValue = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // No longer strictly necessary to fetch all personal details on mount
  // as the existence check is done on submission, but kept if other parts rely on it.
  const getAllpersonalDetails = () => {
    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/personaldetail/view`)
      .then((res) => {
        // This data isn't directly used by the component for display,
        // but might be useful for debugging or other logic if needed.
        // setPersonalDetails(res.data.personaldetailList);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
      });
  };

  useEffect(() => {
    getAllpersonalDetails();
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      {/* General banners for success/error */}
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
      {/* --- IMPROVED CAMERA MODAL --- */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-95 hover:scale-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                Capture Your Profile Photo
              </h3>
              <button
                onClick={() => {
                  setShowCamera(false);
                  setImgSrc(null);
                }}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="relative w-full aspect-square rounded-full overflow-hidden mx-auto max-w-xs border-4 border-gray-200 shadow-inner">
              {imgSrc ? (
                <img
                  src={imgSrc}
                  alt="Captured Screenshot"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg" // Keep JPEG for smaller size
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: "user" }} // Use front camera
                />
              )}
            </div>

            <p className="text-center text-gray-500 mt-4 text-sm">
              Please center your face in the circle.
            </p>

            <div className="mt-6 flex justify-center gap-4">
              {imgSrc ? (
                <>
                  <button
                    onClick={() => setImgSrc(null)}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-100 font-semibold transition-transform transform hover:scale-105"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Retake
                  </button>
                  <button
                    onClick={uploadImageAndContinue}
                    className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full hover:bg-green-600 font-semibold transition-transform transform hover:scale-105 shadow-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Uploading & Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Confirm & Save</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={capture}
                  className="w-20 h-20 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-semibold flex items-center justify-center transition-transform transform hover:scale-110 shadow-xl border-4 border-white"
                  aria-label="Capture Photo"
                >
                  <Camera className="w-8 h-8" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- Your existing form JSX below --- */}
      <div>
        {/* Test Personal Details Helper */}
        <div className="mb-6 p-4 rounded-2xl bg-orange-50 border-2 border-dashed border-orange-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div>
            <p className="text-sm font-bold text-orange-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              Test Signup: Auto-fill Form
            </p>
            <p className="text-xs text-orange-700">
              Fills all required personal fields with consistent test data & a unique roll number.
            </p>
          </div>
          <button
            type="button"
            onClick={fillTestData}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-sm rounded-xl hover:from-orange-600 hover:to-amber-600 shadow transition cursor-pointer whitespace-nowrap"
          >
            Fill Test Data
          </button>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="firstname"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                First Name *
              </label>
              <input
                value={formData.firstname}
                onChange={getValue}
                type="text"
                id="firstname"
                name="firstname"
                className={`w-full px-4 py-3 border-2 rounded-xl ${
                  errors.firstname
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-gray-200 focus:ring-orange-200 focus:border-orange-500"
                }`}
                placeholder="John"
              />
              {errors.firstname && (
                <p className="text-red-600 text-sm mt-1">{errors.firstname}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastname"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Last Name *
              </label>
              <input
                value={formData.lastname}
                onChange={getValue}
                type="text"
                id="lastname"
                name="lastname"
                className={`w-full px-4 py-3 border-2 rounded-xl ${
                  errors.lastname
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-gray-200 focus:ring-orange-200 focus:border-orange-500"
                }`}
                placeholder="Doe"
              />
              {errors.lastname && (
                <p className="text-red-600 text-sm mt-1">{errors.lastname}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Phone *
              </label>
              <div className="relative">
                <input
                  value={formData.phone}
                  onChange={getValue}
                  type="tel"
                  id="phone"
                  name="phone"
                  className={`w-full px-4 py-3 pl-12 border-2 rounded-xl ${
                    errors.phone
                      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-200 focus:ring-orange-200 focus:border-orange-500"
                  }`}
                  placeholder="1234567890"
                />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.phone && (
                <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email *
              </label>
              <input
                value={formData.email}
                onChange={getValue}
                readOnly
                type="email"
                id="email"
                name="email"
                className={`w-full px-4 py-3 border-2 rounded-xl ${
                  errors.email
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "border-gray-200 focus:ring-orange-200 focus:border-orange-500"
                }`}
                placeholder="student@university.edu"
              />
              {errors.email && (
                <p className="text-red-600 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="DOB"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Date of Birth *
              </label>
              <div className="relative">
                <input
                  value={formData.DOB}
                  onChange={getValue}
                  type="date"
                  id="DOB"
                  name="DOB"
                  className={`w-full px-4 py-3 pl-12 border-2 rounded-xl ${
                    errors.DOB
                      ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                      : "border-gray-200 focus:ring-orange-200 focus:border-orange-500"
                  }`}
                />
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              {errors.DOB && (
                <p className="text-red-600 text-sm mt-1">{errors.DOB}</p>
              )}
            </div>
          </div>
        </div>
        <br />
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Address *
              </label>
              <input
                value={formData.address}
                onChange={getValue}
                type="text"
                id="address"
                name="address"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                  errors.address
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "focus:ring-4 focus:ring-blue-200 focus:border-blue-500 border-gray-200 hover:border-blue-300"
                }`}
                placeholder="123 Main Street"
              />
              {errors.address && (
                <p className="text-red-600 text-sm mt-1">{errors.address}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                City *
              </label>
              <input
                value={formData.city}
                onChange={getValue}
                type="text"
                id="city"
                name="city"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                  errors.city
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "focus:ring-4 focus:ring-blue-200 focus:border-blue-500 border-gray-200 hover:border-blue-300"
                }`}
                placeholder="New York"
              />
              {errors.city && (
                <p className="text-red-600 text-sm mt-1">{errors.city}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="state"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                State *
              </label>
              <input
                value={formData.state}
                onChange={getValue}
                type="text"
                id="state"
                name="state"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                  errors.state
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "focus:ring-4 focus:ring-blue-200 focus:border-blue-500 border-gray-200 hover:border-blue-300"
                }`}
                placeholder="NY"
              />
              {errors.state && (
                <p className="text-red-600 text-sm mt-1">{errors.state}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="zipCode"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                ZIP Code *
              </label>
              <input
                value={formData.zipcode}
                onChange={getValue}
                type="text"
                id="zipcode"
                name="zipcode"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                  errors.zipcode
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "focus:ring-4 focus:ring-blue-200 focus:border-blue-500 border-gray-200 hover:border-blue-300"
                }`}
                placeholder="10001"
              />
              {errors.zipcode && (
                <p className="text-red-600 text-sm mt-1">{errors.zipcode}</p>
              )}
            </div>
          </div>
        </div>
        <br />
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Student & Hostel Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label
                htmlFor="studentId"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Student ID (Hostel Roll No) *
              </label>
              <input
                value={formData.studentid}
                onChange={getValue}
                type="text"
                id="studentid"
                name="studentid"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                  errors.studentid
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "focus:ring-4 focus:ring-purple-200 focus:border-purple-500 border-gray-200 hover:border-purple-300"
                }`}
                placeholder="STU123456"
              />
              {errors.studentid && (
                <p className="text-red-600 text-sm mt-1">{errors.studentid}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="hostelBlock"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Hostel Block *
              </label>
              <input
                value={formData.hostelblock}
                onChange={getValue}
                type="text"
                id="hostelblock"
                name="hostelblock"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                  errors.hostelblock
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "focus:ring-4 focus:ring-purple-200 focus:border-purple-500 border-gray-200 hover:border-purple-300"
                }`}
                placeholder="block-4"
              />
              {errors.hostelblock && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.hostelblock}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="roomNumber"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Room Number *
              </label>
              <input
                value={formData.roomno}
                onChange={getValue}
                type="text"
                id="roomno"
                name="roomno"
                className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-300 ${
                  errors.roomno
                    ? "border-red-500 focus:ring-red-200 focus:border-red-500"
                    : "focus:ring-4 focus:ring-purple-200 focus:border-purple-500 border-gray-200 hover:border-purple-300"
                }`}
                placeholder="101"
              />
              {errors.roomno && (
                <p className="text-red-600 text-sm mt-1">{errors.roomno}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <button
          type="button"
          onClick={onPrev}
          className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-5 h-5" /> Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className={`px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>Continue to Documents</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PersonalDetails;
