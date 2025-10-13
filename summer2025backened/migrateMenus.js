import mongoose from "mongoose";
import dotenv from "dotenv";
import Menu from "./models/menu.model.js";

dotenv.config();

async function migrateMenuData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    ("Connected to MongoDB");

    // Get all existing menus
    const existingMenus = await Menu.find({});
    (`Found ${existingMenus.length} existing menus`);

    // Group menus by day and keep the most recent one for each day
    const menusByDay = {};

    existingMenus.forEach((menu) => {
      const day = menu.day;
      if (!menusByDay[day] || menu.updatedAt > menusByDay[day].updatedAt) {
        menusByDay[day] = menu;
      }
    });

    // Delete all existing menus
    await Menu.deleteMany({});
    ("Cleared all existing menus");

    // Create new menus without dates
    const newMenus = [];
    for (const [day, menu] of Object.entries(menusByDay)) {
      const newMenu = {
        day: day,
        meals: menu.meals,
        isActive: menu.isActive,
        createdBy: menu.createdBy,
        createdAt: menu.createdAt,
        updatedAt: new Date(),
      };
      newMenus.push(newMenu);
    }

    if (newMenus.length > 0) {
      await Menu.insertMany(newMenus);
      (`Created ${newMenus.length} migrated menus`);

      newMenus.forEach((menu) => {
        (`- ${menu.day}: ${menu.meals.length} meals`);
      });
    }

    ("Menu migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error migrating menu data:", error);
    process.exit(1);
  }
}

migrateMenuData();
