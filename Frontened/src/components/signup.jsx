import React, { useState } from "react";
import axios from "../api/axiosConfig";
import {useNavigate} from 'react-router-dom';

const Signup = () => {
  const [formData, setFormData] = useState({ name: "", email: "", hostelNo: "", phoneNo: "", password: "" });
  const navigate = useNavigate();
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/auth/signup`, formData);
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>
      {Object.keys(formData).map((key) => (
        <input key={key} name={key} type={key === 'password' ? 'password' : 'text'} placeholder={key.charAt(0).toUpperCase() + key.slice(1)} value={formData[key]} onChange={handleChange} required className="w-full p-3 rounded-full bg-gray-200 focus:outline-none" />
      ))}
      <button type="submit" className="w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition">Sign Up</button>
    </form>
  );
};

export default Signup;