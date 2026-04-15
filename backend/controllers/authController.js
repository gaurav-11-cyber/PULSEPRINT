const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { isDBReady } = require("../config/db");
const { writeLog } = require("../services/logService");

const memoryUsers = [];

function signToken(user) {
  return jwt.sign(
    { id: user._id?.toString?.() || user.id || user.email, email: user.email, role: user.role },
    process.env.JWT_SECRET || "pulseprint-dev-secret",
    { expiresIn: "12h" }
  );
}

async function signup(req, res) {
  const { email, password, role = "user" } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: "email/password required" });

  const passwordHash = await bcrypt.hash(password, 10);

  if (isDBReady()) {
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ ok: false, error: "user exists" });
    const user = await User.create({ email, passwordHash, role });
    await writeLog("SEC", "user signup", { email });
    return res.json({ ok: true, token: signToken(user), user: { email: user.email, role: user.role } });
  }

  if (memoryUsers.find((u) => u.email === email)) return res.status(409).json({ ok: false, error: "user exists" });
  const user = { id: `mem-${Date.now()}`, email, passwordHash, role };
  memoryUsers.push(user);
  await writeLog("SEC", "user signup", { email });
  return res.json({ ok: true, token: signToken(user), user: { email: user.email, role: user.role } });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ ok: false, error: "email/password required" });

  let user = null;
  if (isDBReady()) user = await User.findOne({ email });
  else user = memoryUsers.find((u) => u.email === email);

  if (!user) return res.status(401).json({ ok: false, error: "invalid credentials" });
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ ok: false, error: "invalid credentials" });

  await writeLog("SEC", "user login", { email });
  return res.json({ ok: true, token: signToken(user), user: { email: user.email, role: user.role } });
}

module.exports = { signup, login };

