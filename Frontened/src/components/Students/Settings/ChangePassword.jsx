import { useState } from "react";
import axios from "axios";
import { RotateCw } from "lucide-react";

const ChangePassword = ({ studentId }) => {
  // Use studentid for API calls with fallback to localStorage
  const effectiveStudentId =
    studentId ||
    localStorage.getItem("studentid") ||
    (() => {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        return u?.studentDetails?.studentid || u?.studentid || u?._id;
      } catch (e) {
        return "";
      }
    })();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (status.message) {
      setStatus({ type: "", message: "" });
    }
  };

  const hasCurrentPassword = form.currentPassword.trim().length > 0;
  const hasNewPassword = form.newPassword.trim().length > 0;
  const hasConfirmPassword = form.confirmPassword.trim().length > 0;
  const passwordsMatch =
    hasNewPassword &&
    hasConfirmPassword &&
    form.newPassword === form.confirmPassword;
  const passwordsMismatch =
    hasConfirmPassword && form.newPassword !== form.confirmPassword;

  // Disabled if loading, or any field is empty, or new passwords do not match
  const isButtonDisabled =
    loading ||
    !hasCurrentPassword ||
    !hasNewPassword ||
    !hasConfirmPassword ||
    !passwordsMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordsMatch) {
      setStatus({ type: "error", message: "New passwords do not match" });
      return;
    }

    try {
      setLoading(true);
      setStatus({ type: "", message: "" });

      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const res = await axios.put(
        `${backendUrl}/api/students/${effectiveStudentId}/change-password`,
        {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      setStatus({
        type: "success",
        message: res.data?.message || "Password changed successfully!",
      });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err.response?.data?.error ||
          err.response?.data?.message ||
          "Something went wrong while updating password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Change Password</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Current Password
          </label>
          <input
            type="password"
            name="currentPassword"
            placeholder="Enter current password"
            value={form.currentPassword}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            placeholder="Enter new password"
            value={form.newPassword}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:outline-none transition ${
              passwordsMismatch
                ? "border-red-400 focus:ring-red-400 bg-red-50/30"
                : passwordsMatch
                ? "border-green-400 focus:ring-green-400 bg-green-50/20"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            required
          />
          {passwordsMismatch && (
            <p className="mt-1 text-xs text-red-600 font-medium flex items-center gap-1">
              <span>⚠️</span> Passwords do not match
            </p>
          )}
          {passwordsMatch && (
            <p className="mt-1 text-xs text-green-600 font-medium flex items-center gap-1">
              <span>✓</span> Passwords match
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full bg-blue-600 text-white font-medium p-3 rounded-lg hover:bg-blue-700 transition duration-150 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </form>
      {status.message && (
        <div
          className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            status.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {status.type === "success" ? "✅ " : "❌ "}
          {status.message}
        </div>
      )}
    </div>
  );
};

export default ChangePassword;
