const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");
const {
  createComplaint,
  listComplaints,
  getPublicOverview,
  getPublicImpact,
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
router.get("/public/impact", getPublicImpact);
router.get("/public/recent", getPublicRecent);
router.get("/trending", getTrendingComplaints);

router.post("/", authMiddleware, authorizeRoles("citizen"), imageUpload.single("image"), createComplaint);
router.get("/", authMiddleware, authorizeRoles("citizen", "authority"), listComplaints);
router.get("/:id", authMiddleware, authorizeRoles("citizen", "authority"), getComplaintById);
router.patch("/:id/status", authMiddleware, authorizeRoles("authority"), updateComplaintStatus);
router.patch("/:id/upvote", authMiddleware, authorizeRoles("citizen"), upvoteComplaint);

module.exports = router;
