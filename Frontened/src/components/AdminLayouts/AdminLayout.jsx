import React, { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { UserCircle, ChevronDown, DollarSign } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  Users,
  Utensils,
  ScrollText,
  CreditCard,
  Megaphone,
  Settings,
  Building2,
} from "lucide-react";

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
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
    // { name: "Canteen Management", path: "/admin/canteen", icon: <ScrollText size={18} /> },
    { name: "Student Transactions", path: "/admin/student-transactions", icon: <DollarSign className="w-5 h-5" /> },
    { name: "Billing & Payments", path: "/admin/billing", icon: <CreditCard size={18} /> },
    { name: "Notices", path: "/admin/notices", icon: <Megaphone size={18} /> },
    // { name: "Settings", path: "/admin/settings", icon: <Settings size={18} /> },
    { name: "Logout", onClick: handleLogout, icon: <Settings size={18} /> },
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
    <div className="flex min-h-screen bg-gray-50 text-gray-800 font-sans ">
      {/* Sidebar */}
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

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 mr-4">
            <img src="/PU_Logo.png" alt="PU Logo" className="h-16 w-auto" />
            <h1 className="text-xl sm:text-3xl font-semibold text-gray-800">
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
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="bg-white text-center text-gray-500 py-3 text-sm border-t">
          © {new Date().getFullYear()} Hostel Management System • Made by UIETians
        </footer>
      </div>
    </div>
  );
}
