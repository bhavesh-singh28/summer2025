// ⬇️ NEW: Import necessary hooks, Webcam component, and new icons
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  Check,      // Icon for confirm button
  RefreshCw,  // Icon for retake button
} from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const PersonalDetails = ({ data, updateData, onNext, onPrev }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false); // To prevent multiple submissions

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

    // If form is valid, show the camera modal to capture the image
    setShowCamera(true);
  };

  // ⬇️ MODIFIED: This function now handles the image upload to YOUR BACKEND
  //              and then the rest of the form submission.
  const uploadImageAndContinue = async () => {
    if (!imgSrc) {
      toast.error("Please capture an image before continuing.");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ STEP 1: Upload image to your backend which then sends it to Cloudinary
      const uploadResponse = await axios.post(
        "http://localhost:5000/api/personaldetail/upload-profile-image", // New backend endpoint
        { image: imgSrc } // Send the base64 image data
      );

      if (uploadResponse.data.status === 1) {
        const imageUrl = uploadResponse.data.imageUrl;
        toast.success("Image uploaded successfully!");

        const updatedFormData = { ...formData, imageUrl };
        setFormData(updatedFormData); // Update form data with the Cloudinary URL

        // ✅ STEP 2: Continue with your original database submission logic
        let saveSuccessful = false;
        try {
          const existingStudent = await axios.get(
            `http://localhost:5000/api/personaldetail/view`
          );
          const studentExists = existingStudent.data.personaldetailList?.some(
            (student) =>
              student.studentid === updatedFormData.studentid ||
              student.email === updatedFormData.email
          );

          if (!studentExists) {
            await axios.post(
              "http://localhost:5000/api/personaldetail/insert",
              updatedFormData // Send data with the new imageUrl
            );
            toast.success("Personal details saved successfully");
            saveSuccessful = true;
          } else {
            toast.info("Student already exists, proceeding to next step");
            saveSuccessful = true;
          }
        } catch (dbError) {
          console.error("Database error:", dbError);
          // Fallback insert attempt
          try {
            await axios.post(
              "http://localhost:5000/api/personaldetail/insert",
              updatedFormData
            );
            toast.success("Personal details saved successfully");
            saveSuccessful = true;
          } catch (insertError) {
            if (insertError.response?.status === 400) {
              toast.info("Student already exists, proceeding to next step");
              saveSuccessful = true;
            } else {
              toast.error("Failed to save personal details");
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
        toast.error(uploadResponse.data.message || "Failed to upload image.");
      }

    } catch (error) {
      console.error("Error uploading image or saving data:", error);
      toast.error("Failed to upload image or save data.");
    } finally {
      setIsSubmitting(false);
      setShowCamera(false); // Close the modal
      setImgSrc(null); // Reset the image source
    }
  };


  const validateForm = () => {
    const requiredFields = [
      "firstname", "lastname", "phone", "email", "DOB",
      "address", "city", "state", "zipcode", "studentid",
      "hostelblock", "roomno",
    ];

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].trim() === "") {
        toast.error(`Please fill out the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`); // Improved error message
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address.");
        return false;
    }

    // Basic phone number validation (e.g., 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
        toast.error("Please enter a valid 10-digit phone number.");
        return false;
    }

    // Basic DOB validation (not in the future)
    const dobDate = new Date(formData.DOB);
    const today = new Date();
    if (dobDate > today) {
        toast.error("Date of Birth cannot be in the future.");
        return false;
    }


    return true;
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
        {/* --- IMPROVED CAMERA MODAL --- */}
        {showCamera && (
            <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
                <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all duration-300 scale-95 hover:scale-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-800">Capture Your Profile Photo</h3>
                        <button onClick={() => { setShowCamera(false); setImgSrc(null); }} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <X className="w-6 h-6 text-gray-600" />
                        </button>
                    </div>

                    <div className="relative w-full aspect-square rounded-full overflow-hidden mx-auto max-w-xs border-4 border-gray-200 shadow-inner">
                        {imgSrc ? (
                            <img src={imgSrc} alt="Captured Screenshot" className="w-full h-full object-cover" />
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

                    <p className="text-center text-gray-500 mt-4 text-sm">Please center your face in the circle.</p>

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
                                    <Check className="w-5 h-5" />
                                    {isSubmitting ? "Uploading & Saving..." : "Confirm & Save"}
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
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstname" className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
              <input value={formData.firstname} onChange={getValue} type="text" id="firstname" name="firstname" className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-orange-200 focus:border-orange-500" placeholder="John" />
            </div>
            <div>
              <label htmlFor="lastname" className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
              <input value={formData.lastname} onChange={getValue} type="text" id="lastname" name="lastname" className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-orange-200 focus:border-orange-500" placeholder="Doe" />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
              <div className="relative"><input value={formData.phone} onChange={getValue} type="tel" id="phone" name="phone" className="w-full px-4 py-3 pl-12 border-2 rounded-xl border-gray-200 focus:ring-orange-200 focus:border-orange-500" placeholder="1234567890" /><Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /></div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <input value={formData.email} onChange={getValue} type="email" id="email" name="email" className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-orange-200 focus:border-orange-500" placeholder="student@university.edu" />
            </div>
            <div>
              <label htmlFor="DOB" className="block text-sm font-semibold text-gray-700 mb-2">Date of Birth *</label>
              <div className="relative"><input value={formData.DOB} onChange={getValue} type="date" id="DOB" name="DOB" className="w-full px-4 py-3 pl-12 border-2 rounded-xl border-gray-200 focus:ring-orange-200 focus:border-orange-500" /><Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /></div>
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
              <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
              <input value={formData.address} onChange={getValue} type="text" id="address" name="address" className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 border-gray-200 hover:border-blue-300" placeholder="123 Main Street"/>
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
              <input value={formData.city} onChange={getValue} type="text" id="city" name="city" className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 border-gray-200 hover:border-blue-300" placeholder="New York"/>
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">State *</label>
              <input value={formData.state} onChange={getValue} type="text" id="state" name="state" className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 border-gray-200 hover:border-blue-300" placeholder="NY"/>
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-semibold text-gray-700 mb-2">ZIP Code *</label>
              <input value={formData.zipcode} onChange={getValue} type="text" id="zipcode" name="zipcode" className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 border-gray-200 hover:border-blue-300" placeholder="10001"/>
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
              <label htmlFor="studentId" className="block text-sm font-semibold text-gray-700 mb-2">Student ID *</label>
              <input value={formData.studentid} onChange={getValue} type="text" id="studentid" name="studentid" className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 border-gray-200 hover:border-purple-300" placeholder="STU123456"/>
            </div>
            <div>
              <label htmlFor="hostelBlock" className="block text-sm font-semibold text-gray-700 mb-2">Hostel Block *</label>
              <input value={formData.hostelblock} onChange={getValue} type="text" id="hostelblock" name="hostelblock" className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 border-gray-200 hover:border-purple-300" placeholder="block-4"/>
            </div>
            <div>
              <label htmlFor="roomNumber" className="block text-sm font-semibold text-gray-700 mb-2">Room Number *</label>
              <input value={formData.roomno} onChange={getValue} type="text" id="roomno" name="roomno" className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 border-gray-200 hover:border-purple-300" placeholder="101"/>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between mt-10">
        <button type="button" onClick={onPrev} className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl">
          <ArrowLeft className="w-5 h-5" /> Previous
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className={`px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isSubmitting ? "Saving..." : "Continue to Documents"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PersonalDetails;