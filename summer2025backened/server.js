import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import noticeRoutes from "./routes/notice.routes.js";
import messStaffRoutes from "./routes/messStaff.routes.js";
import expenseRoutes from "./routes/expense.routes.js";
import canteenStaffRoutes from "./routes/canteenStaff.routes.js";
import studentRoutes from "./routes/student.routes.js";
import statsRoutes from "./routes/stats.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import personaldetailRouter from "./routes/personaldetailRoutes.js";
import testRoutes from "./routes/test.routes.js";
import qrRoutes from "./routes/qr.routes.js";
import resetAllStats from "./utils/Meal_reset.js";
import cron from "node-cron";

dotenv.config();
const app = express();


cron.schedule("0 0 * * *", () => {

  console.log("🌙 Running midnight reset...");
  resetAllStats();
});

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Also increased limit
// ...

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/mess-staff", messStaffRoutes);
app.use("/api/expense", expenseRoutes);
app.use("/api/canteen-staff", canteenStaffRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/personaldetail", personaldetailRouter); // ✅ Fixed semicolon
app.use("/api/test", testRoutes);
app.use("/api/qr", qrRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(` Server running on port ${PORT}`));
  })
  .catch((err) => console.error(" DB Error:", err.message));
