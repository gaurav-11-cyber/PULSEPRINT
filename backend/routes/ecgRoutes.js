const express = require("express");
const { getCurrentECG } = require("../controllers/ecgController");

const router = express.Router();

router.get("/current", getCurrentECG);

module.exports = router;

