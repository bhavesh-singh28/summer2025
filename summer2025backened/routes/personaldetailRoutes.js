import express from "express";
import {
  personaldetailInsert,
  personaldetailList,
  personaldetailExists,
  uploadDocuments,
  verifyDocuments,
  getPendingVerifications,
  getAllVerifications,
  uploadProfileImage
} from "../controllers/personaldetailController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// POST request to insert personal detail
router.post("/insert", personaldetailInsert);
router.get("/view", personaldetailList);
// Check if student exists (by studentid) - returns { exists: true/false }
router.get("/exists/:studentId", personaldetailExists);

router.post("/upload-profile-image", uploadProfileImage);


// Document upload and verification routes
router.post(
  "/upload-documents/:studentId",
  upload.array("documents", 5),
  uploadDocuments
);
router.patch("/verify-documents/:studentId", verifyDocuments);

// Admin verification management routes
router.get("/pending-verifications", getPendingVerifications);
router.get("/all-verifications", getAllVerifications);

// Export the router
export default router;
