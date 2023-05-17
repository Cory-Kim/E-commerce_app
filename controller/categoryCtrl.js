const Category = require('../models/categoryModel.js');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid.js');

const createCategory = asyncHandler(async (req, res) =>
{

  try {
    const newCategory = await Category.create(req.body);
    res.json(newCategory);

  } catch (error) {
    throw new Error(error);
  }

});



module.exports = {createCategory};