import express from "express";
import {
  getMessStaff,
  updateMessStaff,
  transactionStats,
  addMessStaff,
  deleteMessStaff,
  loginMessStaff
} from "../controllers/messStaff.controller.js";
import {
  createExpense,
  // getMessTransactionsByRole,
} from "../controllers/expenseController.js";
import { verifyToken, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// Add a simple test route first
router.get("/test", (req, res) => {
  res.json({ message: "Mess staff routes are working!" });
});

// Add a test route for transactions without auth
router.get("/transactions-test", (req, res) => {
  res.json({
    message: "Transactions route is reachable",
    timestamp: new Date().toISOString(),
    status: 1,
    data: [],
  });
});

router.get("/", verifyToken, restrictTo("superadmin"), getMessStaff);
router.post("/", verifyToken, restrictTo("superadmin"), addMessStaff); // ✅ Add new mess staff
router.put("/:id", verifyToken, restrictTo("superadmin"), updateMessStaff);
router.delete("/:id", verifyToken, restrictTo("superadmin"), deleteMessStaff);
router.get("/stats", verifyToken, transactionStats);

router.post(
  "/add-expense",
  verifyToken,
  restrictTo("messadmin"),
  createExpense
);
router.post("/auth/login", loginMessStaff); // ✅ LOGIN for mess staff

// router.get("/transactions", verifyToken, getMessTransactionsByRole);

export default router;
