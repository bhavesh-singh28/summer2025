import express from "express";
import {
  getMessStaff,
  updateMessStaff,
  addMessStaff,
  deleteMessStaff,
  transactionStats,
  loginMessStaff
} from "../controllers/messStaff.controller.js";
import { createExpense, getRecentExpenses } from "../controllers/expenseController.js";

const router = express.Router();


router.get("/", getMessStaff);
router.post("/", addMessStaff);
router.put("/:id", updateMessStaff);
router.delete("/:id", deleteMessStaff);
router.post("/auth/login", loginMessStaff); // ✅ LOGIN for mess staff

// Mess admin expense routes
router.post("/add-expense", createExpense);
router.get("/transactions", getRecentExpenses);
router.get("/stats", transactionStats);

export default router;
