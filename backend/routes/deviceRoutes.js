const express = require("express");
const { connectDevice, disconnectDevice, getStatus } = require("../controllers/deviceController");

const router = express.Router();

router.post("/connect", connectDevice);
router.post("/disconnect", disconnectDevice);
router.get("/status", getStatus);

module.exports = router;

