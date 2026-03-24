const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "local_dev_jwt_secret_change_me";

const generateToken = (payload) =>
  jwt.sign(payload, JWT_SECRET, {
    expiresIn: "7d"
  });

module.exports = { generateToken };
