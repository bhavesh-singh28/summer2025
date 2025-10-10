import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

const VerificationStatsWidget = () => {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/personaldetail/all-verifications`
      );

      if (response.data.status) {
        const verifications = response.data.verifications;
        const statsData = {
          total: verifications.length,
          pending: verifications.filter(
            (v) => v.verificationStatus === "pending"
          ).length,
          approved: verifications.filter(
            (v) => v.verificationStatus === "approved"
          ).length,
          rejected: verifications.filter(
            (v) => v.verificationStatus === "rejected"
          ).length,
        };
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error fetching verification stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className={`${bgColor} rounded-lg p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>
            {loading ? "..." : value}
          </p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Verification Overview
        </h3>
        <TrendingUp className="w-5 h-5 text-blue-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Applications"
          value={stats.total}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={stats.pending}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
        <StatCard
          icon={CheckCircle}
          label="Approved"
          value={stats.approved}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          color="text-red-600"
          bgColor="bg-red-50"
        />
      </div>

      {stats.pending > 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
            <p className="text-sm text-yellow-700">
              {stats.pending} verification{stats.pending > 1 ? "s" : ""} waiting
              for review
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationStatsWidget;
