const User = require("../models/User");

const getMe = async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      department: req.user.department || null,
      ward: req.user.ward || null,
      address: req.user.address || null
    }
  });
};

const updateMe = async (req, res) => {
  try {
    const ward = typeof req.body.ward === "string" ? req.body.ward.trim() : undefined;
    const address = typeof req.body.address === "string" ? req.body.address.trim() : undefined;

    const update = {};
    if (ward !== undefined) update.ward = ward || null;
    if (address !== undefined) update.address = address || null;

    const user = await User.findByIdAndUpdate(req.user._id, update, {
      new: true,
      runValidators: true
    }).select("name email role department ward address");

    return res.status(200).json({
      message: "Profile updated",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
        ward: user.ward || null,
        address: user.address || null
      }
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update profile", error: error.message });
  }
};

module.exports = { getMe, updateMe };

