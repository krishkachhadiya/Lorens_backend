const Admin = require('../models/Admin.model');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { success } = require('../utils/ApiResponse');
const { generateToken, getAdminWithPermissions } = require('../services/auth.service');

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) throw new ApiError(400, 'Email and password are required');

  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin || !(await admin.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(admin._id);
  const adminData = await getAdminWithPermissions(admin);
  delete adminData.password;

  return success(res, { token, admin: adminData }, 'Login Successful');
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const adminData = await getAdminWithPermissions(req.admin);
  delete adminData.password;
  return success(res, { admin: adminData }, 'Admin data fetched');
});

module.exports = { login, getMe };
