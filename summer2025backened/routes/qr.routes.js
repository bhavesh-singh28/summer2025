import { verifyToken } from "../middleware/auth.js";
import express from "express";
import messexpenses from "../models/messtransaction.model.js";
import User from "../models/user.model.js";
import crypto from "crypto";

const router = express.Router();

// POST /api/qr/scan
router.post("/scan", async (req, res) => {
  try {
    const { qrToken } = req.body;
    if (!qrToken) {
      return res.status(400).json({ error: "qrToken is required" });
    }
    // Find user by qrToken
    const user = await User.findOne({ qrToken, role: "student" }).populate("studentDetails");
    if (!user || !user.studentDetails) {
      return res.status(404).json({ error: "Student not found" });
    }
    const studentDetail = user.studentDetails;
    // Create expense
    const expense = new messexpenses({
      studentid: studentDetail.studentid,
      email: studentDetail.email,
      amount: 45,
      description: "Mess Meal",
    });
    await expense.save();
    return res.status(201).json({
      message: "Expense recorded successfully",
      student: {
        name: `${studentDetail.firstname} ${studentDetail.lastname}`,
        email: studentDetail.email,
      },
      expense: {
        studentid: expense.studentid,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});


// POST /api/qr/refresh-token 
router.post("/refresh-token", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.role !== "student") {
      return res.status(404).json({ error: "Student user not found" });
    }
    
    // Generate new QR token
    const newToken = await user.generateQrToken();

    return res.status(200).json({ qrToken: newToken });
  } catch (err) {
    console.error("Error refreshing QR token:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;
