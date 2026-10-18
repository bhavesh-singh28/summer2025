import personaldetailModel from "../models/personaldetail.model.js";
import User from "../models/user.model.js";
import { sendLoginCredentials , sendRejectionEmail} from "../middleware/nodemailer.js";
import { generateReadablePassword } from "../utils/passwordGenerator.js";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import DatauriParser from "datauri/parser.js"; // Import DatauriParser

cloudinary.v2.config({ // Use v2 for consistency
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize DatauriParser
const parser = new DatauriParser(); // Already declared above

const formatBufferToDataUri = (mimetype, buffer) => {
  const ext = mimetype.split("/")[1] || "";
  return parser.format(`.${ext}`, buffer).content;
};
// Helper to convert buffer to data URI
// const formatBufferToDataUri = (mimetype, buffer) =>
//   parser.format(`.${mimetype.split("/")[1]}`, buffer);

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
      imageUrl,
    } = req.body;

    if (!studentid || !email) {
      return res.status(400).send({
        status: 0,
        message: "studentid and email are required",
      });
    }

    // Check if student already exists
    const existingStudent = await personaldetailModel.findOne({
      $or: [{ studentid }, { email }],
    });

    if (existingStudent) {
      // ✅ Update existing student instead of rejecting
      await personaldetailModel.updateOne(
        { _id: existingStudent._id },
        {
          $set: {
            firstname,
            lastname,
            phone,
            DOB,
            address,
            city,
            state,
            zipcode,
            hostelblock,
            roomno,
            imageUrl,
          },
        }
      );

      return res.status(200).send({
        status: 1,
        message: "Personal detail updated successfully",
      });
    }

    // If not exists → create new
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
      imageUrl,
    });

    await newDetail.save();

    res.status(201).send({
      status: 1,
      message: "Personal detail saved successfully",
    });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).send({
        status: 0,
        message: "Duplicate student ID or email",
      });
    } else {
      res.status(500).send({
        status: 0,
        message: "Error while saving/updating personal detail",
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
// (cloudinary and DatauriParser already imported and initialized above)

// helper that returns the data URI string directly


export const uploadDocuments = async (req, res) => {
  try {
    const { studentId } = req.params;
    let documentTypes = req.body.documentTypes; // may be string/array/undefined

    // --- Normalize documentTypes ---
    if (!documentTypes) {
      documentTypes = [];
    } else if (typeof documentTypes === "string") {
      // Could be JSON string like '["a","b"]' or comma-separated "a,b"
      try {
        const parsed = JSON.parse(documentTypes);
        documentTypes = Array.isArray(parsed) ? parsed : [parsed];
      } catch (e) {
        // fallback to comma-split
        documentTypes = documentTypes.split(",").map((s) => s.trim());
      }
    }

    // --- Validate files ---
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: 0, message: "No files uploaded" });
    }

    // --- Find student ---
    const student = await personaldetailModel.findOne({ studentid: studentId });
    if (!student) {
      return res.status(404).json({ status: 0, message: "Student not found" });
    }
    const uploadedCloudinaryDocuments = [];

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const docType = documentTypes[i] || `document-${i + 1}`;

      // ensure buffer exists (requires multer.memoryStorage())
      if (!file.buffer) {
        console.warn("uploadDocuments: missing file.buffer for", file.originalname);
        return res.status(400).json({
          status: 0,
          message:
            "File buffer missing. Make sure multer is configured with memoryStorage()",
        });
      }

      const dataUri = formatBufferToDataUri(file.mimetype, file.buffer);

      const resourceType = file.mimetype === "application/pdf" ? "raw" : "image";

      // give each file a reasonably-unique public id to avoid collisions
      const publicId =
        file.originalname.split(".").slice(0, -1).join(".") + "-" + Date.now();

      let result;
      try {
        result = await cloudinary.uploader.upload(dataUri, {
          folder: `student_documents/${studentId}`,
          resource_type: resourceType,
          public_id: publicId,
          // don't force format unless you need to
        });
      } catch (uploadErr) {
        console.error("Cloudinary upload failed for", file.originalname, uploadErr);
        return res.status(500).json({
          status: 0,
          message: "Cloudinary upload failed",
          error: uploadErr.message,
        });
      }

      uploadedCloudinaryDocuments.push({
        type: docType,
        originalName: file.originalname,
        url: result.secure_url,
        mimetype: file.mimetype,
        uploadDate: new Date(),
      });
    }

    // ensure documents array exists
    student.documents = Array.isArray(student.documents) ? student.documents : [];
    student.documents = student.documents.concat(uploadedCloudinaryDocuments);
    student.verificationStatus = "pending";

    await student.save();

    res.status(200).json({
      status: 1,
      message: "Documents uploaded successfully",
      documents: uploadedCloudinaryDocuments,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ status: 0, message: "Server error during upload", error: error.message });
  }
};

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

          // Create user account and link personal details
          const newUser = new User({
            email: student.email,
            password: hashedPassword,
            role: "student",
            isVerified: true,
            studentDetails: student._id, // Linking the personaldetail reference
          });

          await newUser.save();

          // Send login credentials email (email service commented out)
          // const fullName = `${student.firstname} ${student.lastname}`;
          // await sendLoginCredentials(
          //   student.email,
          //   fullName,
          //   student.email,
          //   generatedPassword
          // );
        }
      } catch (emailError) {
        console.error(
          "Error creating user account or sending email:",
          emailError
        );
        // Still return success for document verification even if email fails
      }
    }else if(status === "rejected"){
      // Send rejection email (email service commented out)
      try{
        // await sendRejectionEmail(student.email, student.firstname, student.lastname);
      }catch(emailError){
        console.error("Error sending rejection email:", emailError);
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

export const uploadProfileImage = async (req, res) => {
  try {
    const { image } = req.body; // 'image' will be the base64 string from the frontend

    if (!image) {
      return res.status(400).json({ status: 0, message: "No image data provided" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      upload_preset: "user-image", // Your Cloudinary upload preset
      folder: "student_profiles", // Optional: organize uploads in a specific folder
    });

    res.status(200).json({
      status: 1,
      message: "Image uploaded successfully to Cloudinary",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    res.status(500).json({
      status: 0,
      message: "Error uploading image to Cloudinary",
      error: error.message,
    });
  }
};

// Check if a student exists by studentid (secure, single-record check)
export const personaldetailExists = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        status: 0,
        message: "studentId param required",
      });
    }

    const student = await personaldetailModel.findOne({ studentid: studentId });
    
    // 🔹 If student not found
    if (!student) {
      return res.status(200).json({
        status: 1,
        exists: false,
      });
    }

    // 🔹 If found but not verified
    if (student.documentsVerified === false) {
      return res.status(200).json({
        status: 1,
        exists: true,
      });
    }

    // 🔹 If found and verified
    return res.status(200).json({
      status: 1,
      exists: true,
    });
  } catch (error) {
    console.error("Error checking student existence:", error);
    return res.status(500).json({
      status: 0,
      message: "Server error",
      error: error.message,
    });
  }
};
