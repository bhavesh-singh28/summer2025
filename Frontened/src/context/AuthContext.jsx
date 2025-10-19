import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // ✅ Check token validity once when app loads
  // useEffect(() => {
  //   const verifyToken = async () => {
  //     const token = localStorage.getItem("token");
  //     const savedUser = localStorage.getItem("user");

  //     if (!token || !savedUser) {
  //       logout();
  //       return;
  //     }

  //     try {
  //       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/auth/verifyToken`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });

  //       if (res.message != "Token is valid") {
  //         logout();
  //       }
  //     } catch (err) {
  //       // token invalid or expired
  //       logout();
  //     }
  //   };

  //   verifyToken();
  // }, []);

  const isLoggedIn = !!user;

  const value = {
    user,
    login,
    logout,
    isLoggedIn,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
