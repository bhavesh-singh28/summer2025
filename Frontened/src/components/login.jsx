import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { RotateCw } from "lucide-react";

// 📝 Test Credentials - Replace with your actual credentials
export const TEST_CREDENTIALS = {
  student: { email: "studenttest1@gmail.com", password: "TPftxTUajF", label: "Student" },
  superadmin: { email: "admin@mess.com", password: "pass", label: "Super Admin" },
  mess: { email: "bh4mess@test.com", password: "896433", label: "Mess Admin" },
};

const Login = ({ role }) => {
  const [formData, setFormData] = useState({ email: "", password: "", role });
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [testFeedback, setTestFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const fillTestCredentials = (key) => {
    const cred = TEST_CREDENTIALS[key];
    if (!cred) return;
    setFormData({
      email: cred.email,
      password: cred.password,
      role: key === "mess" ? "messadmin" : key === "canteen" ? "canteenadmin" : key,
    });
    setError(null);
    setTestFeedback(cred.label);
    setTimeout(() => setTestFeedback(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/login`, formData);
      if (res.data.success) {
        alert(res.data.message);
        if (res.data.user.role === "student") {
          navigate("/student/dashboard");
        } else {
          // Redirect all admin roles to superadmin dashboard for now
          navigate("/admin/superadmin/dashboard");
        }
      } else {
        setError(res.data.error);
        setIsLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
      setIsLoading(false);
    }
  };

  const isStudentRole = role === "student";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-3xl font-bold text-center mb-8">{role ? `${role.charAt(0).toUpperCase() + role.slice(1)} Login` : "Log in"}</h2>

      <label className="block relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <i className="fas fa-user text-gray-500"></i>
        </span>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          className="pl-10 w-full p-3 rounded-full bg-gray-200 focus:outline-none"
        />
      </label>

      <label className="block relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <i className="fas fa-lock text-gray-500"></i>
        </span>
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          className="pl-10 pr-10 w-full p-3 rounded-full bg-gray-200 focus:outline-none"
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
          <i className="fas fa-eye-slash text-gray-500"></i>
        </span>
      </label>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full cursor-pointer bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <RotateCw className="w-5 h-5 animate-spin" />
            <span>Logging in...</span>
          </>
        ) : (
          <span>Log in</span>
        )}
      </button>

      {/* Test Credentials Button(s) */}
      <div className="pt-3 border-t border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 text-center">
          Use Test Credentials
        </p>

        {isStudentRole ? (
          <button
            type="button"
            onClick={() => fillTestCredentials("student")}
            className="w-full py-2.5 px-4 rounded-full border-2 border-dashed border-gray-400 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition cursor-pointer"
          >
            {testFeedback ? "✓ Test Credentials Filled!" : "Fill Student Test Credentials"}
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillTestCredentials("superadmin")}
              className="py-2 px-2 text-xs font-bold rounded-lg border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer text-center"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => fillTestCredentials("mess")}
              className="py-2 px-2 text-xs font-bold rounded-lg border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition cursor-pointer text-center"
            >
              Mess
            </button>
          </div>
        )}

        {testFeedback && (
          <p className="text-center text-xs font-semibold text-green-600 mt-2">
            ✓ {testFeedback} credentials filled!
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
