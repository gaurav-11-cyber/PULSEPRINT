const { getRecentLogs } = require("../services/logService");

async function listLogs(req, res) {
  const limit = Number(req.query.limit || 100);
  const logs = await getRecentLogs(limit);
  res.json({ ok: true, logs });
}

module.exports = { listLogs };

