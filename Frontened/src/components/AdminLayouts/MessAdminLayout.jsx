// src/AdminLayouts/MessAdminLayout.jsx
import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  UserCircle,
  ChevronDown,
  Utensils,
  Settings,
  DollarSign,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  {
    name: "Menu Management",
    path: "/mess-admin/menu",
    icon: <Utensils size={18} />,
  },
  {
    name: "Student Expenses",
    path: "/mess-admin/expenses",
    icon: <DollarSign size={18} />,
  },
  {
    name: "Settings",
    path: "/mess-admin/settings",
    icon: <Settings size={18} />,
  },
];

export default function MessAdminLayout() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout, token } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/loginhub");
    setDropdownOpen(false);
  };

  // ✅ Token expiry check (runs every minute)
  useEffect(() => {
    const checkTokenExpiry = () => {
      if (!token) return;
      try {
        const [, payload] = token.split(".");
        const decoded = JSON.parse(atob(payload));
        if (decoded.exp * 1000 < Date.now()) {
          alert("Session expired! Please login again.");
          handleLogout();
        }
      } catch (err) {
        console.error("Invalid token:", err);
        handleLogout();
      }
    };
    checkTokenExpiry();
    const interval = setInterval(checkTokenExpiry, 60000);
    return () => clearInterval(interval);
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans relative">
      {/* ===== Sidebar (Desktop + Mobile) ===== */}
      <aside
        className={`fixed sm:static top-0 left-0 h-full w-64 bg-gradient-to-b from-green-600 to-green-700 text-white shadow-xl transform transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        <div className="p-6 flex flex-col h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold tracking-wide">🍽️ Mess Admin</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="sm:hidden p-1 hover:bg-green-700 rounded"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex flex-col gap-2 flex-grow">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)} // close menu on mobile
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 ${
                    isActive
                      ? "bg-white text-green-700 font-semibold shadow-sm"
                      : "hover:bg-white hover:text-green-700 hover:bg-opacity-20"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 px-4 py-2 rounded-lg bg-green-800 hover:bg-green-900 transition text-white"
          >
            <Settings size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* ===== Main Content ===== */}
      <div className="flex flex-col flex-1">
        {/* ===== Header ===== */}
        <header className="bg-white shadow px-4 sm:px-6 py-4 flex justify-between items-center border-b-2 border-green-200">
          {/* Left side: Logo + Title */}
          <div className="flex items-center gap-3">
            <button
              className="sm:hidden text-green-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <img src="/PU_Logo.png" alt="PU Logo" className="h-12 sm:h-16 w-auto" />
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 leading-tight">
                Mess Management System
              </h1>
              <p className="text-xs sm:text-sm text-green-600 font-medium">
                Baba Banda Singh Bahadur Boys Hostel 8
              </p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <UserCircle className="w-8 h-8" />
              <ChevronDown className="w-4 h-4" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <ul className="py-1 text-sm">
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* ===== Page Content ===== */}
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <Outlet />
        </main>

        {/* ===== Footer ===== */}
        <footer className="bg-white text-center text-gray-500 py-3 text-xs sm:text-sm border-t border-green-200">
          © {new Date().getFullYear()} Mess Management System • Made by UIETians
        </footer>
      </div>

      {/* ===== Overlay (for mobile sidebar) ===== */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 sm:hidden z-30"
        ></div>
      )}
    </div>
  );
}
