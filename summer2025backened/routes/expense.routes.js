import express from "express";
import { createExpense, getRecentExpenses, downloadMonthlyExpensesPDF } from "../controllers/expenseController.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

// Add a new expense
router.post("/add-expense", verifyToken, createExpense);

// Get recent expenses (requires authentication)
router.get("/transactions", verifyToken, getRecentExpenses);

// Get expenses for a specific student
router.get("/transactions/:studentid", verifyToken, getRecentExpenses);

router.get("/download-pdf", verifyToken, downloadMonthlyExpensesPDF);

export default router;
