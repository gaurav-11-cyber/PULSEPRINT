const { startStreaming, getLatestTelemetry } = require("../services/ecgService");
const { attachIO, writeLog } = require("../services/logService");

async function initECGSocket(io) {
  attachIO(io);

  io.on("connection", async (socket) => {
    socket.emit("ecg:data", getLatestTelemetry());
    await writeLog("SYS", "client socket connected", { socketId: socket.id });

    socket.on("disconnect", async () => {
      await writeLog("SYS", "client socket disconnected", { socketId: socket.id });
    });
  });

  await startStreaming(io, 125);
}

module.exports = { initECGSocket };

