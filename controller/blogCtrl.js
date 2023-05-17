const Blog = require('../models/blogModel');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');
const validateMongoDbId = require("../utils/validateMongodbid");

const createBlog = asyncHandler(async (req, res) =>
{
  try {
    const newBlog = await Blog.create(req.body);
    res.json(newBlog);

  } catch (error) {
    throw new Error(error);
  }

});

const updateBlog = asyncHandler(async (req, res) =>
{
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updateBlog = await Blog.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updateBlog);

  } catch (error) {
    throw new Error(error);
  }

});

const getBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoDbId(id);
  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { $inc: { numViews: 1 } },
      { new: true }
    );

    const blog = await Blog.findById(id);
    
    res.json(blog);
  } catch (error) {
    throw new Error(error);
  }
});

const getAllBlogs = asyncHandler(async (req, res) => {

  try {
    const getBlogs = await Blog.find();
    res.json(getBlogs);

  } catch (error) {
    throw new Error(error);
  }

});

const deleteBlog = asyncHandler(async (req, res) =>
{
  
  const { id } = req.params;
  validateMongoDbId(id);

  try {
    const deleteBlog = await Blog.findByIdAndDelete(id)
    res.json(deleteBlog);

  } catch (error) {
    throw new Error(error);
  }

});


const likeBlog = asyncHandler(async (req, res) =>
{
  const { blogId } = req.body;
  validateMongoDbId(blogId);
  const blog = await Blog.findById(blogId);

  const loginUserId = req?.user?._id;

  // find if the user has liked the post
  const isLiked = blog?.likes.includes(loginUserId);

  // find if the user has disliked the post
  const alreadyDisliked = blog?.dislikes?.includes(loginUserId);

  if (alreadyDisliked) {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      $pull: { dislikes: loginUserId },
      isDisliked: false
    }, { new: true });
    
    res.json(blog);
  } 
  
  if (isLiked) {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      $pull: { likes: loginUserId },
      isLiked: false
    }, { new: true });
    
    res.json(blog);
  }
  else {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      isLiked: true,
      $push: { likes: loginUserId },
    }, { new: true });
    
    res.json(blog);
  }

});


const dislikeBlog = asyncHandler(async (req, res) =>
{
  const { blogId } = req.body;
  // validateMongoDbId(blogId);
  const blog = await Blog.findById(blogId);

  const loginUserId = req?.user?._id;

  // find if the user has disliked the post
  const isDisliked = blog?.dislikes.includes(loginUserId);

  // find if the user has liked the post
  const alreadyliked = blog?.likes?.includes(loginUserId);

  if (alreadyliked) {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      $pull: { likes: loginUserId },
      isLiked: false
    }, { new: true });
    
    res.json(blog);
  } 
  
  if (isDisliked) {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      $pull: { dislikes: loginUserId },
      isDisliked: false
    }, { new: true });
    
    res.json(blog);
  }
  else {
    const blog = await Blog.findByIdAndUpdate(blogId, {
      isDisliked: true,
      $push: { dislikes: loginUserId },
    }, { new: true });
    
    res.json(blog);
  }

});


module.exports = {
  createBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
  deleteBlog,
  likeBlog,
  dislikeBlog
};