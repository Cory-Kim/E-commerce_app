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

});


// Get all users
const getAllUser = asyncHandler(async (req, res) =>
{
  try {
    const getUsers = await User.find()
    res.json(getUsers);

  } catch (error) {
    throw new Error(error)
  }
});

const getSingleUser = asyncHandler(async (req, res) =>
{
  const { id } = req.params;
  
  try {
    const singleUser = await User.findById(id);
    res.json({
      singleUser,
    })

  } catch (error) {
    throw new Error(error);
  }

});

// Update a user
const updateUser = asyncHandler(async (req, res) =>
{
  const { id } = req.user;
  
  try {
      const updatedUser = await User.findByIdAndUpdate(id, {
        firstname: req?.body?.firstname,
        lastname: req?.body?.lastname,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },

      {
        new: true,
      }
      
    );
    res.json({
      updatedUser,
    });

  } catch (error) {
    throw new Error(error);
  }
});

// Delete a user
const deleteSingleUser = asyncHandler(async (req, res) =>
{
  const { id } = req.params;
  
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    res.json({
      deletedUser,
    })

  } catch (error) {
    throw new Error(error);
  }

});

const blockUser = asyncHandler(async (req, res) =>
{
  const { id } = req.params;

  try {
    const block = await User.findByIdAndUpdate(id,
    {
      isBlocked: true,
    },
    {
      new: true,
    })
    
    res.json({
      message: "User blocked",
    })
  

  } catch (error) {
    throw new Error(error);
  }
});

const unblockUser = asyncHandler(async (req, res) =>
{
  const { id } = req.params;

  try {
    const unblock = await User.findByIdAndUpdate(id, {
      isBlocked: false,
    },
    {
      new: true,
    })
    
    res.json({
      message: "User unblocked",
    })

  } catch (error) {
    throw new Error(error);
  }
});

module.exports = {
  createUser,
  loginUserCtrl,
  getAllUser,
  getSingleUser,
  deleteSingleUser,
  updateUser,
  blockUser,
  unblockUser
}