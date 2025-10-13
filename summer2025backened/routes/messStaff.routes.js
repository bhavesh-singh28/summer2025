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
  getMessTransactionsByRole,
} from "../controllers/expenseController.js";
import { verifyToken, restrictTo } from "../middleware/auth.js";

const router = express.Router();



// Add a test route for transactions without auth
router.get("/transactions-test", (req, res) => {
  res.json({
    message: "Transactions route is reachable",
    timestamp: new Date().toISOString(),
    status: 1,
    data: [],
  });
});

router.get("/", getMessStaff);
router.post("/", addMessStaff); // ✅ Add new mess staff
router.put("/:id", updateMessStaff);
router.delete("/:id", deleteMessStaff);
router.get("/stats", transactionStats);

router.post(
  "/add-expense",
  verifyToken,
  restrictTo("messadmin"),
  createExpense
);
router.post("/auth/login", loginMessStaff); // ✅ LOGIN for mess staff

router.get("/transactions", verifyToken, getMessTransactionsByRole);

export default router;
