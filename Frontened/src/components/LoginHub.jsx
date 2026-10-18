import React from "react";
import { useNavigate } from "react-router-dom";
import { User, Shield, Home } from "lucide-react";
import Navigation from "./Home/Navigation";

const LoginHub = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-2xl border border-orange-100">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Welcome Back!
          </h2>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => navigate("/student-login")}
              className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-md"
            >
              <User className="w-6 h-6 mr-3" />
              Student Login
            </button>
            <button
              onClick={() => navigate("/admin-login")}
              className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white bg-gray-800 rounded-xl hover:bg-gray-900 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-md"
            >
              <Shield className="w-6 h-6 mr-3" />
              Admin Login
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="px-3 text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Go back to Home Page button */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center justify-center w-full px-6 py-3 text-base font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 border border-gray-300 cursor-pointer"
            >
              <Home className="w-5 h-5 mr-3" />
              Go back to Home Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginHub;
