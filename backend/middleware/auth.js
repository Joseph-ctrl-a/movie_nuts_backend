const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // Expect header: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  // No header at all
  if (!authHeader) {
    return res.status(401).json({
      error: "Not authenticated",
    });
  }

  const parts = authHeader.split(" ");

  // Malformed header
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({
      error: "Invalid authorization format",
    });
  }

  const token = parts[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Attach user info to request
    req.user = {
      id: decoded.id,
    };

    // Allow request to continue
    next();
  } catch (err) {
    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};
