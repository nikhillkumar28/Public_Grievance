const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { getStatusMetrics } = require("../controllers/analyticsController");

const router = express.Router();

router.use(authMiddleware, authorizeRoles("admin"));
router.get("/analytics", getStatusMetrics);

module.exports = router;
