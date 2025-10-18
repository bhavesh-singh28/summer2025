import express from "express";
import { getNotices, addNotice } from "../controllers/notice.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", verifyToken, getNotices);
router.post("/", verifyToken, addNotice);

export default router;
