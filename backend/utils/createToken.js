const jwt = require("jsonwebtoken");

// make a JWT token for the logged in user (valid for 1 day)
const createToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

module.exports = createToken;
