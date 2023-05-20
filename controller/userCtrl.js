const { generateToken } = require('../config/jwtToken');
const User = require('../models/userModel');
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require('../utils/validateMongodbid');
const { generateRefreshToken } = require('../config/refreshtoken');
const jwt = require('jsonwebtoken');
const sendEmail = require('./emailCtrl');
const crypto = require('crypto');

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

// adminlogin

const loginAdmin = asyncHandler(async (req, res) =>
{
  const { email, password } = req.body;
  
  //check if user exits or not
  const findAdmin = await User.findOne({ email });

  // check 
  if (findAdmin.role !== 'admin') {
    throw new Error("Not Authorized");
  }

  if (findAdmin && await findAdmin.isPasswordMatched(password)) {
    const refreshToken = await generateRefreshToken(findAdmin?._id);
    const updateAdmin = await User.findByIdAndUpdate(findAdmin.id, {
      refreshToken: refreshToken,
    }, { new: true });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 72*60*60*1000,
    })
      
    res.json({
      _id: findAdmin?._id,
      firstname: findAdmin?.firstname,
      lastname: findAdmin?.lastname,
      email: findAdmin?.email,
      mobile: findAdmin?.mobile,
      token: generateToken(findAdmin?._id),

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

const updatePassword = asyncHandler(async (req, res) =>
{
  const { _id } = req.user;
  const password = req.body.password;
  validateMongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatedPassword = await user.save();
    res.json(updatedPassword);

  } else {
    res.json(user);
  }
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

const forgotPasswordToken = asyncHandler(async (req, res) =>
{
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User with this email is not found');
  }

  try {
    const token = await user.createPasswordResetToken();
    await user.save();
    const resetURL = `Hi, Please follow this link to reset Your Password. <br>
    This link is valid till 10 minutes from now. <a href='http://localhost:5000/api/user/reset-password/${token }'>Click Here</a>`;
    
    const data = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      html: resetURL,
    };
    
    sendEmail(data);
    res.json(token);

  } catch (error) {
    throw new Error(error);
  }

});

const resetPassword = asyncHandler(async (req, res) =>
{
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Token Expired, Please try again later.");
  }

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  res.json(user);

});

const getWishlist = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
    const findUser = await User.findById(_id).populate("wishlist");
    res.json(findUser);
  } catch (error) {
    throw new Error(error);
  }
});

// Save user Address
const saveAddress = asyncHandler(async (req, res, next) =>
{
  const { _id } = req.user;
  validateMongoDbId(_id);

  try {
      const updatedUser = await User.findByIdAndUpdate(_id, {
        address: req?.body?.address,
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

const userCart = asyncHandler(async (req, res) =>
{
  const { cart } = req.body;
  const { _id } = req.user;
  validateMongoDbId(_id);
  
  try {
    let products = [];
    const user = await User.findById(_id);

    // Check if user already have products in cart
    const alreadyExistCart = await Cart.findOne({ orderby: user._id });

    if (alreadyExistCart) {
      alreadyExistCart.remove();
    }

    for (let i = 0; i < cart.length; i++) {
      let object = {};
      object.product = cart[i]._id;
      object.count = cart[i].count;
      object.color = cart[i].color;
      let getPrice = await Product.findById(cart[i]._id).select('price').exec();
      object.price = getPrice.price;
      products.push(object);
    }
    
    let cartTotal = 0;
    for (let i = 0; i < products.length; i++) {
      cartTotal = cartTotal + products[i].price * products[i].count;
    }

    let newCart = await new Cart({
      products,
      cartTotal,
      orderby: user?._id,
    }).save();

    res.json(newCart);

  } catch (error) {
    throw new Error(error);
  }

});

const getUserCart = asyncHandler(async (req, res) =>
{
  const { _id } = req.user;
  validateMongoDbId(_id);
  
  try {
    const cart = await Cart.findOne({ orderby: _id }).populate(
      "products.product", 
    );
    res.json(cart);

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
  logout,
  updatePassword,
  forgotPasswordToken,
  resetPassword,
  loginAdmin,
  getWishlist,
  saveAddress,
  userCart,
  getUserCart
}