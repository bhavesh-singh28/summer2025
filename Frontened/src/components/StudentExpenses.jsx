// Mess-Admin Portal
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Plus, Search, DollarSign, User, Receipt } from "lucide-react";
import PaginationControls from "./common/PaginationControls";
import MonthDropdownButton from "./common/MonthDropdownButton";

const StudentExpenses = () => {
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);
  const [expenseData, setExpenseData] = useState({
    studentid: "",
    amount: "",
    description: "",
  });

  const [showAmountSuggestions, setShowAmountSuggestions] = useState(false);
  const [showDescriptionSuggestions, setShowDescriptionSuggestions] = useState(false);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Minimal pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const amountSuggestions = [
    { label: "Regular Meal ₹48", value: 48, description: "Regular Meal" },
    { label: "Aloo Paratha Meal ₹35", value: 35, description: "Aloo Paratha Meal" },
    { label: "Special Thali ₹50", value: 50, description: "Special Thali" },
    { label: "Tea + Samosa ₹20", value: 20, description: "Tea + Samosa" },
  ];

  const descriptionSuggestions = [
    "Regular Meal",
    "Aloo Paratha Meal",
    "Special Thali",
    "Tea + Samosa",
    "Monthly mess charges",
    "Extra meal charges",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "amount") setShowAmountSuggestions(true);
    if (name === "description") setShowDescriptionSuggestions(true);
  };

  const handleAmountClick = (value, description) => {
    setExpenseData((prev) => ({
      ...prev,
      amount: value,
      description: description || prev.description,
    }));
    setShowAmountSuggestions(false);
  };

  const handleDescriptionClick = (value) => {
    setExpenseData((prev) => ({ ...prev, description: value }));
    setShowDescriptionSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!expenseData.studentid || !expenseData.amount) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Ensure description is not empty, provide default if needed
      const description = expenseData.description?.trim() || "Mess Expense";

      console.log("API POST:", "/api/expense/add-expense");
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/expense/add-expense`,
        {
          studentid: expenseData.studentid.toUpperCase(),
          amount: parseFloat(expenseData.amount),
          description: description,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newExpense = {
        id: Date.now(),
        studentid: expenseData.studentid.toUpperCase(),
        amount: expenseData.amount,
        description: description,
        date: new Date().toISOString().split("T")[0],
      };

      setRecentExpenses((prev) => [newExpense, ...prev]);

      setExpenseData({
        studentid: "",
        amount: "",
        description: "",
      });
    } catch (error) {
      console.error("Failed to submit expense:", error);
      alert(
        error.response?.data?.message || "Something went wrong while submitting the expense"
      );
    }
  };

  useEffect(() => {
    const fetchRecentExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/expense/transactions?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const fetchedExpenses = response.data?.data || [];

        const formattedExpenses = fetchedExpenses.map((item) => ({
          id: item._id || Date.now(),
          studentid: item.studentid?.toUpperCase() || "UNKNOWN",
          amount: item.amount,
          description: item.description,
          date: item.date,
        }));

        setRecentExpenses(formattedExpenses);
        if (response.data?.totalPages) setTotalPages(response.data.totalPages);
        if (response.data?.totalRecords !== undefined) setTotalRecords(response.data.totalRecords);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      }
    };

    fetchRecentExpenses();
  }, [page, limit]);

  const filteredExpenses = recentExpenses.filter(
    (expense) =>
      expense.studentid.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper: produce last 12 months as { label, value: 'YYYY-MM' }
  const getLastMonths = (count = 12) => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < count; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString(undefined, { month: "long", year: "numeric" });
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months.push({ label, value, dateObj: d });
    }
    return months;
  };

  const months = getLastMonths(12);

  const downloadRef = useRef(null); // retained if needed elsewhere

  // New: Download PDF from backend
  const handleDownloadForMonth = async (monthValue) => {
    try {
      const token = localStorage.getItem("token");
      const url = `${import.meta.env.VITE_BACKEND_URL}/expense/download-pdf?month=${monthValue}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        alert("Failed to download PDF");
        return;
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `student-expenses-summary-${monthValue}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      alert("Error downloading PDF");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Expenses</h1>
            <p className="text-gray-600">Manage and track student expenses</p>
          </div>
        </div>
        <MonthDropdownButton
          label="Download Report"
          monthsCount={12}
          align="right"
          onSelectMonth={(value) => handleDownloadForMonth(value)}
        />
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Plus className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold text-gray-900">Add New Expense</h2>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Student ID */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Student ID *</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                name="studentid"
                value={expenseData.studentid}
                onChange={handleInputChange}
                placeholder="e.g., 22BCE1234"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div className="space-y-2 relative">
            <label className="block text-sm font-medium text-gray-700">Amount (₹) *</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="number"
                name="amount"
                value={expenseData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                onFocus={() => setShowAmountSuggestions(true)}
                onBlur={() => setTimeout(() => setShowAmountSuggestions(false), 100)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
            {showAmountSuggestions && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-y-auto">
                {amountSuggestions.map((item, i) => (
                  <li
                    key={i}
                    onMouseDown={() => handleAmountClick(item.value, item.description)}
                    className="px-4 py-2 hover:bg-green-100 cursor-pointer text-sm"
                  >
                    {item.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2 relative">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <div className="relative">
              <Receipt className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                name="description"
                value={expenseData.description}
                onChange={handleInputChange}
                placeholder="e.g., Monthly mess charges"
                onFocus={() => setShowDescriptionSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDescriptionSuggestions(false), 100)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            {showDescriptionSuggestions && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-40 overflow-y-auto">
                {descriptionSuggestions
                  .filter((desc) =>
                    desc.toLowerCase().includes(expenseData.description.toLowerCase())
                  )
                  .map((item, i) => (
                    <li
                      key={i}
                      onMouseDown={() => handleDescriptionClick(item)}
                      className="px-4 py-2 hover:bg-green-100 cursor-pointer text-sm"
                    >
                      {item}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="w-full md:w-auto px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>

      {/* Recent Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
            <div className="flex items-center">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by student ID or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent w-full sm:w-64"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expense.studentid}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-semibold text-green-600">₹{expense.amount}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    No expenses found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalRecords={totalRecords}
          limit={limit}
          setPage={setPage}
          setLimit={setLimit}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>
    </div>
  );
};

export default StudentExpenses;
