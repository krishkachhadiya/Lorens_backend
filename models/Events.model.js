const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    image: { type: String, default: "" },
    address: { type: String, required: true, trim: true }, // 📍 Changed to 'address' (e.g., "Booth No. B-20, Yashobhoomi New Delhi – India")
    dates: { type: String, required: true },       // 📅 e.g., "13,14,15,16 April 2025"
    timeWindow: { type: String, default: "10:00 to 21:00" }, // 🕒
    eventType: { type: String, default: "Exhibition" },     // 🏢
    expectedVisitors: { type: String, default: "" },         // 👥
    description: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);