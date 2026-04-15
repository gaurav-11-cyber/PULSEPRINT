const fs = require("fs");
const path = require("path");

const ECGData = require("../models/ECG");
const { isDBReady } = require("../config/db");
const { getSignalQuality } = require("./matchingService");
const { writeLog } = require("./logService");

const DATASET_PATH = path.join(__dirname, "..", "data", "ecg", "ecgData.json");

let dataset = [];
let idx = 0;
let ioRef = null;
let streamTimer = null;
let latest = null;

function loadDataset() {
  if (dataset.length) return dataset;
  const raw = fs.readFileSync(DATASET_PATH, "utf-8");
  const parsed = JSON.parse(raw);
  dataset = parsed.map((point, i) => ({
    timestamp: point.timestamp || i * 8,
    value: Number(point.value) || 0,
  }));
  return dataset;
}

function estimateBpm(window = 200) {
  if (!dataset.length) return 72;
  const start = Math.max(0, idx - window);
  const local = [];
  for (let i = start; i < idx; i += 1) local.push(dataset[i % dataset.length].value);
  if (local.length < 10) return 72;

  let peaks = 0;
  for (let i = 1; i < local.length - 1; i += 1) {
    if (local[i] > 0.85 && local[i] > local[i - 1] && local[i] > local[i + 1]) peaks += 1;
  }
  const seconds = local.length * 0.008;
  const bpm = seconds > 0 ? Math.round((peaks / seconds) * 60) : 72;
  return Math.max(50, Math.min(130, bpm || 72));
}

async function persistECG(point) {
  if (!isDBReady()) return;
  try {
    await ECGData.create(point);
  } catch (_err) {
    // no-op in simulation mode
  }
}

async function emitChunk() {
  if (!dataset.length || !ioRef) return;
  const sample = dataset[idx % dataset.length];
  idx = (idx + 1) % dataset.length;

  const bpm = estimateBpm();
  const signalQuality = getSignalQuality(sample.value);

  latest = {
    timestamp: Date.now(),
    value: sample.value,
    bpm,
    signalQuality,
    deviceId: "PP-SIM-0492",
  };

  ioRef.emit("ecg:data", latest);
  await persistECG(latest);

  if (idx % 60 === 0) {
    await writeLog("DATA", "streaming ECG", { bpm, signalQuality });
  }
  if (idx % 270 === 0) {
    await writeLog("WARN", "jitter detected", { driftMs: Math.floor(Math.random() * 8) + 2 });
  }
}

async function startStreaming(io, hz = 125) {
  ioRef = io;
  loadDataset();
  if (streamTimer) clearInterval(streamTimer);

  await writeLog("SYS", "initializing...");

  const intervalMs = Math.max(8, Math.floor(1000 / hz));
  streamTimer = setInterval(() => {
    emitChunk().catch(() => {});
  }, intervalMs);
}

function getLatestTelemetry() {
  return latest || {
    timestamp: Date.now(),
    value: 0.02,
    bpm: 72,
    signalQuality: "medium",
    deviceId: "PP-SIM-0492",
  };
}

module.exports = { loadDataset, startStreaming, getLatestTelemetry };

