import QRCode from "react-qr-code";
import { useState, useEffect } from "react";
import { UtensilsCrossed, Bell, Receipt, RotateCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";

const StudentDashboard = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [qrToken, setQrToken] = useState("");
  const [qrLoading, setQrLoading] = useState(true);
  const [isRefreshingQr, setIsRefreshingQr] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [mealsThisMonth, setMealsThisMonth] = useState(0);
  const [avgDailyExpense, setAvgDailyExpense] = useState(0);
  const navigate = useNavigate();

  // ✅ Fetch QR token once on mount
  useEffect(() => {
    const fetchQrToken = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("/auth/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setQrToken(res.data.qrToken || "");
      } catch (err) {
        console.error("Failed to fetch QR token:", err);
        setQrToken("");
      } finally {
        setQrLoading(false);
      }
    };
    fetchQrToken();
  }, []); // ← run once

  // ✅ Fetch student data, notices, and expenses
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const mockStudent = {
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          studentId: "ST001",
          hostelBlock: "Block A",
          roomNumber: "101",
          profilePic: null,
        };
        setCurrentUser(mockStudent);
      } catch (err) {
        console.error("Failed to fetch student data:", err);
      }
    };

    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const response = await axios.get(`${backendUrl}/api/notices`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.notices)
          ? response.data.notices
          : [];
        setNotifications([...list].reverse());
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
        setNotifications([
          {
            _id: "1",
            text: "Unable to load latest notices. Please check your connection.",
            date: "Now",
          },
        ]);
      }
    };

    const fetchExpenseStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Authentication token not found.");

        const response = await axios.get("/mess-staff/transactions", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const expenses = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const thisMonthExpenses = expenses.filter((expense) => {
          const date = new Date(expense.date);
          return (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          );
        });

        setMealsThisMonth(thisMonthExpenses.length);

        const totalAmount = thisMonthExpenses.reduce(
          (acc, expense) => acc + Number(expense.amount),
          0
        );

        setAvgDailyExpense(
          thisMonthExpenses.length > 0
            ? Math.round(totalAmount / thisMonthExpenses.length)
            : 0
        );
      } catch (err) {
        console.error("Failed to fetch expense stats:", err);
      }
    };

    // Call all once
    fetchStudentData();
    fetchNotifications();
    fetchExpenseStats();
  }, []); // ← single useEffect for all

  // Refresh QR code handler
  const handleRefreshQr = async () => {
    try {
      setIsRefreshingQr(true);
      const token = localStorage.getItem("token");
      const res = await axios.post("/qr/refresh-token", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQrToken(res.data.qrToken || "");
    } catch (err) {
      alert("Failed to refresh QR code");
    } finally {
      setIsRefreshingQr(false);
    }
  };

  if (!currentUser) return <div>Loading...</div>;

  const qrSection = (
    <div style={{ margin: "2rem 0" }}>
      {qrLoading ? (
        <div>Loading QR code...</div>
      ) : qrToken ? (
        <>
          <h3>Your Mess QR Code</h3>
          <QRCode value={qrToken} size={200} />
          <button
            onClick={handleRefreshQr}
            disabled={isRefreshingQr}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1rem",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: isRefreshingQr ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              opacity: isRefreshingQr ? 0.75 : 1,
            }}
          >
            <RotateCw size={16} className={isRefreshingQr ? "animate-spin" : ""} />
            <span>{isRefreshingQr ? "Refreshing..." : "Refresh QR Code"}</span>
          </button>
        </>
      ) : (
        <div>QR code not available.</div>
      )}
    </div>
  );

  const quickStats = [
    {
      label: "Meals This Month",
      value: mealsThisMonth.toString(),
      icon: UtensilsCrossed,
      color: "text-blue-600",
    },
    {
      label: "Avg Daily Expense",
      value: `₹${avgDailyExpense}`,
      icon: Receipt,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">
      {qrSection}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Recent Notices
            </h3>
            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-sm text-gray-500">No notices available</p>
                </div>
              ) : (
                notifications.slice(0, 3).map((notification, index) => (
                  <div
                    key={notification._id || index}
                    className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400"
                  >
                    <p className="text-sm text-gray-800">{notification.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.date}
                    </p>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => navigate("/student/notifications")}
              className="w-full mt-4 text-orange-600 text-sm font-medium hover:text-orange-800 transition-colors duration-200"
            >
              View All Notices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
