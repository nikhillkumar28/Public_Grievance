const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "local_dev_jwt_secret_change_me";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: token missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const id = decoded.userId || decoded.id;
    req.user = {
      id,
      _id: id,
      role: decoded.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

module.exports = authMiddleware;
