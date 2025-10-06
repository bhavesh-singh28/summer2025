// src/api/axiosConfig.js
import axios from "axios";

const baseURL = `${import.meta.env.VITE_BACKEND_URL}`; // fallback to localhost

const api = axios.create({
  baseURL,
});

export default api;
