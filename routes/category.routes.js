const router = require('express').Router();
const { getCategories, getCategoryTree, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/category.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.get('/',        getCategories);
router.get('/tree',    getCategoryTree);
router.get('/:id',     verifyToken, getCategory);
router.post('/',       verifyToken, checkPermission('categories', 'create'), createCategory);
router.put('/:id',     verifyToken, checkPermission('categories', 'edit'), updateCategory);
router.delete('/:id',  verifyToken, checkPermission('categories', 'delete'), deleteCategory);

module.exports = router;
