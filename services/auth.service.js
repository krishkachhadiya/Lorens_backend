const jwt = require('jsonwebtoken');
const Role = require('../models/Role.model');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

const getAdminWithPermissions = async (admin) => {
  if (admin.role === 'admin') {
    return {
      ...admin.toObject(),
      permissions: {
        products:      { create: true, edit: true, delete: true },
        categories:    { create: true, edit: true, delete: true },
        subcategories: { create: true, edit: true, delete: true },
        cms:           { create: true, edit: true, delete: true }
      }
    };
  }

  const role = await Role.findOne({ name: admin.role });

  return {
    ...admin.toObject(),
    permissions: role?.permissions || {}
  };
};

module.exports = { generateToken, getAdminWithPermissions };
