import React from "react";
import { useLocation } from "react-router-dom";
import SignupFlow from "./SignupFlow";
import Navigation from "../Home/Navigation";

const StudentSignup = ({ isTest = false }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isTestMode =
    isTest ||
    searchParams.get("test") === "true" ||
    location.pathname === "/test-signup";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Navigation />
      <div className="flex-1 p-4 md:p-8">
        <SignupFlow initialTestMode={isTestMode} />
      </div>
    </div>
  );
};

export default StudentSignup;
