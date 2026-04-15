const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ["SYS", "DATA", "WARN", "MATCH", "SEC", "PROC"], default: "SYS" },
    message: { type: String, required: true },
    context: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Log || mongoose.model("Log", LogSchema);

