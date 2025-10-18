// backend/controllers/messStaff.controller.js
import MessStaff from "../models/messStaff.model.js";
import sendEmail from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Helper: Generate JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// LOGIN staff
export const loginMessStaff = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const staff = await MessStaff.findOne({ email }).select("+password");
    if (!staff) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: staff._id, role: "messadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: staff });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
// GET all mess staff
export const getMessStaff = async (req, res) => {
  try {
    const staff = await MessStaff.find();
    res.status(200).json(staff);
  } catch (err) {
    res.status(500).json({ error: "Error fetching mess staff", details: err.message });
  }
};

// POST (add) a new staff member
export const addMessStaff = async (req, res) => {
  const { name, mobile, email } = req.body;
  if (!name || !mobile || !email) {
    return res.status(400).json({ error: "Name, mobile, and email are required" });
  }

  try {
    // 1. Generate a random 6-digit password
    const password = Math.floor(100000 + Math.random() * 900000).toString();

    // 2. Create the new staff member with the generated password
    const newStaff = new MessStaff({
      name,
      mobile,
      email,
      password, // plain-text; will be hashed by pre-save hook
    });

    const savedStaff = await newStaff.save();

    // 3. Send welcome email with password
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Welcome to the Mess Management Team, ${name}!</h2>
        <p>Your account has been created successfully.</p>
        <p>Here is your one-time temporary password:</p>
        <p style="font-size: 24px; font-weight: bold; color: #0056b3; letter-spacing: 3px; margin: 20px 0;">${password}</p>
        <p>Please use this password to log in and then change it.</p>
      </div>
    `;

    await sendEmail({
      email: savedStaff.email,
      subject: "Your Mess Staff Account Credentials",
      html: emailHtml,
    });

    res.status(201).json(savedStaff);

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: "A staff member with this email already exists." });
    }
    res.status(500).json({ error: "Error adding mess staff", details: err.message });
  }
};

// PUT (update) a specific staff member
export const updateMessStaff = async (req, res) => {
  const { id } = req.params;
  const password = Math.floor(100000 + Math.random() * 900000).toString();
  const { name, mobile, email } = req.body;

  try {
    // Find the staff member first
    const staff = await MessStaff.findById(id);
    
    if (!staff) {
      return res.status(404).json({ error: "Mess staff not found" });
    }

    // Update fields
    staff.name = name;
    staff.mobile = mobile;
    staff.email = email;
    staff.password = password; // plain-text; will be hashed by pre-save hook

    // Save to trigger pre-save hook for password hashing
    const updatedStaff = await staff.save();

    // ✉️ Prepare email HTML
    const emailHtml = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Welcome to the Mess Management Team, ${name}!</h2>
        <p>Your account has been updated successfully.</p>
        ${
          password
            ? `<p>Your new one-time temporary password:</p>
               <p style="font-size: 24px; font-weight: bold; color: #0056b3; letter-spacing: 3px; margin: 20px 0;">${password}</p>`
            : ""
        }
        <p>Please use this password to log in and then change it.</p>
      </div>
    `;

    // 📧 Send email
    await sendEmail({
      email: updatedStaff.email,
      subject: "Your Mess Staff Account Update",
      html: emailHtml,
    });

    res.status(200).json({
      message: "Mess staff updated and email sent successfully",
      updatedStaff,
    });
  } catch (err) {
    console.error("Error updating staff:", err);
    res
      .status(500)
      .json({ error: "Error updating mess staff", details: err.message });
  }
};


// DELETE a staff member
export const deleteMessStaff = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedStaff = await MessStaff.findByIdAndDelete(id);
    if (!deletedStaff) return res.status(404).json({ error: "Mess staff not found" });
    res.status(200).json({ message: "Mess staff member deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting mess staff", details: err.message });
  }
};

// GET transaction stats
export const transactionStats = async (req, res) => {
  try {
    const stats = await MessStaff.aggregate([
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);
    res.status(200).json(stats[0] || { count: 0 });
  } catch (err) {
    res.status(500).json({ error: "Error fetching transaction stats", details: err.message });
  }
};
