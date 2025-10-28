import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { UserCircle, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { Utensils, Settings, DollarSign } from "lucide-react";

const navItems = [
  {
    name: "Menu Management",
    path: "/admin/menu",
    icon: <Utensils size={18} />,
  },
  {
    name: "Student Expenses",
    path: "/admin/expenses",
    icon: <DollarSign size={18} />,
  },
  {
    name: "Settings",
    path: "/admin/settings",
    icon: <Settings size={18} />,
  },
];

export default function CanteenAdminLayout() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/loginhub");
    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-purple-600 to-purple-700 text-white shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-wide mb-8">
            🍕 Canteen Admin
          </h2>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 ${
                    isActive
                      ? "bg-white text-purple-700 font-semibold shadow-sm"
                      : "hover:bg-white hover:bg-opacity-20"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center border-b-2 border-purple-200">
          <div className="flex items-center gap-3">
            <img src="/PU_Logo.png" alt="PU Logo" className="h-16 w-auto" />
            <div>
              <h1 className="text-3xl font-semibold text-gray-800">
                Canteen Management System
              </h1>
              <p className="text-sm text-purple-600 font-medium">
                Mehr Chand Mahajan Boys' Hostel Number 1
              </p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <UserCircle className="w-8 h-8" />
              <ChevronDown className="w-4 h-4" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                <ul className="py-1 text-sm text-gray-700">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <NavLink
                      to="/admin/settings"
                      className="flex items-center space-x-2"
                      onClick={() => setOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </NavLink>
                  </li>
                  <hr className="my-1" />
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">
                    <div
                      className="flex items-center space-x-2"
                      onClick={handleLogout}
                    >
                      <span>Logout</span>
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white text-center text-gray-500 py-3 text-sm border-t border-purple-200">
          © {new Date().getFullYear()} Canteen Management System • Made by
          UIETians
        </footer>
      </div>
    </div>
  );
}
