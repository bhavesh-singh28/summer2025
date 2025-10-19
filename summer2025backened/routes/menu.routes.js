import express from "express";
import {
  getWeeklyMenu,
  getDayMenu,
  createMenu,
  updateMenu,
  deleteMenu,
  getAllMenus,
} from "../controllers/menu.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Test route
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Menu routes are working!" });
});

// Debug route to see all menus
router.get("/debug", async (req, res) => {
  try {
    const Menu = await import("../models/menu.model.js");
    const allMenus = await Menu.default.find({}).sort({ day: 1, date: 1 });
    res.json({
      success: true,
      count: allMenus.length,
      data: allMenus.map((menu) => ({
        id: menu._id,
        day: menu.day,
        date: menu.date,
        isActive: menu.isActive,
        mealsCount: menu.meals?.length || 0,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Public routes
router.get("/weekly", getWeeklyMenu);
router.get("/day/:day", getDayMenu);

// Admin routes
router.post("/", verifyToken, createMenu);
router.get("/all", verifyToken, getAllMenus);
router.put("/:id", verifyToken, updateMenu);
router.delete("/:id", verifyToken, deleteMenu);

export default router;
