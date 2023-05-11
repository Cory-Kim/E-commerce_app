const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler')

const createUser = asyncHandler(async (req, res) =>
{
  //The email that user posted
  const useremail = req.body.email;

  // user's posted email == database's email, true or false
  const findUser = await User.findOne({ email: useremail });

  // if can't find email in the database
  if (!findUser) {
    // create a new user
    const newUser = await User.create(req.body)
    res.json(newUser);
  }

  else {
    // user already exists
    throw new Error('User Already Exists');
  }

});

const loginUserCtrl = asyncHandler(async (req, res) =>
{
  const { email, password } = req.body;
  
  //check if user exits or not
  const findUser = await User.findOne({ email });

  if (findUser && await findUser.isPasswordMatched(password)) {
    res.json({
      _id: findUser?._id,
      firstname: findUser?.firstname,
      lastname: findUser?.lastname,
      email: findUser?.email,
      mobile: findUser?.mobile,
      token: generateToken(findUser?._id),
      
    });
    
  } else {
    throw new Error("Invalid Credentials");
  }
})

module.exports = {createUser, loginUserCtrl}