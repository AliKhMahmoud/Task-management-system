const isManager = (req, res, next) => {
  if (req.user && req.user.role === "Manager") return next();

  return res.status(403).json({
    message: "Access denied. Managers only.",
  });
};

module.exports = { isManager };
