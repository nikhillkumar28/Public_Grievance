const mongoose = require("mongoose");

const advisorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, trim: true, default: null },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  { timestamps: true }
);

advisorySchema.index({ startDate: 1, endDate: 1 });

module.exports = mongoose.model("Advisory", advisorySchema);
