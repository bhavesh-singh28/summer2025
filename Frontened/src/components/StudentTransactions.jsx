import React, { useState, useEffect } from "react";
import {
  Search,
  Download,
  Filter,
  Eye,
  Calendar,
  DollarSign,
} from "lucide-react";
import axios from "../api/axiosConfig";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
const StudentTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, mess, canteen
  const [dateFilter, setDateFilter] = useState("all"); // all, today, week, month

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType, dateFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // First, test basic connectivity
      try {
        ("🧪 Testing server connectivity...");
  ("API GET:", "/api/server-test");
  const serverTestResponse = await axios.get("/api/server-test");
        ("✅ Server test response:", serverTestResponse.data);

        ("🧪 Testing mess staff route connectivity...");
  ("API GET:", "/api/mess-staff/test");
  const testResponse = await axios.get("/api/mess-staff/test");
        ("✅ Test route response:", testResponse.data);

        // Test transactions route without auth
        ("API GET:", "/api/expense/transactions");
        const transactionsTestResponse = await axios.get(
          "/api/expense/transactions"
        );
        (
          "✅ Transactions test route response:",
          transactionsTestResponse.data
        );
      } catch (testErr) {
        ("❌ Test route failed:", testErr.response?.status);
        ("❌ Test route error:", testErr.message);
        ("❌ Full test error:", testErr);
      }

      // Fetch mess transactions
  ("API GET:", "/api/expense/transactions");
  const messResponse = await axios.get("/expense/transactions", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let allTransactions = [];

      // Process mess transactions
      if (
        messResponse.data.status === 1 &&
        Array.isArray(messResponse.data.data)
      ) {
        const messTransactions = messResponse.data.data.map((transaction) => ({
          ...transaction,
          type: "mess",
          typeName: "Mess",
          id: transaction._id || transaction.id,
        }));
        allTransactions = [...allTransactions, ...messTransactions];
      }

      // TODO: Fetch canteen transactions when available
      // const canteenResponse = await axios.get("/canteen-staff/transactions", {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });
      //
      // if (canteenResponse.data && Array.isArray(canteenResponse.data)) {
      //   const canteenTransactions = canteenResponse.data.map(transaction => ({
      //     ...transaction,
      //     type: "canteen",
      //     typeName: "Canteen",
      //     id: transaction._id || transaction.id,
      //   }));
      //   allTransactions = [...allTransactions, ...canteenTransactions];
      // }

      // Sort by date (newest first)
      allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(allTransactions);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);

      // Enhanced error messages
      if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
      } else if (err.response?.status === 403) {
        setError(
          "You don't have permission to view transactions. Please contact admin."
        );
      } else if (err.response?.status === 404) {
        setError("Transactions endpoint not found. Please contact support.");
      } else if (err.code === "ECONNREFUSED" || !err.response) {
        setError(
          "Cannot connect to server. Please make sure the backend is running on port 5000."
        );
      } else {
        setError("Failed to load transactions. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = [...transactions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (transaction) =>
          transaction.studentid
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          transaction.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.description
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(
        (transaction) => transaction.type === filterType
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((transaction) => {
        const transactionDate = new Date(transaction.date);

        switch (dateFilter) {
          case "today":
            return transactionDate >= today;
          case "week":
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return transactionDate >= weekAgo;
          case "month":
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return transactionDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredTransactions(filtered);
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce(
      (sum, transaction) => sum + (transaction.amount || 0),
      0
    );
  };

const downloadPDF = () => {
  // --- 1. Data Aggregation (No changes here) ---
  const monthlyTotals = filteredTransactions.reduce((acc, transaction) => {
    if (!transaction.studentid) {
      return acc;
    }
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const key = `${transaction.studentid}_${monthKey}`;
    if (!acc[key]) {
      acc[key] = {
        studentid: transaction.studentid,
        typeName: transaction.typeName || "N/A",
        amount: 0,
        month: monthKey,
      };
    }
    acc[key].amount += transaction.amount || 0;
    return acc;
  }, {});

  const aggregatedData = Object.values(monthlyTotals);

  // --- 2. PDF Generation ---
  const doc = new jsPDF();
  const tableColumn = ["Student ID", "Type", "Month", "Total Amount"];
  
  const tableRows = aggregatedData.map(data => [
    data.studentid,
    data.typeName,
    data.month,
    // **FIXED LINE**: Changed the Rupee symbol to "Rs." for proper rendering and alignment
    `Rs. ${data.amount.toFixed(2)}`,
  ]);

  // Add a styled header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Monthly Student Transaction Totals", 14, 22);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report Generated: ${new Date().toLocaleDateString()}`, 14, 29);

  // Use autoTable with styling options
  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 35,
    theme: 'grid',
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 249, 252],
    },
    columnStyles: {
      3: { halign: 'right' }, // This will now work correctly
    },
    didDrawPage: function (data) {
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFontSize(10);
      doc.text(
        'Page ' + data.pageNumber + ' of ' + pageCount,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    },
  });

  // --- 3. Save the PDF ---
  doc.save(`monthly_student_totals_${new Date().toISOString().split("T")[0]}.pdf`);
};

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Student Transactions
        </h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Student Transactions
        </h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchTransactions}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Transactions
            </h1>
            <p className="text-gray-600">
              Monitor all student transactions across mess and canteen
            </p>
          </div>
        </div>
        <button
          onClick={downloadPDF}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export PDF</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Transactions
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredTransactions.length}
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">
                ₹{getTotalAmount().toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Mess Transactions
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {filteredTransactions.filter((t) => t.type === "mess").length}
              </p>
            </div>
            <div className="text-2xl">🍽️</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Canteen Transactions
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {
                  filteredTransactions.filter((t) => t.type === "canteen")
                    .length
                }
              </p>
            </div>
            <div className="text-2xl">☕</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by student ID, email, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>

          {/* Type Filter */}
          <div className="relative">
            <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full appearance-none"
            >
              <option value="all">All Types</option>
              <option value="mess">Mess Only</option>
              <option value="canteen">Canteen Only</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full appearance-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchTransactions}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        {searchTerm || filterType !== "all" || dateFilter !== "all" ? (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredTransactions.length} of {transactions.length}{" "}
              transactions
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterType("all");
                setDateFilter("all");
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        ) : null}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.studentid || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === "mess"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {transaction.type === "mess" ? "🍽️" : "☕"}{" "}
                        {transaction.typeName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.description || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ₹{transaction.amount || 0}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm || filterType !== "all" || dateFilter !== "all"
                      ? "No transactions found matching your criteria"
                      : "No transactions found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentTransactions;
