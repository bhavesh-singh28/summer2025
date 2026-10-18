import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axiosConfig"; // ✅ Use custom axios
import { ShieldCheck, Utensils, ShoppingCart, KeyRound, RotateCw } from "lucide-react";
import Navigation from "./Home/Navigation";

// ---------------------------------------------------------------------------
// 📝 Test Credentials for Admin roles - Replace with your actual credentials
// ---------------------------------------------------------------------------
export const ADMIN_TEST_CREDENTIALS = {
  superadmin: {
    email: "admin@mess.com",
    password: "pass",
    role: "superadmin",
    label: "Super Admin",
  },
  mess: {
    email: "bh4mess@test.com",
    password: "896433",
    role: "messadmin",
    label: "Mess Admin",
  },
};

const AdminLoginForm = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedRole = searchParams.get("role") || "superadmin";

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: selectedRole,
  });

  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeTestKey, setActiveTestKey] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, role: selectedRole }));
  }, [selectedRole]);

  // Autofill if requested via query parameter
  useEffect(() => {
    if (searchParams.get("autofill") === "true") {
      const key = selectedRole === "messadmin" ? "mess" : "superadmin";
      fillAdminCredentials(key);
    }
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const fillAdminCredentials = (type) => {
    const creds = ADMIN_TEST_CREDENTIALS[type];
    if (!creds) return;

    setFormData({
      email: creds.email,
      password: creds.password,
      role: creds.role,
    });
    setSearchParams({ role: creds.role });
    setError(null);
    setActiveTestKey(type);
    setTimeout(() => setActiveTestKey(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // Determine correct login URL
    let loginUrl;
    if (formData.role === "messadmin") {
      loginUrl = "/mess-staff/auth/login";
    } else {
      loginUrl = "/auth/login";
    }

    try {
      const res = await axios.post(loginUrl, formData);
      const { token, user } = res.data;

      // Save user/token in context
      login(user, token);

      setSuccessMessage("Logged in successfully!");

      // Redirect based on role
      setTimeout(() => {
        if (formData.role === "messadmin") {
          navigate("/mess-admin");
        } else {
          navigate("/admin");
        }
      }, 1500);

    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login failed");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-amber-50">
      <Navigation />
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 max-w-md w-full p-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-3xl shadow-lg border border-orange-100"
        >
          <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 mb-6">
            Admin Login
          </h2>

          <div className="text-center mb-4">
            <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              formData.role === "canteenadmin"
                ? "bg-gray-200 text-gray-700 border border-gray-300"
                : "bg-orange-100 text-orange-800"
            }`}>
              Logging in as:{" "}
              {formData.role === "superadmin"
                ? "Super Admin"
                : formData.role === "messadmin"
                ? "Mess Admin"
                : "Canteen Admin (Disabled)"}
            </span>
          </div>

          {formData.role === "canteenadmin" && (
            <div className="p-3 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-center text-sm font-medium">
              ⚠️ Canteen Admin login is currently disabled. Please select Super Admin or Mess Admin.
            </div>
          )}

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-5 py-4 rounded-xl border-2 border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-lg bg-white/90"
            autoComplete="email"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-5 py-4 rounded-xl border-2 border-orange-300 focus:outline-none focus:ring-4 focus:ring-orange-200 focus:border-orange-500 text-lg bg-white/90"
            autoComplete="current-password"
          />

          {error && (
            <p className="text-red-600 text-center font-semibold">{error}</p>
          )}

          {successMessage && (
            <div className="p-3 bg-green-100 text-green-800 rounded-xl text-center font-semibold">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || formData.role === "canteenadmin"}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-5 h-5 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : formData.role === "canteenadmin" ? (
              <span>Canteen Login Disabled</span>
            ) : (
              <span>Log In</span>
            )}
          </button>

          {/* Test Credentials for Admin Users */}
          <div className="pt-4 border-t border-orange-200/80">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-orange-500" />
              Use Test Credentials
            </p>

            <div className="grid grid-cols-2 gap-3">
              {/* Superadmin Button */}
              <button
                type="button"
                onClick={() => fillAdminCredentials("superadmin")}
                className={`p-2.5 text-xs font-bold rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm hover:shadow ${
                  formData.role === "superadmin" && activeTestKey === "superadmin"
                    ? "border-red-500 bg-red-100 text-red-800 scale-95"
                    : "border-red-300 bg-white/80 text-red-700 hover:bg-red-50 hover:border-red-400"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Super Admin</span>
              </button>

              {/* Mess Button */}
              <button
                type="button"
                onClick={() => fillAdminCredentials("mess")}
                className={`p-2.5 text-xs font-bold rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm hover:shadow ${
                  formData.role === "messadmin" && activeTestKey === "mess"
                    ? "border-green-500 bg-green-100 text-green-800 scale-95"
                    : "border-green-300 bg-white/80 text-green-700 hover:bg-green-50 hover:border-green-400"
                }`}
              >
                <Utensils className="w-4 h-4 text-green-600" />
                <span>Mess</span>
              </button>
            </div>

            {activeTestKey && ADMIN_TEST_CREDENTIALS[activeTestKey] && (
              <p className="text-center text-xs font-semibold text-green-600 mt-2.5">
                ✓ {ADMIN_TEST_CREDENTIALS[activeTestKey].label} credentials filled!
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginForm;