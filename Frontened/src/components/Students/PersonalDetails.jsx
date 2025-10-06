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
  const [personalDetails, setPersonalDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // ⬇️ NEW: State for camera modal and image handling
  const [showCamera, setShowCamera] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
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
    imageUrl: data?.imageUrl || "", // NEW: Field to store the image URL
  });

  // ⬇️ NEW: Function to capture the image from the webcam
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
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

  // ⬇️ NEW: This function handles the image upload and the rest of the form submission
  const uploadImageAndContinue = async () => {
    if (!imgSrc) {
      toast.error("Please capture an image before continuing.");
      return;
    }

    setIsSubmitting(true);

    try {
      // ❗ IMPORTANT: Replace with your Cloudinary details
      const CLOUDINARY_CLOUD_NAME = "dopheg24o"; // 👈 REPLACE THIS
      const CLOUDINARY_UPLOAD_PRESET = "user-image"; // 👈 REPLACE THIS

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", imgSrc);
      cloudinaryFormData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      // Upload image to Cloudinary
      const response = await axios.post(cloudinaryUrl, cloudinaryFormData);
      const imageUrl = response.data.secure_url;

      toast.success("Image uploaded successfully!");

      const updatedFormData = { ...formData, imageUrl };
      setFormData(updatedFormData);

      // --- Continue with your original database submission logic ---
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
            `${import.meta.env.VITE_BACKEND_URL}/personaldetail/insert`,
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
        imageUrl: updatedFormData.imageUrl, // NEW: Pass the URL to the parent
      };

      updateData(mappedData);

      setTimeout(() => {
        onNext();
      }, 100);

    } catch (error) {
      console.error("Error uploading image or saving data:", error);
      toast.error("Failed to upload image or save data.");
    } finally {
      setIsSubmitting(false);
      setShowCamera(false); // Close the modal
      setImgSrc(null); // Reset the image source
    }
  };


 
  const [errors, setErrors] = useState({});

  const validateForm = () => {
  let newErrors = {};
  let firstInvalidField = null; // track first invalid

  // ✅ First Name
  if (!formData.firstname?.trim()) {
    newErrors.firstname = "First name is required";
    if (!firstInvalidField) firstInvalidField = "firstname";
  }

  // ✅ Last Name
  if (!formData.lastname?.trim()) {
    newErrors.lastname = "Last name is required";
    if (!firstInvalidField) firstInvalidField = "lastname";
  }

  // ✅ Phone
  if (!formData.phone?.trim()) {
    newErrors.phone = "Phone number is required";
    if (!firstInvalidField) firstInvalidField = "phone";
  } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
    newErrors.phone = "Enter a valid 10-digit phone number";
    if (!firstInvalidField) firstInvalidField = "phone";
  }

  // ✅ Email
  if (!formData.email?.trim()) {
    newErrors.email = "Email is required";
    if (!firstInvalidField) firstInvalidField = "email";
  } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
    newErrors.email = "Enter a valid email address";
    if (!firstInvalidField) firstInvalidField = "email";
  }

  // ✅ Date of Birth
  if (!formData.DOB?.trim()) {
    newErrors.DOB = "Date of Birth is required";
    if (!firstInvalidField) firstInvalidField = "DOB";
  } else {
    const dob = new Date(formData.DOB);
    const cutoff = new Date("2010-12-31");
    if (isNaN(dob.getTime())) {
      newErrors.DOB = "Enter a valid Date of Birth";
      if (!firstInvalidField) firstInvalidField = "DOB";
    } else if (dob > cutoff) {
      newErrors.DOB = "Date of Birth must be on or before 2010-12-31";
      if (!firstInvalidField) firstInvalidField = "DOB";
    }
  }

  // ✅ Address
  if (!formData.address?.trim()) {
    newErrors.address = "Address is required";
    if (!firstInvalidField) firstInvalidField = "address";
  }

  // ✅ City
  if (!formData.city?.trim()) {
    newErrors.city = "City is required";
    if (!firstInvalidField) firstInvalidField = "city";
  }

  // ✅ State
  if (!formData.state?.trim()) {
    newErrors.state = "State is required";
    if (!firstInvalidField) firstInvalidField = "state";
  }

  // ✅ Zip Code
  if (!formData.zipcode?.trim()) {
    newErrors.zipcode = "Zip Code is required";
    if (!firstInvalidField) firstInvalidField = "zipcode";
  } else if (!/^[1-9]\d{5}$/.test(formData.zipcode.trim())) {
    newErrors.zipcode = "Enter a valid 6-digit PIN code";
    if (!firstInvalidField) firstInvalidField = "zipcode";
  }

  // ✅ Student ID
  if (!formData.studentid?.trim()) {
    newErrors.studentid = "Student ID is required";
    if (!firstInvalidField) firstInvalidField = "studentid";
  } else if (!/^\d{1,4}$/.test(formData.studentid.trim())) {
    newErrors.studentid = "Student ID must be up to 4 digits";
    if (!firstInvalidField) firstInvalidField = "studentid";
  }

  // ✅ Hostel Block
  if (!formData.hostelblock?.trim()) {
    newErrors.hostelblock = "Hostel Block is required";
    if (!firstInvalidField) firstInvalidField = "hostelblock";
  }

  // ✅ Room Number
  if (!formData.roomno?.trim()) {
    newErrors.roomno = "Room Number is required";
    if (!firstInvalidField) firstInvalidField = "roomno";
  } else if (!/^\d{1,3}$/.test(formData.roomno.trim())) {
    newErrors.roomno = "Room Number must be up to 3 digits";
    if (!firstInvalidField) firstInvalidField = "roomno";
  }

  // ✅ Save errors to state
  setErrors(newErrors);

  // ✅ Auto focus + scroll to first invalid
  if (firstInvalidField) {
    const el = document.getElementById(firstInvalidField);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
    return false; // ❌ stop form submit
  }

  return true; // ✅ valid form
};





  const getValue = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover"
                                videoConstraints={{ facingMode: "user" }}
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
                                    {isSubmitting ? "Uploading..." : "Confirm"}
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
          {/* ... Personal Information fields ... */}
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
    First Name <span className="text-red-500">*</span>
  </label>
  <input
    value={formData.firstname}
    onChange={getValue}
    type="text"
    id="firstname"
    name="firstname"
    className={`w-full px-4 py-3 border-2 rounded-xl ${
      errors.firstname
        ? "border-red-500 focus:border-red-500 focus:ring-red-200"
        : "border-gray-200 focus:ring-orange-200 focus:border-orange-500"
    }`}
    placeholder="First Name"
    aria-invalid={!!errors.firstname}
    aria-describedby={errors.firstname ? "firstname-error" : undefined}
  />
  {errors.firstname && (
    <p id="firstname-error" className="text-red-500 text-sm mt-1">
      {errors.firstname}
    </p>
  )}
