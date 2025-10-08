
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ role }) => {
  const [formData, setFormData] = useState({ email: "", password: "", role });
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

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
          className="pl-10 pr-10 w-full p-3 rounded-full bg-gray-200 focus:outline-none"
        />
        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
          <i className="fas fa-eye-slash text-gray-500"></i>
        </span>
      </label>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        className="w-full cursor-pointer bg-black text-white py-3 rounded-full font-semibold mb-4 hover:bg-gray-800 transition"
      >
        Log in
      </button>
    </form>
  );
};

export default Login;
