import User from "../models/user.model.js";
import personaldetailModel from "../models/personaldetail.model.js";
import messexpenses from "../models/messtransaction.model.js";
import Stats from "../models/stats.model.js";
import PDFDocument from "pdfkit";

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

export const downloadMonthlyExpensesPDF = async (req, res) => {
  try {
    const { month } = req.query;
    const { role, email: userEmail } = req.user;

    // Validate month YYYY-MM
    if (!month || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({ message: "Invalid month. Use YYYY-MM" });
    }

    const startDate = new Date(`${month}-01T00:00:00Z`);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);

    let expenses = [];
    let student = null;

    if (role === "student") {
      student = await personaldetailModel.findOne({ email: userEmail }).lean();
      if (!student) return res.status(404).json({ message: "Student not found" });

      expenses = await messexpenses
        .find({ studentid: student.studentid, date: { $gte: startDate, $lt: endDate } })
        .sort({ date: 1 })
        .lean();
    } else if (role === "superadmin" || role === "messadmin") {
      expenses = await messexpenses
        .find({ date: { $gte: startDate, $lt: endDate } })
        .sort({ studentid: 1 })
        .lean();
    } else {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // PDF setup
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=expenses_${month}.pdf`);
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    doc.pipe(res);

    // Title
    doc.fontSize(18).text("Monthly Expenses Report", { align: "center" });
    doc.fontSize(12).text(`Month: ${month}`, { align: "center" });
    doc.moveDown(1);

    const tableStartX = 50;
    const rowHeight = 20;
    const padding = 5;
    let y = doc.y;

    if (role === "student") {
      doc.fontSize(12).text(`Roll No: ${student.studentid}`, { align: "left" });
      doc.moveDown(0.5);
      y = doc.y;

      // Table header
      const columns = [
        { label: "Date", x: 50, width: 100 },
        { label: "Description", x: 150, width: 250 },
        { label: "Amount (Rs.)", x: 400, width: 100 },
      ];

      // Draw header background
      doc.rect(tableStartX, y, 450, rowHeight).fillAndStroke("#f0f0f0", "black");

      // Header text
      doc.fillColor("black").font("Helvetica-Bold");
      columns.forEach(col => {
        doc.text(col.label, col.x + padding, y + padding, { width: col.width - 2*padding });
      });

      y += rowHeight;
      doc.font("Helvetica");

      // Table rows
      expenses.forEach(e => {
        doc.rect(tableStartX, y, 450, rowHeight).stroke();
        const dateStr = e.date ? new Date(e.date).toLocaleDateString() : "-";
        doc.text(dateStr, columns[0].x + padding, y + padding, { width: columns[0].width - 2*padding });
        doc.text(e.description || "-", columns[1].x + padding, y + padding, { width: columns[1].width - 2*padding });
        doc.text(Number(e.amount || 0).toFixed(2), columns[2].x + padding, y + padding, { width: columns[2].width - 2*padding });
        y += rowHeight;
      });

      const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      y += 10; // extra space before total
      doc.font("Helvetica-Bold").text(`Total: Rs. ${total.toFixed(2)}`, tableStartX, y, { align: "left" });

    } else {
      // Admin
      doc.fontSize(12).text(`Role: ${role.charAt(0).toUpperCase() + role.slice(1)}`, { align: "left" });
      doc.moveDown(0.5);
      y = doc.y;

      // Aggregate totals by student
      const totals = {};
      expenses.forEach(e => {
        totals[e.studentid] = (totals[e.studentid] || 0) + (Number(e.amount) || 0);
      });
      const sortedIds = Object.keys(totals).sort();

      // Table header
      const columns = [
        { label: "Roll No", x: 50, width: 200 },
        { label: "Total (Rs.)", x: 250, width: 200 },
      ];

      // Draw header background
      doc.rect(tableStartX, y, 400, rowHeight).fillAndStroke("#f0f0f0", "black");

      // Header text
      doc.fillColor("black").font("Helvetica-Bold");
      columns.forEach(col => {
        doc.text(col.label, col.x + padding, y + padding, { width: col.width - 2*padding });
      });

      y += rowHeight;
      doc.font("Helvetica");

      // Table rows
      sortedIds.forEach(id => {
        doc.rect(tableStartX, y, 400, rowHeight).stroke();
        doc.text(id, columns[0].x + padding, y + padding, { width: columns[0].width - 2*padding });
        doc.text(totals[id].toFixed(2), columns[1].x + padding, y + padding, { width: columns[1].width - 2*padding });
        y += rowHeight;
      });

      const grandTotal = Object.values(totals).reduce((sum, amt) => sum + amt, 0);
      y += 10; // extra space before grand total
      doc.font("Helvetica-Bold").text(`Grand Total: Rs. ${grandTotal.toFixed(2)}`, tableStartX, y, { align: "left" });
    }

    doc.end();
  } catch (err) {
    console.error("PDF generation error:", err);
    if (!res.headersSent) res.status(500).json({ message: "Failed to generate PDF" });
  }
};

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
