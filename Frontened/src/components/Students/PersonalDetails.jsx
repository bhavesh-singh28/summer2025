import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  User,
  Home,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  UtensilsCrossed,
} from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

const PersonalDetails = ({ data, updateData, onNext, onPrev }) => {
  const [PersonalDetails, setPersonalDetails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
    button: "",
  });

  const handleNext = async (e) => {
    // Prevent any default behavior and event propagation
    e.preventDefault();
    e.stopPropagation();

    console.log(
      "handleNext called, isSubmitting:",
      isSubmitting,
      "hasSubmitted:",
      hasSubmitted
    );

    // Prevent double submission
    if (isSubmitting || hasSubmitted) {
      console.log("Preventing double submission");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Starting form submission...");

      // Validate form before saving
      if (!validateForm()) {
        console.log("Form validation failed");
        setIsSubmitting(false);
        return;
      }

      console.log("Form data to submit:", formData);

      // Check if student already exists to prevent duplicates
      let saveSuccessful = false;
      try {
        const existingStudent = await axios.get(
          `http://localhost:5000/api/personaldetail/view`
        );
        const studentExists = existingStudent.data.personaldetailList?.some(
          (student) =>
            student.studentid === formData.studentid ||
            student.email === formData.email
        );

        if (!studentExists) {
          await axios.post(
            "http://localhost:5000/api/personaldetail/insert",
            formData
          );
          toast.success("Personal details saved successfully");
          saveSuccessful = true;
        } else {
          toast.info("Student already exists, proceeding to next step");
          saveSuccessful = true; // Consider existing student as "successful"
        }
      } catch (dbError) {
        console.error("Database error:", dbError);
        // If checking fails, try to insert anyway (backend should handle duplicates)
        try {
          await axios.post(
            "http://localhost:5000/api/personaldetail/insert",
            formData
          );
          toast.success("Personal details saved successfully");
          saveSuccessful = true;
        } catch (insertError) {
          console.error("Insert error:", insertError);
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

      // Only set hasSubmitted if save was successful
      if (saveSuccessful) {
        setHasSubmitted(true);
        console.log("Database operations completed, proceeding to next step");
      }

      // Map the form data to match the parent component's expected field names
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
      };

      // Update parent data first
      updateData(mappedData);

      // Use setTimeout to ensure state update completes before navigation
      setTimeout(() => {
        onNext();
      }, 100);
    } catch (error) {
      console.error("Error in handleNext:", error);
      toast.error("Failed to save data");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
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

    for (let field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        alert(`Please fill out ${field} field.`);
        return false;
      }
    }

    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      alert("Please enter a valid 10-digit phone number.");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  // ✅ Function to get form values
  const getValue = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Get all data from backend
  const getAllpersonalDetails = () => {
    axios
      .get("http://localhost:5000/api/personaldetail/view")
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
      <div>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-orange-600" />
            Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
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
                className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-orange-200 focus:border-orange-500"
                placeholder="John"
              />
            </div>

            {/* Last Name */}
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
                className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-orange-200 focus:border-orange-500"
                placeholder="Doe"
              />
            </div>

            {/* Phone */}
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
                  className="w-full px-4 py-3 pl-12 border-2 rounded-xl border-gray-200 focus:ring-orange-200 focus:border-orange-500"
                  placeholder="1234567890"
                />
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Email */}
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
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border-2 rounded-xl border-gray-200 focus:ring-orange-200 focus:border-orange-500"
                placeholder="student@university.edu"
              />
            </div>

            {/* DOB */}
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
                  className="w-full px-4 py-3 pl-12 border-2 rounded-xl border-gray-200 focus:ring-orange-200 focus:border-orange-500"
                />
                <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <br />
        {/* Address Information */}
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
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 border-gray-200 hover:border-blue-300"
                placeholder="123 Main Street"
              />
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
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 border-gray-200 hover:border-blue-300"
                placeholder="New York"
              />
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
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 border-gray-200 hover:border-blue-300"
                placeholder="NY"
              />
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
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 border-gray-200 hover:border-blue-300"
                placeholder="10001"
              />
            </div>
          </div>
        </div>
        <br />

        {/* Student & Hostel Information */}
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
                Student ID *
              </label>
              <input
                value={formData.studentid}
                onChange={getValue}
                type="text"
                id="studentid"
                name="studentid"
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 border-gray-200 hover:border-purple-300"
                placeholder="STU123456"
              />
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
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 border-gray-200 hover:border-purple-300"
                placeholder="block-4"
              />
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
                className="w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-300 border-gray-200 hover:border-purple-300"
                placeholder="101"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation buttons - completely separate from form */}
      <div className="flex justify-between mt-10">
        <button
          type="button"
          onClick={onPrev}
          className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting}
          className={`px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 font-semibold flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? "Saving..." : "Continue to Documents"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Show Data */}
      {/*
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">Saved Personal Details:</h2>
        <ul className="space-y-2">
          {PersonalDetails.map((detail, index) => (
            <li key={index} className="p-3 border rounded shadow-sm bg-white">
              <strong>
                {detail.firstname} {detail.lastname}
              </strong>{" "}
              — {detail.phone}, Email: {detail.email}, DOB: {detail.DOB}-
              address: {detail.address}-{detail.city}- {detail.state}-
              {detail.zipcode}-{detail.studentid}-{detail.hostelblock}-
              {detail.roomno}
            </li>
          ))}
        </ul>
      </div>
      */}
    </div>
  );
};

export default PersonalDetails;
