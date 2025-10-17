import User from "../models/user.model.js";
import personaldetailModel from "../models/personaldetail.model.js";
import messexpenses from "../models/messtransaction.model.js";
import Stats from "../models/stats.model.js";

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
    const stat = await Stats.findOneAndUpdate(
      {},
      { $inc: { mealsToday: 1 } },
      { new: true, upsert: true }
    );

    const expense = new messexpenses({
      email: studentDetail.email,
      studentid,
      amount,
      description: finalDescription,
    });

    await expense.save();
    console.log("✅ Expense saved successfully");

    res.status(201).json({
      message: "Expense recorded successfully",
      data: {
        studentid: expense.studentid,
        amount: expense.amount,
        description: expense.description,
        date: expense.date,
        studentName: `${studentDetail.firstname} ${studentDetail.lastname}`,
        email: expense.email,
      },
      stats: {
        mealsToday: stat.mealsToday,
      },
    });
  } catch (error) {
    console.error("Error adding mess expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// ✅ Get Recent Expenses (Mess and Super Admin Portal)
export const getRecentExpenses = async (req, res) => {
  try {
    const paramId = req.params.studentid?.trim(); // Optional student ID
    const role = req.user?.role; // Assuming role is available via JWT middleware

    // Pagination setup
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let query = {};

    // 🎯 Case 1: Student role — get only their expenses
    if (paramId) {
      const studentObject = await personaldetailModel.findById(paramId);
      if (!studentObject) {
        return res
          .status(404)
          .json({ message: "Student not found or unauthorized request" });
      }

      const linkedStudentId = studentObject.studentid;
      query = { studentid: linkedStudentId };
    }

    // 🎯 Case 2: Admin, Messadmin, or Superadmin — get all expenses
    else if (role === "superadmin" || role === "messadmin") {
      query = {}; // no filter, fetch all
    }

    // ❌ Unauthorized access
    else {
      console.error("❌ Unauthorized access attempt:", { role, user: req.user });
      return res.status(403).json({ 
        message: "Unauthorized access",
        receivedRole: role,
        allowedRoles: ["superadmin", "messadmin"]
      });
    }

    // 📦 Fetch expenses (with pagination)
    const totalExpenses = await messexpenses.countDocuments(query);
    const expenses = await messexpenses
      .find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Format response
    const formattedExpenses = expenses.map(
      ({ _id, studentid, email, amount, description, date }) => ({
        _id,
        studentid,
        email,
        amount,
        description,
        date,
      })
    );

    // ✅ Send response
    res.status(200).json({
      status: 1,
      message: "Expenses fetched successfully",
      currentPage: page,
      totalPages: Math.ceil(totalExpenses / limit),
      totalRecords: totalExpenses,
      data: formattedExpenses,
    });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({
      status: 0,
      message: "Server error",
      error: error.message,
    });
  }
}; // <-- ✅ Closing getRecentExpenses

// ✅ Get All Transactions Based on Role
// export const getMessTransactionsByRole = async (req, res) => {
//   try {
//     const { role, email } = req.user;
//     const trimmedEmail = email.trim();

//     let transactions = [];

//     if (role === "superadmin" || role === "messadmin") {
//       transactions = await messexpenses.find().sort({ date: -1 });
//     } else if (role === "student") {
//       transactions = await messexpenses
//         .find({
//           email: { $regex: `^${trimmedEmail}$`, $options: "i" },
//         })
//         .sort({ date: -1 });
//     } else {
//       return res.status(403).json({
//         status: 0,
//         message: "Unauthorized access",
//       });
//     }

//     const formatted = transactions.map(
//       ({ _id, studentid, email, amount, description, date }) => ({
//         _id,
//         studentid,
//         email,
//         amount,
//         description,
//         date,
//       })
//     );

//     console.log("Formatted transactions:", formatted);

//     res.status(200).json({
//       status: 1,
//       message: "Transactions fetched successfully",
//       data: formatted,
//     });
//   } catch (error) {
//     console.error("Error fetching transactions:", error);
//     res.status(500).json({
//       status: 0,
//       message: "Failed to fetch transactions",
//       error: error.message,
//     });
//   }
// }; // <-- ✅ Closing getMessTransactionsByRole

// ✅ Get Expenses for a Specific Student (Student Portal)
// export const getStudentExpenses = async (req, res) => {
//   try {
//     const paramId = req.params.studentid?.trim(); // _id from frontend (ObjectId)
//     if (!paramId) {
//       return res.status(400).json({ message: "Student ID is required" });
//     }

//     // Find the student in personal details collection
//     const studentObject = await personaldetailModel.findById(paramId);
//     console.log("Student Object:", studentObject);

//     if (!studentObject) {
//       return res.status(404).json({ message: "Student not found or unauthorized request" });
//     }

//     // Get the actual studentid field from personaldetail
//     const linkedStudentId = studentObject.studentid;

//     // Now find all mess expenses for that student
//     const expenses = await messexpenses.find({ studentid: linkedStudentId }).sort({ date: -1 });

//     const formattedExpenses = expenses.map(({ _id, studentid, amount, description, date }) => ({
//       _id,
//       studentid,
//       amount,
//       description,
//       date,
//     }));

//     res.status(200).json({
//       status: 1,
//       message: "Student expenses fetched successfully",
//       data: formattedExpenses,
//     });
//   } catch (error) {
//     console.error("Error fetching student expenses:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };
