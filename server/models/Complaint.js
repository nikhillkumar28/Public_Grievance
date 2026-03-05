const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "escalated"],
      required: true
    },
    updatedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, default: "Uncategorized" },
    urgency: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    confidence: { type: Number, min: 0, max: 1, default: 0 },
    location: {
      address: { type: String, trim: true, default: null },
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      ward: { type: String, trim: true, default: null }
    },
    imageUrl: { type: String, default: null },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "escalated"],
      default: "pending"
    },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    assignedDepartment: { type: String, trim: true, default: null },
    timeline: { type: [timelineSchema], default: [{ status: "pending", updatedAt: new Date() }] }
  },
  { timestamps: true }
);

complaintSchema.index({ category: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ "location.lat": 1, "location.lng": 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ "location.ward": 1, createdAt: -1 });

module.exports = mongoose.model("Complaint", complaintSchema);
