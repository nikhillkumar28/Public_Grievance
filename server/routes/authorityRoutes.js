const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const { listComplaints } = require("../controllers/complaintController");

const router = express.Router();

router.use(authMiddleware, authorizeRoles("authority"));
router.get("/complaints", listComplaints);

module.exports = router;
