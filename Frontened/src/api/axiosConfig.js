// src/api/axiosConfig.js
import axios from "axios";

const baseURL ="http://13.232.235.205:5000/api"; // fallback to localhost

const api = axios.create({
  baseURL,
});

export default api;
