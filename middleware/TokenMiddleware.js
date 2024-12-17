const jwt = require("jsonwebtoken");

// Token Middleware==================================================
function TokenMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "No authorization header provided." });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  jwt.verify(token, process.env.TOKEN_ACCESS, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Unauthorized access." });
    }
    req.user = user;
    next();
  });
}

module.exports = TokenMiddleware;
