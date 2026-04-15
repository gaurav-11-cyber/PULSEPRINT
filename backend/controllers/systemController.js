const {
  getDashboardSnapshot,
  runDiagnostics,
  recalibrateSensor,
  getSensors,
} = require("../services/simulationService");
const { writeLog } = require("../services/logService");

function getDashboard(_req, res) {
  res.json({ ok: true, dashboard: getDashboardSnapshot() });
}

async function runDiagnosticsController(_req, res) {
  const diagnostics = await runDiagnostics();
  res.json({ ok: true, diagnostics });
}

async function recalibrateController(req, res) {
  const { sensorId } = req.params;
  const result = await recalibrateSensor(sensorId);
  res.json({ ok: true, sensor: result });
}

function sensorsController(_req, res) {
  res.json({ ok: true, sensors: getSensors() });
}

async function vaultController(req, res) {
  if (!req.user || req.user.role !== "admin") {
    await writeLog("SEC", "access denied", { email: req.user?.email || "anonymous" });
    return res.status(403).json({ ok: false, status: "ACCESS_DENIED" });
  }
  await writeLog("SEC", "vault access granted", { email: req.user.email });
  return res.json({ ok: true, status: "ACCESS_GRANTED" });
}

module.exports = {
  getDashboard,
  runDiagnosticsController,
  recalibrateController,
  sensorsController,
  vaultController,
};

