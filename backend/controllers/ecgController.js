const { getLatestTelemetry } = require("../services/ecgService");

function getCurrentECG(_req, res) {
  res.json({ ok: true, data: getLatestTelemetry() });
}

module.exports = { getCurrentECG };

