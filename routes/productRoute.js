const express = require('express');
const { createProduct, getSingleProduct, getAllProducts, updateProduct } = require('../controller/productCtrl');
const router = express.Router();

router.post('/', createProduct);

router.get('/:id', getSingleProduct);
router.put('/:id', updateProduct);
router.get('/', getAllProducts);

module.exports = router;