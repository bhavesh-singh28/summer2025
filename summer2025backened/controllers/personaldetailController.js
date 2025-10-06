import personaldetailModel from "../models/personaldetail.model.js";
import User from "../models/user.model.js";
import { sendLoginCredentials } from "../middleware/nodemailer.js";
import { generateReadablePassword } from "../utils/passwordGenerator.js";
import bcrypt from "bcrypt";

// Insert a new personal detail
export const personaldetailInsert = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      phone,
      email,
      DOB,
      address,
      city,
      state,
      zipcode,
      studentid,
      hostelblock,
      roomno,
      imageUrl
    } = req.body;
console.log("Data received on server:", imageUrl);
    // Check if student already exists
    const existingStudent = await personaldetailModel.findOne({
      $or: [{ studentid }, { email }],
    });
    if (existingStudent) {
      return res.status(400).send({
        status: 0,
        message: "Student with this ID or email already exists",
      });
    }

    const newDetail = new personaldetailModel({
      firstname,
      lastname,
      phone,
      email,
      DOB,
      address,
      city,
      state,
      zipcode,
      studentid,
      hostelblock,
      roomno,
     imageUrl
    });
     
    await newDetail.save();

    res.status(201).send({
      status: 1,
      message: "Personal detail saved successfully",
    });
  } catch (err) {
    // Handle duplicate key error
    if (err.code === 11000) {
      res.status(400).send({
        status: 0,
        message: "Student with this ID or email already exists",
      });
    } else {
      res.status(500).send({
        status: 0,
        message: "Error while saving personal detail",
        error: err.message,
      });
    }
  }
};

// Fetch all personal details
export const personaldetailList = async (req, res) => {
  try {
    const details = await personaldetailModel.find();
    res.status(200).send({
      status: 1,
      personaldetailList: details,
    });
  } catch (err) {
    res.status(500).send({
      status: 0,
      message: "Error fetching details",
      error: err.message,
    });
  }
};

// Upload documents for a student
export const uploadDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { documentTypes } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Find the student's personal details
    const student = await personaldetailModel.findOne({ studentid: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Process uploaded files
    const documents = req.files.map((file, index) => ({
      type: Array.isArray(documentTypes)
        ? documentTypes[index]
        : `document-${index + 1}`,
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      uploadDate: new Date(),
    }));

    // Add documents to student record
    student.documents.push(...documents);
    student.verificationStatus = "pending";
    await student.save();

    res.status(200).json({
      message: "Documents uploaded successfully",
      documents: documents,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
};

// Verify documents for a student
// Verify documents for a student
export const verifyDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    const student = await personaldetailModel.findOne({ studentid: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    student.documentsVerified = status === "approved";
    student.verificationStatus = status;
    await student.save();

    // If approved, create user account and send login credentials
    if (status === "approved") {
      try {
        // Check if user account already exists
        const existingUser = await User.findOne({ email: student.email });

        if (!existingUser) {
          // Generate secure password
          const generatedPassword = generateReadablePassword(10);
          const hashedPassword = await bcrypt.hash(generatedPassword, 10);

          // ✅ Create user account and link personal details
          const newUser = new User({
            email: student.email,
            password: hashedPassword,
            role: "student",
            isVerified: true,
            studentDetails: student._id, // ✅ Linking the personaldetail reference
          });

          await newUser.save();

          // Send login credentials email
          const fullName = `${student.firstname} ${student.lastname}`;
          await sendLoginCredentials(
            student.email,
            fullName,
            student.email,
            generatedPassword
          );

          console.log(`Login credentials sent to ${student.email}`);
        }
      } catch (emailError) {
        console.error(
          "Error creating user account or sending email:",
          emailError
        );
        // Still return success for document verification even if email fails
      }
    }

    res.status(200).json({
      message: `Documents ${status} successfully`,
      emailSent: status === "approved" ? true : false,
    });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Server error during verification" });
  }
};


// Get pending verifications for admin
export const getPendingVerifications = async (req, res) => {
  try {
    const pendingStudents = await personaldetailModel.find({
      verificationStatus: "pending",
      documents: { $exists: true, $not: { $size: 0 } },
    });

    res.status(200).json({
      status: 1,
      pendingVerifications: pendingStudents,
    });
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    res.status(500).json({
      status: 0,
      message: "Server error fetching pending verifications",
    });
  }
};

// Get all verifications (for admin dashboard)
export const getAllVerifications = async (req, res) => {
  try {
    const allStudents = await personaldetailModel
      .find({
        documents: { $exists: true, $not: { $size: 0 } },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 1,
      verifications: allStudents,
    });
  } catch (error) {
    console.error("Error fetching all verifications:", error);
    res.status(500).json({
      status: 0,
      message: "Server error fetching verifications",
    });
  }
};
