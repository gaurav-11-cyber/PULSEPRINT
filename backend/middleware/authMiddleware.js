const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice("Bearer ".length) : null;

  if (!token) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "pulseprint-dev-secret");
    req.user = payload;
    return next();
  } catch (_err) {
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ ok: false, error: "ACCESS_DENIED" });
    }
    return next();
  };
}

module.exports = { requireAuth, requireRole };

