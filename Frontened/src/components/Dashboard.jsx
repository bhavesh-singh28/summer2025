import { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  ShoppingCart,
  IndianRupee,
  Users, // ✅ Added this import
} from "lucide-react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ title, value, icon, bg }) => (
  <div
    className={`rounded-xl shadow-md p-5 bg-gradient-to-br ${bg} hover:scale-105 transform transition-all duration-300`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-white text-sm font-medium">{title}</p>
        <h2 className="text-white text-2xl font-bold mt-1">{value}</h2>
      </div>
      <div className="bg-white/20 p-2 rounded-full">{icon}</div>
    </div>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null); 

 useEffect(() => {
  const fetchData = async () => {
    try {
      const resp = await axios.get("/api/stats");
      setStats({
        totalStudents: resp.data.totalStudents ?? 0,
        mealsToday: resp.data.mealsToday ?? 0,
        canteenOrders: resp.data.canteenOrders ?? 0,
        mealData:  [
          { day: "Mon", meals: 20 },
          { day: "Tue", meals: 25 },
          { day: "Wed", meals: 18 },
          { day: "Thu", meals: 30 },
          { day: "Fri", meals: 22 },
          { day: "Sat", meals: 28 },
          { day: "Sun", meals: 15 },
        ],
        canteenOrdersData: resp.data.canteenOrdersData ?? [
          { day: "Mon", orders: 5 },
          { day: "Tue", orders: 8 },
          { day: "Wed", orders: 6 },
          { day: "Thu", orders: 10 },
          { day: "Fri", orders: 7 },
          { day: "Sat", orders: 9 },
          { day: "Sun", orders: 4 },
        ],
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
      setStats({
        totalStudents: 0,
        mealsToday: 0,
        canteenOrders: 0,
        mealData: [
          { day: "Mon", meals: 20 },
          { day: "Tue", meals: 25 },
          { day: "Wed", meals: 18 },
          { day: "Thu", meals: 30 },
          { day: "Fri", meals: 22 },
          { day: "Sat", meals: 28 },
          { day: "Sun", meals: 15 },
        ],
        canteenOrdersData: [
          { day: "Mon", orders: 5 },
          { day: "Tue", orders: 8 },
          { day: "Wed", orders: 6 },
          { day: "Thu", orders: 10 },
          { day: "Fri", orders: 7 },
          { day: "Sat", orders: 9 },
          { day: "Sun", orders: 4 },
        ],
      });
    }
  };

  fetchData();
}, []);

  if (!stats) {
    return <div>Loading...</div>; // ✅ Show loading until data is ready
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      icon: <Users className="text-white w-6 h-6" />,
      bg: "from-indigo-500 to-indigo-700",
    },
    {
      title: "Meals Today",
      value: stats.mealsToday,
      icon: <UtensilsCrossed className="text-white w-6 h-6" />,
      bg: "from-green-400 to-green-600",
    },
    {
      title: "Canteen Orders",
      value: stats.canteenOrders,
      icon: <ShoppingCart className="text-white w-6 h-6" />,
      bg: "from-yellow-400 to-yellow-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            bg={stat.bg}
          />
        ))}
      </div>

      {/* Weekly Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Meals Served This Week</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.mealData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="meals" stroke="#4ade80" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4">Canteen Orders This Week</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.canteenOrdersData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#60a5fa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
