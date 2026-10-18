import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";

const NoticeBoard = () => {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = localStorage.getItem("token");
        const rawBackend = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").trim();
        const backendBase = rawBackend.replace(/\/api\/?$/, "");
        const res = await axios.get(`${backendBase}/api/notices`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.notices)
          ? res.data.notices
          : [];
        setNotices([...data].reverse());
      } catch {
        // Graceful handling without noisy console
      }
    };
    fetchNotices();
  }, []);

  const handleAddNotice = async () => {
    if (newNotice.trim() !== "") {
      setIsLoading(true);
      const now = new Date();
      const formattedDate = now.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      const noticeData = { text: newNotice, date: formattedDate };

      try {
        const token = localStorage.getItem("token");
        const rawBackend = (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000").trim();
        const backendBase = rawBackend.replace(/\/api\/?$/, "");
        await axios.post(`${backendBase}/api/notices`, noticeData, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setNotices([noticeData, ...notices]);
        setNewNotice("");
      } catch (err) {
        // error handling
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleAddNotice();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className=" mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            📢 Notice Management
          </h1>
        </div>

        {/* Add Notice Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-500 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">
              Add New Notice
            </h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <textarea
                placeholder="Type your notice here... (Press Enter to post)"
                value={newNotice}
                onChange={(e) => setNewNotice(e.target.value)}
                onKeyPress={handleKeyPress}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all duration-200 resize-none text-gray-700 placeholder-gray-400"
              />
              <div className="absolute bottom-3 right-3 text-sm text-gray-400">
                {newNotice.length}/500
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                This notice will be visible to all students
              </p>

              <button
                onClick={handleAddNotice}
                disabled={!newNotice.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Publish Notice
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Notice List Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">
                Published Notices
              </h2>
            </div>
            <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-full text-sm font-medium">
              {notices.length} Active
            </span>
          </div>

          {notices.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No notices published yet
              </h3>
              <p className="text-gray-500">
                Create your first notice to communicate with students
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((notice, index) => (
                <div
                  key={index}
                  className="group bg-orange-50 border-l-4 border-orange-400 rounded-lg p-6 hover:shadow-lg transition-all duration-200"

                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-200 to-red-200 text-orange-800">
                          📢 Notice #
                          {(notices.length - index).toString().padStart(3, "0")}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          Live
                        </span>
                      </div>

                      <p className="text-gray-800 leading-relaxed text-lg font-medium mb-4">
                        {notice.text}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span className="font-medium">
                              Published: {notice.date}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-green-600 font-medium">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl shadow-lg border border-orange-200 p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full mb-3">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-orange-800 mb-2">
              Contact Information
            </h2>
            <p className="text-orange-700">
              Need help? Reach out to our support team
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3 p-4 bg-white bg-opacity-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-orange-800">Address</p>
                <p className="text-orange-700 text-sm">
                  Warden Office, BH1
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white bg-opacity-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-orange-800">Phone</p>
                <p className="text-orange-700 text-sm">8077863526</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white bg-opacity-50 rounded-xl">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-orange-800">Email</p>
                <p className="text-orange-700 text-sm">
                  pu.boyshostel1@gmail.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBoard;
