import express from "express";
import { getStudents, getStudentById, updateStudentProfile, verifyStudent, changeStudentPassword } from "../controllers/student.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, getStudents);
router.get("/:id", verifyToken, getStudentById);
// router.put("/:id", updateStudentProfile);
router.put("/:id/verify", verifyToken, verifyStudent);

// Change password
router.put("/:id/change-password", verifyToken, changeStudentPassword);

export default router;
