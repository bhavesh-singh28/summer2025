import express from "express";
import { getNotices, addNotice } from "../controllers/notice.controller.js";

const router = express.Router();

router.get("/", getNotices);
router.post("/", addNotice);

export default router;