</div>



            <div>
  <label htmlFor="lastname" className="block text-sm font-semibold text-gray-700 mb-2">
    Last Name <span className="text-red-500">*</span>
  </label>
  <input
    value={formData.lastname}
    onChange={getValue}
    type="text"
    id="lastname"
    name="lastname"
    className={`w-full px-4 py-3 border-2 rounded-xl ${
      errors.lastname ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-orange-200 focus:border-orange-500"
    }`}
    placeholder="Last Name"
    aria-invalid={!!errors.lastname}
    aria-describedby={errors.lastname ? "lastname-error" : undefined}
  />
  {errors.lastname && <p id="lastname-error" className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
</div>



            <div>
  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">Phone <span className="text-red-500">*</span></label>
  <div className="relative">
    <input
      value={formData.phone}
      onChange={(e) => {
        // optional: keep only digits while typing
        e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10);
        getValue(e);
      }}
      type="tel"
      id="phone"
      name="phone"
      className={`w-full px-4 py-3 pl-12 border-2 rounded-xl ${
        errors.phone ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-orange-200 focus:border-orange-500"
      }`}
      placeholder="+91 8077XXXXXX"
      aria-invalid={!!errors.phone}
      aria-describedby={errors.phone ? "phone-error" : undefined}
    />
    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  </div>
  {errors.phone && <p id="phone-error" className="text-red-500 text-sm mt-1">{errors.phone}</p>}
</div>



           <div>
  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
  <input
    value={formData.email}
    readOnly
    onChange={getValue}
    type="email"
    id="email"
    name="email"
    className={`w-full px-4 py-3 border-2 rounded-xl ${
      errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-orange-200 focus:border-orange-500"
    }`}
    placeholder="student@university.edu"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && <p id="email-error" className="text-red-500 text-sm mt-1">{errors.email}</p>}
</div>



           <div>
  <label htmlFor="DOB" className="block text-sm font-semibold text-gray-700 mb-2">
    Date of Birth <span className="text-red-500">*</span>
  </label>
  <div className="relative">
    <input
      value={formData.DOB}
      onChange={getValue}
      type="date"
      id="DOB"
      name="DOB"
      className={`w-full px-4 py-3 pl-12 border-2 rounded-xl ${
        errors.DOB ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:ring-orange-200 focus:border-orange-500"
      }`}
      max="2010-12-31"
      aria-invalid={!!errors.DOB}
      aria-describedby={errors.DOB ? "dob-error" : undefined}
    />
    {/* user cannot select 2011 or later */}
    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
  </div>
  {errors.DOB && <p id="dob-error" className="text-red-500 text-sm mt-1">{errors.DOB}</p>}
