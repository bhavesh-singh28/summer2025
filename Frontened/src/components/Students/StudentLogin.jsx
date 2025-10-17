import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axiosConfig"; // ✅ Axios instance

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const navigate = useNavigate();
  const { login  } = useAuth();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post("auth/login", formData);
      const { token, user } = res.data;

      if (user?.studentDetails?.studentid) {
      localStorage.setItem("studentid", user.studentDetails.studentid);
    }
    
      login(user , token); // context login

      setSuccessMessage("Logged in successfully!");
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-8 space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 max-w-md w-full p-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl shadow-lg"
      >
        <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 mb-8">
          Student Login
        </h2>

        <label className="block relative">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-5 py-4 rounded-xl border-2 border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-lg"
          />
        </label>

        <label className="block relative">
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-5 py-4 rounded-xl border-2 border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-lg"
          />
        </label>

        {error && (
          <p className="text-red-600 text-center font-semibold">{error}</p>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-shadow shadow-lg"
        >
          Log In
        </button>
      </form>
      <div className="text-center">
        <p className="text-lg">
          Don't have an account?{" "}
          <a
            href="/student-signup"
            className="text-orange-600 font-semibold hover:underline"
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
};

export default StudentLogin;
