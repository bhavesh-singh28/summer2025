import React from "react";
import { useNavigate } from "react-router-dom";
import { Utensils, ShoppingCart, ShieldCheck, KeyRound } from "lucide-react";
import Navigation from "./Home/Navigation";

const AdminLogin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-6 md:p-8">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-3xl shadow-2xl border border-orange-100">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Admin Login
          </h2>
          <div className="flex flex-col space-y-4">
            <button
              onClick={() => navigate("/admin-login-form?role=messadmin")}
              className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-md"
            >
              <Utensils className="w-6 h-6 mr-3" />
              Mess Admin
            </button>
            <button
              disabled
              className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-gray-400 bg-gray-200 rounded-xl cursor-not-allowed border border-gray-300 shadow-none opacity-80"
              title="Canteen Admin is currently disabled"
            >
              <ShoppingCart className="w-6 h-6 mr-3 text-gray-400" />
              <span>Canteen Admin</span>
              <span className="ml-2.5 text-xs bg-gray-300 text-gray-600 px-2 py-0.5 rounded-full font-medium">Disabled</span>
            </button>
            <button
              onClick={() => navigate("/admin-login-form?role=superadmin")}
              className="flex items-center justify-center w-full px-6 py-4 text-lg font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-md"
            >
              <ShieldCheck className="w-6 h-6 mr-3" />
              Super Admin
            </button>
          </div>

          {/* Quick Test Credentials Section */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center flex items-center justify-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              Use Test Credentials
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/admin-login-form?role=superadmin&autofill=true")}
                className="p-2.5 text-xs font-bold rounded-xl border border-red-300 bg-red-50 text-red-700 hover:bg-red-100 transition flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm hover:shadow"
              >
                <ShieldCheck className="w-4 h-4 text-red-600" />
                <span>Super Admin</span>
              </button>
              <button
                onClick={() => navigate("/admin-login-form?role=messadmin&autofill=true")}
                className="p-2.5 text-xs font-bold rounded-xl border border-green-300 bg-green-50 text-green-700 hover:bg-green-100 transition flex flex-col items-center justify-center gap-1 cursor-pointer shadow-sm hover:shadow"
              >
                <Utensils className="w-4 h-4 text-green-600" />
                <span>Mess</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
