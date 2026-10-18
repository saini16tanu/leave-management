// runs when no route matches the url
const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found: " + req.originalUrl });
};

// handles all errors and sends a JSON message
const errorHandler = (err, req, res, next) => {
  console.log(err);

  // mongoose validation failed (required, enum, min, max...)
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(", ") });
  }

  // wrong format of MongoDB id
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // duplicate value for a unique field
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ message: field + " already exists" });
  }

  // error where we set our own status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  res.status(500).json({ message: "Something went wrong on the server" });
};

module.exports = { notFound, errorHandler };
