const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel')
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require('jsonwebtoken');

//Create a User
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
    const refreshToken = await generateRefreshToken(findUser?._id);
    const updateUser = await User.findByIdAndUpdate(findUser.id, {
      refreshToken: refreshToken,
    }, { new: true });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 72*60*60*1000,
    })
      
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
  validateMongoDbId(id);
  
  try {
    const singleUser = await User.findById(id);
    res.json({
      singleUser,
    })

  } catch (error) {
    throw new Error(error);
  }

});

// handle refresh token
const handleRefreshToken = asyncHandler(async (req, res) =>
{
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error('No Refresh Token in Cookies');
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    throw new Error('No Refresh token present in db or not matched');
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) =>
  {
    if (err || user.id !== decoded.id) {
      throw new Error('There is something wrong with refresh token');

    } else {
      const accessToken = generateToken(user?._id);
      res.json({ accessToken });
    }
  });
});

// logout functionality
const logout = asyncHandler(async (req, res) =>
{
  const cookie = req.cookies;
  if (!cookie?.refreshToken) {
    throw new Error("No Refresh Token in Cookies");
  }
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });

  if (!user) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: true,
    });

    return res.sendStatus(204); // forbidden
  }

  await User.findOneAndUpdate(refreshToken, {
    refreshToken: "",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });

  res.sendStatus(204);

});

// Update a user
const updateUser = asyncHandler(async (req, res) =>
{
  const { id } = req.user;
  validateMongoDbId(id);
  
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
  validateMongoDbId(id);
  
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
  validateMongoDbId(id);

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
  validateMongoDbId(id);

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
  unblockUser,
  handleRefreshToken,
  logout
}