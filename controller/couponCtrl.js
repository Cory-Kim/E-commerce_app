const Coupon = require('../models/couponModel');
const validateMongoDbId = require('../utils/validateMongodbid.js');
const asyncHandler = require('express-async-handler');

const createCoupon = asyncHandler(async (req, res) =>
{
  try {
    const newCoupon = await Coupon.create(req.body);
    res.json(newCoupon);

  } catch (error) {
    throw new Error(error);
  }

});

const getAllCoupons = asyncHandler(async (req, res) =>
{
  try {
    const coupons = await Coupon.find();
    res.json(coupons);

  } catch (error) {
    throw new Error(error);
  }

});


const updateCoupons = asyncHandler(async (req, res) =>
{
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const updatedCoupons = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedCoupons);

  } catch (error) {
    throw new Error(error);
  }

});

const deleteCoupons = asyncHandler(async (req, res) =>
{
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deletedCoupons = await Coupon.findByIdAndDelete(id);
    res.json(deletedCoupons);

  } catch (error) {
    throw new Error(error);
  }

});



module.exports = {
  createCoupon,
  getAllCoupons,
  updateCoupons,
  deleteCoupons
};