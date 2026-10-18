import mongoose from "mongoose";
import dotenv from "dotenv";
import Notice from "./models/notice.model.js";

dotenv.config();

const sampleNotices = [
  {
    text: "📢 Special Dinner: South Indian feast & special desserts will be served this Sunday from 7:30 PM to 10:00 PM in the Main Mess Hall.",
    date: "18 Oct 7:30 PM",
  },
  {
    text: "💳 Mess Fee Reminder: Monthly mess fee invoice for October has been published. Kindly clear dues by Oct 25th to avoid late fees.",
    date: "18 Oct 10:15 AM",
  },
  {
    text: "☕ Extended Canteen Hours: Night canteen will remain open until 1:00 AM every night during mid-term examination week.",
    date: "17 Oct 9:00 PM",
  },
  {
    text: "⚠️ Maintenance Notice: Water purification system scheduled maintenance in Mess Block B on Monday, 2:00 PM - 4:00 PM.",
    date: "16 Oct 4:45 PM",
  },
  {
    text: "🍽️ Weekly Menu Polling: Cast your votes for next week's breakfast choices in the student feedback section before Friday evening.",
    date: "15 Oct 11:30 AM",
  },
  {
    text: "🎉 Upcoming Fest: Annual Mess & Hostel Celebration function preparations have begun. Contact student committee to participate.",
    date: "12 Oct 6:20 PM",
  },
];

async function seedNotices() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI not found in .env");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    // Check existing count
    const existingCount = await Notice.countDocuments();
    console.log(`Current notices in database: ${existingCount}`);

    // Insert new sample notices
    const result = await Notice.insertMany(sampleNotices);
    console.log(`✅ Successfully added ${result.length} notices to the database!`);

    const totalCount = await Notice.countDocuments();
    console.log(`Total notices in database now: ${totalCount}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error("Error seeding notices:", err);
    process.exit(1);
  }
}

seedNotices();
