const router = require('express').Router();
const { getProducts, getProduct, getProductBySlug, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { checkPermission } = require('../middleware/permission.middleware');

router.get('/',            getProducts);
router.get('/slug/:slug',  getProductBySlug);
router.get('/:id',         verifyToken, getProduct);
router.post('/',           verifyToken, checkPermission('products', 'create'), createProduct);

router.put('/:id',         verifyToken, checkPermission('products', 'edit'), updateProduct);
router.delete('/:id',      verifyToken, checkPermission('products', 'delete'), deleteProduct);

module.exports = router;
