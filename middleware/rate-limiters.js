const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // 50 login attempts per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter };