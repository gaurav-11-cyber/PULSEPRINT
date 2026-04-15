const mongoose = require("mongoose");

const ECGSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    value: { type: Number, required: true },
    bpm: { type: Number, required: true },
    signalQuality: { type: String, enum: ["good", "medium", "poor"], required: true },
    deviceId: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.ECGData || mongoose.model("ECGData", ECGSchema);

