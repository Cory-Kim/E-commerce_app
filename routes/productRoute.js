const express = require('express');
const { createProduct, getSingleProduct, getAllProducts, updateProduct, deleteProduct } = require('../controller/productCtrl');
const { isAdmin, authMiddleware } = require('../middlewares/authMiddleware');
const router = express.Router();


router.post('/', authMiddleware, isAdmin, createProduct);
router.get('/:id', getSingleProduct);
router.put('/:id', authMiddleware, isAdmin, updateProduct);
router.delete('/:id', authMiddleware, isAdmin, deleteProduct);
router.get('/', getAllProducts);

module.exports = router;