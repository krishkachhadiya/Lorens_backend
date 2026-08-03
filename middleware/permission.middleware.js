const Role = require('../models/Role.model');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const checkPermission = (module, action) =>
  asyncHandler(async (req, res, next) => {
    const admin = req.admin;

    // Super admin bypasses all permission checks
    if (admin.role === 'admin') return next();

    const role = await Role.findOne({ name: admin.role });
    const permissions = role?.permissions?.[module];

    if (!permissions?.[action]) {
      throw new ApiError(403, 'Permission denied');
    }

    next();
  });

const requireAdmin = (req, res, next) => {
  if (req.admin.role !== 'admin') {
    return next(new ApiError(403, 'Admin access only'));
  }
  next();
};

module.exports = { checkPermission, requireAdmin };
