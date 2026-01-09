import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { Routes, Route, Navigate } from "react-router-dom";

// ===== Import Your Components =====
import LandingPage from "./components/Pages/Landingpage/Landingpage";
import NotFound from "./components/NotFound";
import AdminRoutes from "./components/Pages/Adminroutesdef/Adminroutes";
import StudentRoutes from "./components/Pages/Studentroutesdef/StudentRoutes";
import LoginHub from "./components/LoginHub";
import AdminLogin from "./components/AdminLogin";
import AdminLoginForm from "./components/AdminLoginForm";
import LoginPage from "./LoginPage";
import StudentLogin from "./components/Students/StudentLogin";
import StudentSignup from "./components/Students/StudentSignup";
import MessAdminRoutes from "./components/Pages/Admin/MessAdminRoutes";
import MaintenancePage from "./MaintenancePage.jsx";

// ===== Main Routes =====
import { useAuth } from "./context/AuthContext";

const AppRoutes = () => {
  const { user, isLoggedIn } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/loginhub" element={<LoginHub />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route path="/admin-login-form" element={<AdminLoginForm />} />
      <Route path="/login/:role" element={<LoginPage />} />
      <Route path="/student-login" element={<StudentLogin />} />
      <Route path="/signup" element={<LoginPage mode="signup" />} />
      <Route path="/student-signup" element={<StudentSignup />} />
      <Route path="/mess-admin/*" element={<MessAdminRoutes />} />

      <Route
        path="/student/*"
        element={
          isLoggedIn && user?.role === "student" ? (
            <StudentRoutes />
          ) : (
            <Navigate to="/loginhub" replace />
          )
        }
      />

      <Route
        path="/admin/*"
        element={
          isLoggedIn &&
          (user?.role === "superadmin" ||
            user?.role === "canteenadmin" ||
            user?.role === "messadmin") ? (
            <AdminRoutes role={user.role} />
          ) : (
            <Navigate to="/loginhub" replace />
          )
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// ===== Root App Component with Maintenance Mode =====
const MAINTENANCE_MODE = import.meta.env.VITE_MAINTENANCE_MODE === "true";

const App = () => {
  return (
    <AuthProvider>
      {MAINTENANCE_MODE ? <MaintenancePage /> : <AppRoutes />}
    </AuthProvider>
  );
};

export default App;
