const Device = require("../models/Device");
const { isDBReady } = require("../config/db");
const { getLatestTelemetry } = require("./ecgService");
const { getCorrelationScore } = require("./matchingService");
const { writeLog } = require("./logService");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const virtualDevice = {
  deviceId: "PP-SIM-0492",
  name: "PulsePrint Virtual ECG",
  model: "PP-X1-SIM",
  firmware: "sim-2.3.4",
  state: "idle",
  battery: 89,
  temperature: 34.1,
  signalStrength: -62,
  sensors: {
    ECG_LEAD_I: { status: "CALIBRATED", offset: "+0.002mV", gain: "x1.0004" },
    ECG_LEAD_II: { status: "CALIBRATED", offset: "-0.001mV", gain: "x0.9998" },
    TEMP_PROBE: { status: "CALIBRATED", offset: "0.000C", gain: "x1.0000" },
    ACCEL_X: { status: "CALIBRATED", offset: "+0.041g", gain: "x1.0021" },
  },
};

async function saveDeviceState() {
  if (!isDBReady()) return;
  try {
    await Device.findOneAndUpdate(
      { deviceId: virtualDevice.deviceId },
      { ...virtualDevice, lastSeenAt: new Date() },
      { upsert: true, new: true }
    );
  } catch (_err) {
    // no-op
  }
}

function fluctuateMetrics() {
  virtualDevice.battery = Math.max(18, Math.min(100, virtualDevice.battery + (Math.random() - 0.55) * 0.5));
  virtualDevice.temperature = Math.max(31, Math.min(39, virtualDevice.temperature + (Math.random() - 0.45) * 0.2));
  virtualDevice.signalStrength = Math.max(-88, Math.min(-45, virtualDevice.signalStrength + (Math.random() - 0.5) * 3));
}

async function connectVirtualDevice() {
  virtualDevice.state = "scanning";
  await writeLog("SYS", "scanning for device...");
  await sleep(1200);
  virtualDevice.state = "connecting";
  await writeLog("SYS", "connecting to virtual device...");
  await sleep(1200);
  virtualDevice.state = "connected";
  await writeLog("SYS", "device connected", { deviceId: virtualDevice.deviceId });
  await saveDeviceState();
  return { ...virtualDevice };
}

async function disconnectVirtualDevice() {
  virtualDevice.state = "idle";
  await writeLog("SYS", "device disconnected");
  await saveDeviceState();
  return { ...virtualDevice };
}

async function getDeviceStatus() {
  fluctuateMetrics();
  await saveDeviceState();
  return {
    state: virtualDevice.state,
    battery: Number(virtualDevice.battery.toFixed(1)),
    temperature: Number(virtualDevice.temperature.toFixed(1)),
    signalStrength: Math.round(virtualDevice.signalStrength),
    deviceId: virtualDevice.deviceId,
    name: virtualDevice.name,
  };
}

function getDashboardSnapshot() {
  const ecg = getLatestTelemetry();
  const latency = Math.floor(9 + Math.random() * 16);
  return {
    bpm: ecg.bpm,
    signalQuality: ecg.signalQuality,
    correlationScore: Number(getCorrelationScore(ecg.value).toFixed(2)),
    latency,
    battery: Number(virtualDevice.battery.toFixed(1)),
    state: virtualDevice.state,
  };
}

async function runDiagnostics() {
  await writeLog("PROC", "diagnostic sweep started");
  await sleep(700);
  return {
    cpuUsage: Number((10 + Math.random() * 30).toFixed(1)),
    memoryUsage: Number((2.8 + Math.random() * 7.5).toFixed(2)),
    voltage: Number((1.14 + Math.random() * 0.14).toFixed(3)),
    temperature: Number((31 + Math.random() * 8).toFixed(1)),
  };
}

async function recalibrateSensor(sensorId) {
  if (!virtualDevice.sensors[sensorId]) throw new Error("Unknown sensor");
  virtualDevice.sensors[sensorId].status = "CALIBRATING";
  await writeLog("PROC", `recalibrating ${sensorId}`);
  await sleep(1500);
  virtualDevice.sensors[sensorId].status = "CALIBRATED";
  virtualDevice.sensors[sensorId].offset = `${(Math.random() * 0.01 - 0.005).toFixed(3)}mV`;
  await writeLog("MATCH", `pattern matched`, { sensorId });
  return { sensorId, ...virtualDevice.sensors[sensorId] };
}

function getSensors() {
  return virtualDevice.sensors;
}

module.exports = {
  connectVirtualDevice,
  disconnectVirtualDevice,
  getDeviceStatus,
  getDashboardSnapshot,
  runDiagnostics,
  recalibrateSensor,
  getSensors,
};

