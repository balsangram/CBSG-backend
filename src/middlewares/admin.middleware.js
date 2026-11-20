const adminOnly = (req, res, next) => {
  if (req.user?.accountModel !== "Admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

export default adminOnly;
