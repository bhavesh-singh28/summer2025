import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Login from "./components/login";
import Signup from "./components/signup";
import FloatingImages from "./components/FloatingImages";
import logo from "./assets/pulogo.png";
import logo1 from "./assets/Uietlogo.png";
import Navigation from "./components/Home/Navigation";

const LoginPage = ({ mode = "login" }) => {
  const [showLogin, setShowLogin] = useState(true);
  const { role } = useParams();

  useEffect(() => {
    setShowLogin(mode === "login" || role);
  }, [mode, role]);

  const toggleLogin = () => setShowLogin(!showLogin);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />
      <div className="flex-1 flex">
        {/* Left Side */}
        <div className="w-1/2 bg-orange-300 text-white rounded-r-[60px] flex flex-col p-12 relative overflow-hidden">
          <FloatingImages />

          <div className="flex justify-between items-center text-sm mb-8 z-10">
            <div className="flex gap-4">
              <button onClick={() => navigate("/")} className="transition duration-150 ease-in-out bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full font-medium cursor-pointer">HOME</button>
              <button onClick={() => navigate("/loginhub")} className="transition duration-150 ease-in-out bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full font-medium cursor-pointer">LOGIN HUB</button>
              <button onClick={toggleLogin} className="transition duration-150 ease-in-out bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-full font-medium cursor-pointer">
                {showLogin ? "SIGN UP" : "LOG IN"}
              </button>
            </div>
          </div>

          <div className="absolute top-6 right-6 flex flex-row items-center gap-4 z-10">
            <img className="rounded-full object-cover w-12 h-12" src={logo} alt="PU Logo" />
            <img className="rounded-full object-cover w-12 h-12" src={logo1} alt="UIET Logo" />
          </div>

          <div className="flex-grow" />
        </div>

        {/* Right Side */}
        <div className="w-1/2 flex flex-col justify-center items-center rounded-l-[60px] bg-white p-12">
          <div className="w-full max-w-md">
            {mode === "signup" ? (
              <Signup />
            ) : (
              <>
                <Login role={role || mode} />
                {mode !== "student" && (
                  <>
                    <div className="text-center text-gray-400 my-4">Or</div>
                    <button
                      onClick={toggleLogin}
                      className="w-full bg-gray-200 text-black py-3 rounded-full font-semibold cursor-pointer hover:bg-gray-300 transition"
                    >
                      {showLogin ? "Switch to Sign Up" : "Switch to Log In"}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
