import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import StudentLayout from "../../StudentLayouts/StudentLayout";
import StudentDashboard from "../../../components/StudentDashboard";
import { getWeeklyMenu } from "../../../api/menuApi";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import StudentSettings from "../../Students/Settings/StudentSettings";
import defaultpic from "../../../assets/ProfilePic.png";

// ----- Student Menu -----
const StudentMenu = () => {
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const response = await getWeeklyMenu();
        if (response.success) setWeeklyMenu(response.data);
        else setError("Failed to fetch menu data");
      } catch (err) {
        console.error("Error fetching menu:", err);
        setError("Failed to load menu. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const getMenuForDay = (day) => weeklyMenu.find((menu) => menu.day === day);
  const getMealColor = (mealType) =>
    ({
      breakfast: "border-blue-500",
      lunch: "border-green-500",
      dinner: "border-purple-500",
    }[mealType] || "border-gray-500");

  if (loading)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📅 Weekly Menu
        </h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          📅 Weekly Menu
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">📅 Weekly Menu</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {daysOfWeek.map((day) => {
          const dayMenu = getMenuForDay(day);
          return (
            <div key={day} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {day}
              </h3>
              {dayMenu ? (
                <div className="space-y-3">
                  {dayMenu.meals.map((meal, index) => (
                    <div
                      key={index}
                      className={`border-l-4 ${getMealColor(meal.type)} pl-3`}
                    >
                      <p className="font-medium text-sm text-gray-600 capitalize">
                        {meal.type}
                      </p>
                      <p className="text-sm text-gray-800">
                        {meal.items.join(", ")}
                      </p>
                      {meal.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {meal.description}
                        </p>
                      )}
                      {meal.calories && (
                        <p className="text-xs text-blue-600 mt-1">
                          {meal.calories} cal
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No menu available</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Menu will be updated soon
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};




// ----- Student Expenses -----
const StudentExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [student, setStudent] = useState(null); // to hold student base details
  const [showExportMonths, setShowExportMonths] = useState(false);
  const exportRef = useRef(null);

  const getLastMonths = (count = 12) => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString(undefined, { month: "long", year: "numeric" });
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ label, value });
    }
    return months;
  };

  const exportMonths = getLastMonths(12);

  useEffect(() => {
    const handler = (e) => {
      if (showExportMonths && exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMonths(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showExportMonths]);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const token = localStorage.getItem("token"); // or however you store it

        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/personaldetail/view`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const loggedInStudent = localStorage.getItem("user"); // or extract from decoded JWT
        const loggedInStudentId = loggedInStudent
          ? JSON.parse(loggedInStudent).studentDetails._id
          : null;
        if (!loggedInStudentId) throw new Error("Student ID not found in localStorage");

        const match = res.data.personaldetailList.find(
          (p) => p._id === loggedInStudentId
        );
        ("Matched student details:", match);
        if (match) {
          setStudent(match);
        }
      } catch (error) {
        console.error("Failed to fetch student details:", error);
      }
    };

    fetchStudentDetails();
  }, []);

  useEffect(() => {
  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found.");
      if (!student?._id) return; // Wait for studentid
     
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/expense/transactions/${student._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      ("Student expenses API response:", response.data);
      if (response.data.status === 1 && Array.isArray(response.data.data)) {
        setExpenses(response.data.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching expenses:", err);
      setError("Failed to load expenses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (student?.studentid) fetchExpenses();
}, [student]);

  if (loading)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          💸 My Expenses
        </h1>
        <p className="text-gray-500 text-center">Loading...</p>
      </div>
    );

  if (error)
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          💸 My Expenses
        </h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-md text-center">
          {error}
        </div>
      </div>
    );
  const downloadPDF = () => {
    if (!student) {
      alert("Student info not loaded yet!");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Student Expenses Report", 14, 20);

    doc.setFontSize(12);
    doc.text(`Name: ${student.firstname} ${student.lastname}`, 14, 30);
    doc.text(`Student ID: ${student.studentid}`, 14, 38);
    doc.text(`Email: ${student.email}`, 14, 46);
    doc.text(`Phone: ${student.phone}`, 14, 54);
    doc.text(`Room: ${student.hostelblock} - ${student.roomno}`, 14, 62);
    doc.text(
      `Address: ${student.address}, ${student.city}, ${student.state} - ${student.zipcode}`,
      14,
      70
    );

    autoTable(doc, {
      startY: 80,
      head: [["Description", "Date", "Amount"]],
      body: expenses.map((e) => [
        e.description,
        new Date(e.date).toLocaleDateString(),
        `Rs. ${e.amount}`,
      ]),
    });

    const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    doc.text(`Total Expense: Rs. ${total}`, 14, doc.lastAutoTable.finalY + 10);

    doc.save("expenses_report.pdf");
  };

  const downloadStudentTotalsForMonth = (monthValue) => {
    if (!student) {
      alert('Student info not loaded yet!');
      return;
    }

    // Filter student's expenses for that month
    const filtered = expenses.filter((e) => {
      const d = new Date(e.date);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return ym === monthValue;
    });

    if (!filtered.length) {
      alert('No expenses for selected month.');
      setShowExportMonths(false);
      return;
    }

    // Aggregate totals per category (not needed per-student since this is single student)
    const total = filtered.reduce((s, it) => s + (parseFloat(it.amount) || 0), 0);

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Monthly Expense Summary', 14, 20);
    doc.setFontSize(11);
    doc.text(`Student: ${student.firstname} ${student.lastname} (${student.studentid})`, 14, 28);
    doc.text(`Month: ${monthValue}`, 14, 36);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 44);

    autoTable(doc, {
      startY: 52,
      head: [['Description', 'Date', 'Amount']],
      body: filtered.map((e) => [e.description, new Date(e.date).toLocaleDateString(), `Rs. ${e.amount}`]),
    });

    doc.text(`Total Expense: Rs. ${total.toFixed(2)}`, 14, doc.lastAutoTable.finalY + 10);
    doc.save(`student_monthly_expense_${monthValue}.pdf`);
    setShowExportMonths(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">💸 My Expenses</h1>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Expenses</h2>
            <div className="relative" ref={exportRef}>
              <button
                onClick={() => setShowExportMonths((s) => !s)}
                className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-lg text-sm"
              >
                Download Report
              </button>

              {showExportMonths && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  <div className="p-2 text-sm font-medium text-gray-700">Select Month</div>
                  <ul className="max-h-56 overflow-y-auto">
                    {exportMonths.map((m) => (
                      <li key={m.value} className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => downloadStudentTotalsForMonth(m.value)}>
                        {m.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <p className="text-center text-gray-500">No expenses found.</p>
            ) : (
              expenses.map((expense, i) => (
                <div
                  key={expense._id || i}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-full ${
                        i % 2 === 0 ? "bg-red-100" : "bg-orange-100"
                      }`}
                    >
                      <span
                        className={`text-xs ${
                          i % 2 === 0 ? "text-red-600" : "text-orange-600"
                        }`}
                      >
                        {expense.description?.toLowerCase().includes("mess")
                          ? "🍽️"
                          : "☕"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {expense.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold text-red-600">
                    -Rs. {expense.amount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----- Notifications -----
const StudentNotifications = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotices = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/notices`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    ("Notices API response:", response.data);

    let data = [];

    if (Array.isArray(response.data)) {
      data = response.data;
    } else if (Array.isArray(response.data.data)) {
      data = response.data.data;
    } else if (Array.isArray(response.data.notices)) {
      data = response.data.notices;
    } else {
      throw new Error("Unexpected API response format.");
    }

    const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
    setNotices(sorted);
  } catch (err) {
    console.error("Error fetching notices:", err);
    setError("Failed to load notices.");
  } finally {
    setLoading(false);
  }
};
    fetchNotices();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">🔔 Notices</h1>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : notices.length === 0 ? (
        <p className="text-gray-500">No notices available.</p>
      ) : (
        <div className="space-y-4">
          {notices.map((notice, index) => (
            <div
              key={notice._id || index}
              className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded"
            >
              <p className="text-gray-800">{notice.text}</p>
              <p className="text-sm text-gray-500 mt-1">{notice.date}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ----- Profile -----
const StudentProfile = () => {
  const [student, setStudent] = useState(null);
  const [phone, setPhone] = useState("");
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setStudent(user.studentDetails);
    }
  }, []);
  if (!student) return <div>Loading profile...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <img
            src={student.imageUrl || defaultpic}
            alt="Profile"
            className="h-24 w-24 rounded-full mx-auto mb-4 object-cover bg-gray-100 p-2"
          />
          <h2 className="text-xl font-semibold">
            {student.firstname} {student.lastname}
          </h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Personal Info</h3>
          <div className="space-y-4">
            <input
              type="text"
              readOnly
              value={`${student.firstname} ${student.lastname}`}
              className="w-full border px-3 py-2 rounded-lg"
            />
            <input
              type="email"
              value={student.email}
              readOnly
              className="w-full border px-3 py-2 rounded-lg"
            />
            <input
              type="tel"
              value={student.phone}
              readOnly
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border px-3 py-2 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};



// ----- Settings -----
<StudentSettings />



// ----- Student Routes -----
const StudentRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<StudentLayout />}>
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="menu" element={<StudentMenu />} />
        <Route path="expenses" element={<StudentExpenses />} />
        <Route path="notifications" element={<StudentNotifications />} />
        <Route path="profile" element={<StudentProfile />} />
        <Route path="settings" element={<StudentSettings />} />
        <Route
          path="*"
          element={<Navigate to="/student/dashboard" replace />}
        />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
