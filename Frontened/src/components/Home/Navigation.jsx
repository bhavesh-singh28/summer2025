import React, { useState } from 'react';
import { ChefHat, Menu, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (hash) => {
    setIsMenuOpen(false);
    if (location.pathname === '/') {
      if (!hash) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(`/${hash}`);
    }
  };

  const isHub = location.pathname === '/loginhub';
  const isStudent = location.pathname === '/student-login';
  const isAdmin = location.pathname.startsWith('/admin-login');

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            onClick={() => navigate('/')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 bg-[#ee8d4a] rounded-lg flex items-center justify-center shadow-sm">
              <ChefHat className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">PU Food Hub</h1>
              <p className="text-xs text-gray-600">Mess & Canteen Manager</p>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => handleNav('')}
              className="text-gray-700 hover:text-[#ee8d4a] transition-colors cursor-pointer font-medium"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('#features')}
              className="text-gray-700 hover:text-[#ee8d4a] transition-colors cursor-pointer font-medium"
            >
              Features
            </button>
            <button
              onClick={() => handleNav('#expenses')}
              className="text-gray-700 hover:text-[#ee8d4a] transition-colors cursor-pointer font-medium"
            >
              Expense Tracker
            </button>
            <button
              onClick={() => handleNav('#about')}
              className="text-gray-700 hover:text-[#ee8d4a] transition-colors cursor-pointer font-medium"
            >
              About
            </button>
            <button
              onClick={() => handleNav('#contact')}
              className="text-gray-700 hover:text-[#ee8d4a] transition-colors cursor-pointer font-medium"
            >
              Contact
            </button>

            {isHub ? (
              <button
                onClick={() => navigate('/')}
                className="bg-[#ee8d4a] text-white px-5 py-2 rounded-lg hover:bg-[#d67a3a] transition-colors font-medium shadow-sm cursor-pointer"
              >
                Home
              </button>
            ) : isStudent ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/loginhub')}
                  className="text-gray-700 hover:text-[#ee8d4a] font-medium transition cursor-pointer"
                >
                  Login Hub
                </button>
                <button
                  onClick={() => navigate('/admin-login')}
                  className="bg-[#ee8d4a] text-white px-5 py-2 rounded-lg hover:bg-[#d67a3a] transition-colors font-medium shadow-sm cursor-pointer"
                >
                  Admin Login
                </button>
              </div>
            ) : isAdmin ? (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate('/loginhub')}
                  className="text-gray-700 hover:text-[#ee8d4a] font-medium transition cursor-pointer"
                >
                  Login Hub
                </button>
                <button
                  onClick={() => navigate('/student-login')}
                  className="bg-[#ee8d4a] text-white px-5 py-2 rounded-lg hover:bg-[#d67a3a] transition-colors font-medium shadow-sm cursor-pointer"
                >
                  Student Login
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/loginhub')}
                className="bg-[#ee8d4a] text-white px-6 py-2 rounded-lg hover:bg-[#d67a3a] transition-colors font-medium shadow-sm cursor-pointer"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-700 hover:text-[#ee8d4a] cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t py-3 space-y-2">
            <button
              onClick={() => handleNav('')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#ee8d4a] font-medium"
            >
              Home
            </button>
            <button
              onClick={() => handleNav('#features')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#ee8d4a] font-medium"
            >
              Features
            </button>
            <button
              onClick={() => handleNav('#expenses')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#ee8d4a] font-medium"
            >
              Expense Tracker
            </button>
            <button
              onClick={() => handleNav('#about')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#ee8d4a] font-medium"
            >
              About
            </button>
            <button
              onClick={() => handleNav('#contact')}
              className="block w-full text-left px-3 py-2 text-gray-700 hover:text-[#ee8d4a] font-medium"
            >
              Contact
            </button>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                navigate(isHub ? '/' : '/loginhub');
              }}
              className="w-full text-center bg-[#ee8d4a] text-white px-4 py-2.5 rounded-lg hover:bg-[#d67a3a] transition-colors font-semibold"
            >
              {isHub ? 'Home' : 'Login Hub'}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
