const express = require("express");
const { listLogs } = require("../controllers/logController");

const router = express.Router();

router.get("/", listLogs);

module.exports = router;