</div>



          </div>
        </div>
        <br />
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
          {/* ... Address Information fields ... */}
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


            <div className="md:col-span-2">
  <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">Address <span className="text-red-500">*</span></label>
  <input
    value={formData.address}
    onChange={getValue}
    type="text"
    id="address"
    name="address"
    className={`w-full px-4 py-3 border-2 rounded-xl ${
      errors.address ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
    }`}
    placeholder="123 main street"
    aria-invalid={!!errors.address}
    aria-describedby={errors.address ? "address-error" : undefined}
  />
  {errors.address && <p id="address-error" className="text-red-500 text-sm mt-1">{errors.address}</p>}
</div>



           <div>
  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
  <input
    value={formData.city}
    onChange={getValue}
    type="text"
    id="city"
    name="city"
    className={`w-full px-4 py-3 border-2 rounded-xl ${
      errors.city ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
    }`}
    placeholder="New Delhi"
    aria-invalid={!!errors.city}
    aria-describedby={errors.city ? "city-error" : undefined}
  />
  {errors.city && <p id="city-error" className="text-red-500 text-sm mt-1">{errors.city}</p>}
</div>



           <div>
  <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">State <span className="text-red-500">*</span></label>
  <input
    value={formData.state}
    onChange={getValue}
    type="text"
    id="state"
    name="state"
    className={`w-full px-4 py-3 border-2 rounded-xl ${
      errors.state ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
    }`}
    placeholder="Chandigarh"
    aria-invalid={!!errors.state}
    aria-describedby={errors.state ? "state-error" : undefined}
  />
  {errors.state && <p id="state-error" className="text-red-500 text-sm mt-1">{errors.state}</p>}
</div>



           <div>
  <label htmlFor="zipcode" className="block text-sm font-semibold text-gray-700 mb-2">Pin Code <span className="text-red-500">*</span></label>
  <input
    value={formData.zipcode}
    onChange={(e) => {
      // keep only digits, max 6
      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
      getValue(e);
    }}
    type="text"
    id="zipcode"
    name="zipcode"
    className={`w-full px-4 py-3 border-2 rounded-xl ${
      errors.zipcode ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-200 focus:border-blue-500"
    }`}
    placeholder="160014"
    aria-invalid={!!errors.zipcode}
    aria-describedby={errors.zipcode ? "zipcode-error" : undefined}
  />
  {errors.zipcode && <p id="zipcode-error" className="text-red-500 text-sm mt-1">{errors.zipcode}</p>}
</div>



          </div>
        </div>
        <br />
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          {/* ... Student & Hostel Information fields ... */}
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-purple-600" />
            Student & Hostel Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


           <div>
  <label htmlFor="studentid" className="block text-sm font-semibold text-gray-700 mb-2">Roll Number <span className="text-red-500">*</span></label>
  <input
    value={formData.studentid}
    onChange={(e) => {
      const { value } = e.target;
      if (/^\d{0,4}$/.test(value)) getValue(e); // only numbers, max 4 digits
    }}
    type="text"
    id="studentid"
    name="studentid"
    className={`w-full px-4 py-3 border-2 rounded-xl ${
      errors.studentid ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 hover:border-purple-300 focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
    }`}
    placeholder="112"
    aria-invalid={!!errors.studentid}
    aria-describedby={errors.studentid ? "studentid-error" : undefined}
  />
  {errors.studentid && <p id="studentid-error" className="text-red-500 text-sm mt-1">{errors.studentid}</p>}
</div>



           <div>
  <label htmlFor="hostelblock" className="block text-sm font-semibold text-gray-700 mb-2">Hostel Block <span className="text-red-500">*</span></label>
  <input
    value={formData.hostelblock}
    onChange={getValue}
    type="text"
    id="hostelblock"
    name="hostelblock"
    className={`w-full px-4 py-3 border-2 rounded-xl ${
      errors.hostelblock ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 hover:border-purple-300 focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
    }`}
    placeholder="block-4"
    aria-invalid={!!errors.hostelblock}
    aria-describedby={errors.hostelblock ? "hostelblock-error" : undefined}
  />
  {errors.hostelblock && <p id="hostelblock-error" className="text-red-500 text-sm mt-1">{errors.hostelblock}</p>}
</div>



            <div>
  <label htmlFor="roomno" className="block text-sm font-semibold text-gray-700 mb-2">Room Number <span className="text-red-500">*</span></label>
  <input
    value={formData.roomno}
    onChange={(e) => {
      const { value } = e.target;
      if (/^\d{0,3}$/.test(value)) getValue(e); // only numbers, max 3 digits
    }}
    type="text"
    id="roomno"
    name="roomno"
    className={`w-full px-4 py-3 border-2 rounded-xl ${
      errors.roomno ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 hover:border-purple-300 focus:ring-4 focus:ring-purple-200 focus:border-purple-500"
    }`}
    placeholder="101"
    aria-invalid={!!errors.roomno}
    aria-describedby={errors.roomno ? "roomno-error" : undefined}
  />
  {errors.roomno && <p id="roomno-error" className="text-red-500 text-sm mt-1">{errors.roomno}</p>}
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