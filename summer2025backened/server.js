import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import noticeRoutes from "./routes/notice.routes.js";
import messStaffRoutes from "./routes/messStaff.routes.js";
import canteenStaffRoutes from "./routes/canteenStaff.routes.js";
import studentRoutes from "./routes/student.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import identityRoutes from './routes/identity.routes.js';

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/mess-staff", messStaffRoutes);
app.use("/api/canteen-staff", canteenStaffRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/identity", identityRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch((err) => console.error(" DB Error:", err.message));
