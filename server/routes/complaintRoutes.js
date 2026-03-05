const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const {
  createComplaint,
  listComplaints,
  getPublicOverview,
  getTrendingComplaints,
  getPublicRecent,
  getComplaintById,
  updateComplaintStatus,
  upvoteComplaint
} = require("../controllers/complaintController");

const router = express.Router();
const uploadDir = path.join(__dirname, "..", "..", "uploads", "complaints");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const imageUpload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Only image uploads are allowed"));
  }
});

router.get("/public/overview", getPublicOverview);
router.get("/public/recent", getPublicRecent);
router.get("/trending", getTrendingComplaints);

router.post("/", authMiddleware, roleMiddleware("citizen", "admin"), imageUpload.single("image"), createComplaint);
router.get("/", authMiddleware, listComplaints);
router.get("/:id", authMiddleware, getComplaintById);
router.patch("/:id/status", authMiddleware, roleMiddleware("authority", "admin"), updateComplaintStatus);
router.patch("/:id/upvote", authMiddleware, roleMiddleware("citizen", "admin"), upvoteComplaint);

module.exports = router;
