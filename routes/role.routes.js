const router = require('express').Router();
const { getRoles, getRole, createRole, updateRole, deleteRole } = require('../controllers/role.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/permission.middleware');

router.get('/',       verifyToken, getRoles);
router.get('/:id',    verifyToken, requireAdmin, getRole);
router.post('/',      verifyToken, requireAdmin, createRole);
router.put('/:id',    verifyToken, requireAdmin, updateRole);
router.delete('/:id', verifyToken, requireAdmin, deleteRole);

module.exports = router;
