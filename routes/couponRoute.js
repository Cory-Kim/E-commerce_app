const express = require('express');
const { createCoupon, getAllCoupons, updateCoupons, deleteCoupons } = require('../controller/couponCtrl');
const router = express.Router();

const {
  authMiddleware,
  isAdmin
} = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, isAdmin, getAllCoupons);
router.post('/', authMiddleware, isAdmin, createCoupon);
router.put('/:id', authMiddleware, isAdmin, updateCoupons);
router.delete('/:id', authMiddleware, isAdmin, deleteCoupons);

module.exports = router;