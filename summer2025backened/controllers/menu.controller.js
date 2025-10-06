import Menu from "../models/menu.model.js";
import mongoose from "mongoose";

// Get current week's menu
export const getWeeklyMenu = async (req, res) => {
  try {
    // Instead of filtering by date range, let's get all active menus
    // and let the frontend handle the current week filtering
    const menu = await Menu.find({
      isActive: true,
    }).sort({ day: 1 });

    console.log("Found menus:", menu.length);
    menu.forEach((m) => console.log(`Menu: ${m.day}, Date: ${m.date}`));

    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error("Error in getWeeklyMenu:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching weekly menu",
      error: error.message,
    });
  }
};

// Get menu for a specific day
export const getDayMenu = async (req, res) => {
  try {
    const { day } = req.params;

    const menu = await Menu.findOne({
      day: day,
      isActive: true,
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found for this day",
      });
    }

    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching day menu",
      error: error.message,
    });
  }
};

// Create or update menu (Admin only)
export const createMenu = async (req, res) => {
  try {
    const { day, meals } = req.body;
    console.log("Creating menu for:", { day, meals: meals?.length });

    // Use a default user ID if no authentication is available
    const userId = req.user?.id || new mongoose.Types.ObjectId();

    // Check if menu already exists for this day
    const existingMenu = await Menu.findOne({ day });

    console.log("Existing menu found:", !!existingMenu);

    if (existingMenu) {
      // Update existing menu
      existingMenu.meals = meals;
      existingMenu.updatedAt = new Date();
      await existingMenu.save();

      console.log("Menu updated successfully");
      res.json({
        success: true,
        message: "Menu updated successfully",
        data: existingMenu,
      });
    } else {
      // Create new menu
      const newMenu = new Menu({
        day,
        meals,
        createdBy: userId,
      });

      await newMenu.save();
      console.log("New menu created successfully");

      res.status(201).json({
        success: true,
        message: "Menu created successfully",
        data: newMenu,
      });
    }
  } catch (error) {
    console.error("Error creating menu:", error);
    res.status(500).json({
      success: false,
      message: "Error creating/updating menu",
      error: error.message,
    });
  }
};

// Update menu (Admin only)
export const updateMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    updateData.updatedAt = new Date();

    const menu = await Menu.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    res.json({
      success: true,
      message: "Menu updated successfully",
      data: menu,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating menu",
      error: error.message,
    });
  }
};

// Delete menu (Admin only)
export const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params;

    const menu = await Menu.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "Menu not found",
      });
    }

    res.json({
      success: true,
      message: "Menu deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting menu",
      error: error.message,
    });
  }
};

// Get all menus (Admin only)
export const getAllMenus = async (req, res) => {
  try {
    const { page = 1, limit = 10, day, isActive = true } = req.query;

    const filter = { isActive };
    if (day) filter.day = day;

    const menus = await Menu.find(filter)
      .populate("createdBy", "firstName lastName email")
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Menu.countDocuments(filter);

    res.json({
      success: true,
      data: menus,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching menus",
      error: error.message,
    });
  }
};
