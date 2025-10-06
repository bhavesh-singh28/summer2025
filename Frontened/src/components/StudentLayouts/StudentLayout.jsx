import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { UserCircle, ChevronDown } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  UtensilsCrossed,
  Calendar,
  Receipt,
  Bell,
  Settings,
  User,
  CreditCard,
  Star,
} from "lucide-react";


const studentNavItems = [
  {
    name: "Dashboard",
    path: "/student/dashboard",
    icon: <Home size={18} />,
  },
  {
    name: "Menu",
    path: "/student/menu",
    icon: <UtensilsCrossed size={18} />,
  },
  {
    name: "Expenses",
    path: "/student/expenses",
    icon: <Receipt size={18} />,
  },
  {
    name: "Notices",
    path: "/student/notifications",
    icon: <Bell size={18} />,
  },
  {
    name: "Profile",
    path: "/student/profile",
    icon: <User size={18} />,
  },
  {
    name: "Settings",
    path: "/student/settings",
    icon: <Settings size={18} />,
  },
];

export default function StudentLayout() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();

  // Use user data from auth context
  const currentStudent = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")).studentDetails : {
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

  if (!currentStudent) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#4f46e5] text-white shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-wide mb-8">
            🎓Student Portal
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
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/PU_Logo.png" alt="PU Logo" className="h-16 w-auto" />
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">
                Baba Banda Singh Bahadur Boys Hostel 8
              </h1>
              <p className="text-sm text-gray-600">
                Student Mess Management Portal
              </p>
            </div>
          </div>

          {/* Profile Dropdown */}
          <div className="flex items-center space-x-4">

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900 focus:outline-none"
              >
                <img
                  src={currentStudent.imageUrl || "/src/assets/ProfilePic.png"}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover bg-gray-100 p-1"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-400">
                    {currentStudent.firstName} {currentStudent.lastName}
                  </p>
                  <p className="text-xs text-gray-500 ">
                    {currentStudent.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>

              {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border">
                  <ul className="py-1 text-sm text-gray-700">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <NavLink
                        to="/student/profile"
                        className="flex items-center space-x-2"
                      >
                        <User className="h-4 w-4" />
                        <span>View Profile</span>
                      </NavLink>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <NavLink
                        to="/student/settings"
                        className="flex items-center space-x-2"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </NavLink>
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                      <NavLink
                        to="/student/expenses"
                        className="flex items-center space-x-2"
                      >
                        <Receipt className="h-4 w-4" />
                        <span>View Expenses</span>
                      </NavLink>
                    </li>
                    <hr className="my-1" />
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600">
                      <div
                        className="flex items-center space-x-2"
                        onClick={logout}
                      >
                        <span>Logout</span>
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white text-center text-gray-500 py-3 text-sm border-t">
          © {new Date().getFullYear()} Hostel Management System • Made by
          UIETians
        </footer>
      </div>
    </div>
  );
}
