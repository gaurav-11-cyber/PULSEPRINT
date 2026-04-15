const express = require("express");
const {
  getDashboard,
  runDiagnosticsController,
  recalibrateController,
  sensorsController,
  vaultController,
} = require("../controllers/systemController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", getDashboard);
router.get("/sensors", sensorsController);
router.post("/diagnostics/run", runDiagnosticsController);
router.post("/calibrate/:sensorId", recalibrateController);
router.post("/vault", requireAuth, vaultController);

module.exports = router;

