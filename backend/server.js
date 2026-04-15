require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const { connectDB } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const deviceRoutes = require("./routes/deviceRoutes");
const ecgRoutes = require("./routes/ecgRoutes");
const logRoutes = require("./routes/logRoutes");
const systemRoutes = require("./routes/systemRoutes");
const { initECGSocket } = require("./sockets/ecgSocket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.get("/", (_req, res) => {
  res.json({ ok: true, service: "pulseprint-backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/devices", deviceRoutes);
app.use("/api/ecg", ecgRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/system", systemRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5050;

async function start() {
  await connectDB();
  await initECGSocket(io);
  server.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on :${PORT}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", err);
  process.exit(1);
});

