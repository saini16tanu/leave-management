const jwt = require("jsonwebtoken");

// check that the request has a valid token
const authHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // token comes as "Bearer <token>"
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Access denied. Please login first." });
  }

  // verify the token with our secret key
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please login again." });
    }
    return res.status(401).json({ message: "Invalid token." });
  }
};

// allow only the given roles, for example allowRoles("admin")
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "You are not allowed to do this action." });
    }
    next();
  };
};

module.exports = { authHandler, allowRoles };
