const router = require('express').Router();
const { getAdmins, getAdmin, createAdmin, updateAdmin, deleteAdmin } = require('../controllers/admin.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/permission.middleware');

router.get('/',       verifyToken, requireAdmin, getAdmins);
router.get('/:id',    verifyToken, requireAdmin, getAdmin);
router.post('/',      verifyToken, requireAdmin, createAdmin);
router.put('/:id',    verifyToken, requireAdmin, updateAdmin);
router.delete('/:id', verifyToken, requireAdmin, deleteAdmin);

module.exports = router;
