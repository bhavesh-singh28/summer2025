import mongoose from "mongoose";

const personaldetailSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  DOB: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipcode: { type: String, required: true },
  studentid: { type: String, required: true, unique: true , trim : true},
  hostelblock: { type: String, required: true , trim : true},
  roomno: { type: String, required: true  , trim : true},
  imageUrl: {
    type: String,
    required: true,
  },
  documents: [
    {
      type: { type: String, required: true }, // e.g., "studentIdCard", "hostelAllotmentLetter"
      originalName: { type: String, required: true },
      // Changed from 'path' to 'url' to store Cloudinary URL
      url: { type: String, required: true },
      mimetype: { type: String, required: true },
      uploadDate: { type: Date, default: Date.now },
    },
  ],
  documentsVerified: { type: Boolean, default: false },
  verificationStatus: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
});

const personaldetailModel = mongoose.model(
  "personaldetail",
  personaldetailSchema
);

export default personaldetailModel;