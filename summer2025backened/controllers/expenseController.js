import User from "../models/user.model.js";
import personaldetailModel from "../models/personaldetail.model.js";
import messexpenses from "../models/messtransaction.model.js";

// ✅ Create Expense
export const createExpense = async (req, res) => {
  try {
    const { studentid, amount, description } = req.body;
    console.log("Request body:", req.body);

    if (!studentid || !amount) {
      return res
        .status(400)
        .json({ message: "Student ID and amount are required" });
    }

    // Ensure description is not empty, provide default if needed
    const finalDescription = description?.trim() || "Mess Expense";
    console.log("📝 Description handling:", {
      original: description,
      final: finalDescription,
      isEmpty: !description || description.trim() === "",
    });

    const studentDetail = await personaldetailModel.findOne({ studentid });

    if (!studentDetail) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Create expense using email from personal details (no user link required)
    const expense = new messexpenses({
      email: studentDetail.email, // Use email directly from personal details
      studentid,
      amount,
      description: finalDescription, // Use the validated description
    });

    await expense.save();
    console.log("✅ Expense saved successfully");

    res.status(201).json({
      message: "Expense recorded successfully",
      data: {
        studentid: expense.studentid,
        amount: expense.amount,
        description: expense.description, // This will be the finalDescription
        date: expense.date,
        studentName: `${studentDetail.firstname} ${studentDetail.lastname}`,
        email: expense.email,
      },
    });
  } catch (error) {
    console.error("Error adding mess expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get Recent Expenses (for frontend table)
export const getRecentExpenses = async (req, res) => {
  try {
    const transactions = await messexpenses.find().sort({ date: -1 }).limit(50);
    const formatted = transactions.map(
      ({ _id, studentid, email, amount, description, date }) => ({
        _id,
        studentid,
        email,
        amount,
        description,
        date,
      })
    );
    res.status(200).json({
      status: 1,
      message: "Recent expenses fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching recent expenses:", error);
    res.status(500).json({
      status: 0,
      message: "Failed to fetch recent expenses",
      error: error.message,
    });
  }
};

// ✅ Get All Transactions Based on Role
export const getMessTransactionsByRole = async (req, res) => {
  try {
    const { role, email } = req.user;
    const trimmedEmail = email.trim();

    let transactions = [];

    if (role === "superadmin" || role === "messadmin") {
      transactions = await messexpenses.find().sort({ date: -1 });
    } else if (role === "student") {
      transactions = await messexpenses
        .find({
          email: { $regex: `^${trimmedEmail}$`, $options: "i" },
        })
        .sort({ date: -1 });
    } else {
      return res.status(403).json({
        status: 0,
        message: "Unauthorized access",
      });
    }

    const formatted = transactions.map(
      ({ _id, studentid, email, amount, description, date }) => ({
        _id,
        studentid,
        email,
        amount,
        description,
        date,
      })
    );

    console.log("Formatted transactions:", formatted);

    res.status(200).json({
      status: 1,
      message: "Transactions fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      status: 0,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};
