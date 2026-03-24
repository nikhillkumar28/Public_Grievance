const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  getStatusMetrics,
  getStatusDistribution,
  getTrendingComplaints,
  getDepartmentPerformance
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/status", authMiddleware, roleMiddleware("authority", "admin"), getStatusMetrics);
router.get("/status-distribution", authMiddleware, roleMiddleware("authority", "admin"), getStatusDistribution);
router.get("/trending", authMiddleware, roleMiddleware("authority", "admin"), getTrendingComplaints);
router.get(
  "/department-performance",
  authMiddleware,
  roleMiddleware("authority", "admin"),
  getDepartmentPerformance
);

module.exports = router;
