const Log = require("../models/Log");
const { isDBReady } = require("../config/db");

const memoryLogs = [];
let ioRef = null;

function attachIO(io) {
  ioRef = io;
}

function formatTime(ts) {
  return new Date(ts).toISOString().split("T")[1].replace("Z", "");
}

async function writeLog(level, message, context = {}) {
  const entry = {
    level,
    message,
    context,
    timestamp: new Date(),
    formatted: `[${formatTime(Date.now())}] [${level}] ${message}`,
  };

  memoryLogs.push(entry);
  if (memoryLogs.length > 300) memoryLogs.shift();

  if (isDBReady()) {
    try {
      await Log.create(entry);
    } catch (_err) {
      // No-op, in-memory logs still available.
    }
  }

  if (ioRef) ioRef.emit("logs:update", entry);
  return entry;
}

async function getRecentLogs(limit = 100) {
  if (isDBReady()) {
    try {
      return await Log.find({}).sort({ timestamp: -1 }).limit(limit).lean();
    } catch (_err) {
      return memoryLogs.slice(-limit).reverse();
    }
  }
  return memoryLogs.slice(-limit).reverse();
}

module.exports = { attachIO, writeLog, getRecentLogs };

