import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Menu, X, ChevronDown, User, Settings, Receipt } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  UtensilsCrossed,
  Bell,
} from "lucide-react";

const studentNavItems = [
  { name: "Dashboard", path: "/student/dashboard", icon: <Home size={18} /> },
  { name: "Menu", path: "/student/menu", icon: <UtensilsCrossed size={18} /> },
  { name: "Expenses", path: "/student/expenses", icon: <Receipt size={18} /> },
  { name: "Notices", path: "/student/notifications", icon: <Bell size={18} /> },
  { name: "Profile", path: "/student/profile", icon: <User size={18} /> },
  { name: "Settings", path: "/student/settings", icon: <Settings size={18} /> },
];

export default function StudentLayout() {
  const [open, setOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  const currentStudent = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")).studentDetails
    : {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        studentId: "ST001",
        hostelBlock: "Block A",
        roomNumber: "101",
        profilePic: null,
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

  if (!currentStudent) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar for Desktop */}
      <aside className="hidden sm:block w-64 bg-[#4f46e5] text-white shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-wide mb-8">
            🎓 Student Portal
          </h2>
          <nav className="flex flex-col gap-2">
            {studentNavItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 ${
                    isActive
                      ? "bg-white text-[#4f46e5] font-semibold shadow-sm"
                      : "hover:bg-white hover:text-[#4f46e5] hover:bg-opacity-20"
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

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 sm:hidden transition-opacity ${
          mobileSidebar ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMobileSidebar(false)}
      ></div>

      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#4f46e5] text-white z-50 transform transition-transform duration-300 sm:hidden ${
          mobileSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">🎓 Student Portal</h2>
          <X
            size={24}
            className="cursor-pointer"
            onClick={() => setMobileSidebar(false)}
          />
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {studentNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileSidebar(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 ${
                  isActive
                    ? "bg-white text-[#4f46e5] font-semibold shadow-sm"
                    : "hover:bg-white hover:bg-opacity-20"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-white shadow px-4 sm:px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button */}
            <button
              className="sm:hidden p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
              onClick={() => setMobileSidebar(true)}
            >
              <Menu size={24} />
            </button>

            <img src="/PU_Logo.png" alt="PU Logo" className="h-10 sm:h-16 w-auto" />
            <div>
              <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 leading-tight">
                Mehr Chand Mahajan Boys' Hostel Number 1
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">
                Student Mess Management Portal
              </p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <img
                src={currentStudent.imageUrl || "/src/assets/ProfilePic.png"}
                alt="Profile"
                className="h-15 w-15 sm:h-10 sm:w-10 rounded-full object-cover bg-gray-100 p-1"
              />
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-600">
                  {currentStudent.firstName} {currentStudent.lastName}
                </p>
                <p className="text-xs text-gray-500">{currentStudent.email}</p>
              </div>
              <ChevronDown className="w-8 h-8 m-0 p-0 sm:w-4 sm:h-4" />
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                <ul className="py-1 text-sm text-gray-700">
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <NavLink
                      to="/student/profile"
                      className="flex items-center space-x-2"
                      onClick={() => setOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>View Profile</span>
                    </NavLink>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <NavLink
                      to="/student/settings"
                      className="flex items-center space-x-2"
                      onClick={() => setOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </NavLink>
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                    <NavLink
                      to="/student/expenses"
                      className="flex items-center space-x-2"
                      onClick={() => setOpen(false)}
                    >
                      <Receipt className="h-4 w-4" />
                      <span>View Expenses</span>
                    </NavLink>
                  </li>
                  <hr className="my-1" />
                  <li
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                    onClick={logout}
                  >
                    <span>Logout</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white text-center text-gray-500 py-3 text-xs sm:text-sm border-t">
          © {new Date().getFullYear()} Hostel Management System • Made by UIETians
        </footer>
      </div>
    </div>
  );
}
