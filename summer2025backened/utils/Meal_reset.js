import Stat from "../models/stats.model.js";

const resetAllStats = async () => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const stats = await Stat.find();

    for (let s of stats) {
      const lastResetDay = s.lastReset.toISOString().split("T")[0];

      if (lastResetDay !== today) {
        s.mealData.push({ day: lastResetDay, meals: s.mealsToday });
        if (s.mealData.length > 7) s.mealData.shift();
        s.mealsToday = 0;
        s.canteenOrders = 0;
        s.lastReset = new Date();

        await s.save();
      }
    }

    console.log("✅ Stats archived and reset (meals only)");
  } catch (error) {
    console.error("Error resetting stats:", error);
  }
};

export default resetAllStats;
