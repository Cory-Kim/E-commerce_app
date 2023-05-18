const express = require('express');
const { createCoupon } = require('../controller/couponCtrl');
const router = express.Router();
const { authMiddleware, isAdmin } = require('../middlewares/authMiddleware');

router.post('/', authMiddleware, isAdmin, createCoupon);

module.exports = router;