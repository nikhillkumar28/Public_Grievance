const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getMe, updateMe } = require("../controllers/userController");

const router = express.Router();

router.use(authMiddleware);
router.get("/me", getMe);
router.patch("/me", updateMe);

module.exports = router;

