import express from "express";
import { getCanteenStaff, updateCanteenStaff } from "../controllers/canteenStaff.controller.js";
import { verifyToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/", verifyToken, getCanteenStaff);
router.put("/", verifyToken, updateCanteenStaff);

export default router;
