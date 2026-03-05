const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { createAdvisory, getActiveAdvisories } = require("../controllers/advisoryController");

const router = express.Router();

router.post("/", authMiddleware, roleMiddleware("admin"), createAdvisory);
router.get("/active", getActiveAdvisories);

module.exports = router;
