const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true },
    model: { type: String, default: "PulsePrint-Sim-X1" },
    firmware: { type: String, default: "sim-1.0.0" },
    state: { type: String, enum: ["idle", "scanning", "connecting", "connected"], default: "idle" },
    battery: { type: Number, default: 100 },
    temperature: { type: Number, default: 33.5 },
    signalStrength: { type: Number, default: -60 },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Device || mongoose.model("Device", DeviceSchema);

