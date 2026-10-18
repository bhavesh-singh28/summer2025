import Stats from "../models/stats.model.js";
import resetAllStats from "../utils/Meal_reset.js";
import personaldetailModel from "../models/personaldetail.model.js";
import User from "../models/user.model.js";

export const getStats = async (req, res) => {
  try {
    const personalCount = await personaldetailModel.countDocuments();
    const userStudentCount = await User.countDocuments({ role: "student" });
    const totalStudents = Math.max(personalCount, userStudentCount);

    let stats = await Stats.findOne().lean();

    if (!stats) {
      stats = await Stats.create({
        totalStudents,
        mealsToday: 0,
        canteenOrders: 0,
        revenue: 0,
        mealData: [],
      });
    }

    res.status(200).json({
      totalStudents,
      mealsToday: stats.mealsToday ?? 0,
      canteenOrders: stats.canteenOrders ?? 0,
      mealData: stats.mealData ?? [],
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Error fetching stats", details: err.message });
  }
};
