const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.profile || !roles.includes(req.profile.role)) {
      return res.status(403).json({
        error: true,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      })
    }
    next()
  }
}

module.exports = requireRole
