const {
  connectVirtualDevice,
  disconnectVirtualDevice,
  getDeviceStatus,
} = require("../services/simulationService");

async function connectDevice(_req, res) {
  const device = await connectVirtualDevice();
  res.json({ ok: true, device });
}

async function disconnectDevice(_req, res) {
  const device = await disconnectVirtualDevice();
  res.json({ ok: true, device });
}

async function getStatus(_req, res) {
  const status = await getDeviceStatus();
  res.json({ ok: true, status });
}

module.exports = { connectDevice, disconnectDevice, getStatus };

