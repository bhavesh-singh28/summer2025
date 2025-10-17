import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, UserCircle, ChevronDown, DollarSign } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  Utensils,
  CreditCard,
  Megaphone,
  Settings,
  Building2,
} from "lucide-react";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const dropdownRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/loginhub");
    setOpen(false);
  };

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <Building2 size={18} /> },
    { name: "Students", path: "/admin/students", icon: <Users size={18} /> },
    { name: "Menu Management", path: "/admin/menu", icon: <Utensils size={18} /> },
    { name: "Mess Management", path: "/admin/mess", icon: <Users size={18} /> },
    { name: "Student Transactions", path: "/admin/student-transactions", icon: <DollarSign className="w-5 h-5" /> },
    { name: "Billing & Payments", path: "/admin/billing", icon: <CreditCard size={18} /> },
    { name: "Notices", path: "/admin/notices", icon: <Megaphone size={18} /> },
    { name: "Logout", onClick: handleLogout, icon: <Settings size={18} />, className: "text-red-200 hover:text-red-500" },
  ];

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
      {/* Sidebar (Desktop) */}
      <aside className="hidden sm:block w-64 bg-[#ee8d4a] text-white shadow-xl">
        <div className="p-6">
          <h2 className="text-2xl font-bold tracking-wide mb-8">🏢 Admin Panel</h2>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) =>
              item.path ? (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 ${
                      isActive
                        ? "bg-white text-[#ee8d4a] font-semibold shadow-sm"
                        : "hover:bg-white hover:bg-opacity-100 hover:text-[#ee8d4a]"
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.name}</span>
                </NavLink>
              ) : (
                <div
                  key={item.name}
                  onClick={item.onClick}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 cursor-pointer ${
                    item.className || "hover:bg-white hover:bg-opacity-20"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </div>
              )
            )}
          </nav>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-40 z-40 sm:hidden transition-opacity ${
          mobileSidebar ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setMobileSidebar(false)}
      ></div>

      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#ee8d4a] text-white z-50 transform transition-transform duration-300 sm:hidden ${
          mobileSidebar ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold">🏢 Admin Panel</h2>
          <X size={24} className="cursor-pointer" onClick={() => setMobileSidebar(false)} />
        </div>
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) =>
            item.path ? (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileSidebar(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 ${
                    isActive
                      ? "bg-white text-[#ee8d4a] font-semibold shadow-sm"
                      : "hover:bg-white hover:bg-opacity-20"
                  }`
                }
              >
                {item.icon}
                <span>{item.name}</span>
              </NavLink>
            ) : (
              <div
                key={item.name}
                onClick={() => {
                  item.onClick?.();
                  setMobileSidebar(false);
                }}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition duration-200 cursor-pointer ${
                  item.className || "hover:bg-white hover:bg-opacity-20"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </div>
            )
          )}
        </nav>
      </aside>

      {/* Main Section */}
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
            <h1 className="text-lg sm:text-2xl font-semibold text-gray-800 leading-tight">
              Baba Banda Singh Bahadur Boys Hostel 8
            </h1>
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
                <ul className="py-1 text-sm">
                  {navItems.map((item, idx) => (
                    <React.Fragment key={idx}>
                      <li
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${item.className}`}
                      >
                        {item.path ? (
                          <NavLink
                            to={item.path}
                            className="flex items-center space-x-2"
                            onClick={() => setOpen(false)}
                          >
                            {item.icon}
                            <span>{item.name}</span>
                          </NavLink>
                        ) : (
                          <div
                            className="flex items-center space-x-2"
                            onClick={item.onClick}
                          >
                            {item.icon}
                            <span>{item.name}</span>
                          </div>
                        )}
                      </li>
                      {idx === 0 && <hr className="my-1" />}
                    </React.Fragment>
                  ))}
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
