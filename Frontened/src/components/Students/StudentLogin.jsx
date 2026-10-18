import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "../../api/axiosConfig"; // ✅ Axios instance
import { KeyRound, RotateCw } from "lucide-react";
import Navigation from "../Home/Navigation";

// ---------------------------------------------------------------------------
// 📝 Test Credentials - Replace with your actual student test credentials
// ---------------------------------------------------------------------------
export const STUDENT_TEST_CREDENTIALS = {
  email: "studenttest1@gmail.com",
  password: "TPftxTUajF",
};

const StudentLogin = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student",
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [testFilledFeedback, setTestFilledFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleUseTestCredentials = () => {
    setFormData((prev) => ({
      ...prev,
      email: STUDENT_TEST_CREDENTIALS.email,
      password: STUDENT_TEST_CREDENTIALS.password,
    }));
    setError(null);
    setTestFilledFeedback(true);
    setTimeout(() => setTestFilledFeedback(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await axios.post("auth/login", formData);
      const { token, user } = res.data;

      if (user?.studentDetails?.studentid) {
        localStorage.setItem("studentid", user.studentDetails.studentid);
      }

      login(user, token); // context login

      setSuccessMessage("Logged in successfully!");
      setTimeout(() => {
        navigate("/student/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
      <Navigation />
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 space-y-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-md w-full p-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl shadow-lg border border-orange-100"
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
              autoComplete="email"
              className="w-full px-5 py-4 rounded-xl border-2 border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-lg bg-white/90"
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
              autoComplete="current-password"
              className="w-full px-5 py-4 rounded-xl border-2 border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-lg bg-white/90"
            />
          </label>

          {error && (
            <p className="text-red-600 text-center font-semibold">{error}</p>
          )}

          {successMessage && (
            <p className="text-green-600 text-center font-semibold">{successMessage}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Log In</span>
            )}
          </button>

          {/* Use Test Credentials Button */}
          <div className="pt-2 border-t border-orange-200/80">
            <button
              type="button"
              onClick={handleUseTestCredentials}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow ${
                testFilledFeedback
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-orange-400 bg-white/80 hover:bg-orange-100/70 text-orange-700"
              }`}
            >
              <KeyRound className={`w-5 h-5 ${testFilledFeedback ? "text-green-600" : "text-orange-500"}`} />
              <span>
                {testFilledFeedback ? "✓ Test Credentials Filled!" : "Use Test Credentials"}
              </span>
            </button>
          </div>
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
            <span className="text-gray-400 mx-2">•</span>
            <a
              href="/test-signup"
              className="text-amber-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              🧪 Test Signup
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentLogin;
