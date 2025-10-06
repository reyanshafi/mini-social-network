const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const cloudinary = require('cloudinary').v2;
const DatauriParser = require('datauri/parser');
const path = require('path');

//configure cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const parser = new DatauriParser();

//function to upload an avatar (profile pic)
const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Format the file for Cloudinary
        const dataUri = parser.format(path.extname(req.file.originalname).toString(), req.file.buffer);

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataUri.content, {
            folder: "mini-social-avatars", // Optional: organize uploads in a folder
        });

        // Update user in the database
        const user = await User.findById(req.user._id);
        user.avatar = result.secure_url;
        await user.save();

        res.status(200).json({ message: 'Avatar updated successfully', avatar: result.secure_url });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper function to escape special characters for regex
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    // Get user input from the request body
    const { username, email, password } = req.body;

    // Simple validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // If user created successfully, create a token
    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d', // Token expires in 30 days
      });

      // Send back user info and token (don't send back the password)
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//login user function
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user by email
    const user = await User.findOne({ email });

    // If user exists and password matches, send back token
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      res.status(200).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: token,
      });
    } else {
      // Use a generic error message for security
      res.status(400).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//get user profiles
const getUserProfile = async (req, res) => {
  // The user object is attached to the request in the 'protect' middleware
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

//function to fetch users based on their username
const getUserProfileByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
    .select('-password')
     .populate('followers', 'username avatar')
      .populate('following', 'username avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the user's post count
    const postCount = await Post.countDocuments({ user: user._id });

    res.status(200).json({
      _id: user._id,
      username: user.username,
      avatar: user.avatar,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      postCount: postCount,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//function to update user profile
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.bio = req.body.bio ?? user.bio; // Use ?? to allow empty string
      user.avatar = req.body.avatar || user.avatar; // Update avatar if provided

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//function to implement search option for users
const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(200).json([]);
    }
    const escapedQuery = escapeRegex(query);
    const searchRegex = new RegExp(escapedQuery, 'i');
    const users = await User.find({ username: searchRegex }).select('username avatar').limit(10);
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//function to follow users
const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow || !loggedInUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: "You can't follow yourself" });
    }
    if (loggedInUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'You are already following this user' });
    }

    await loggedInUser.updateOne({ $push: { following: req.params.id } });
    await userToFollow.updateOne({ $push: { followers: req.user._id } });
    // Create notification
await Notification.create({
  user: req.params.id, // The user being followed
  sender: req.user._id,
  type: 'follow',
});

    res.status(200).json({ message: 'User followed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//function to Unfollow User
const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const loggedInUser = await User.findById(req.user._id);

    if (!userToUnfollow || !loggedInUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (!loggedInUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'You are not following this user' });
    }

    await loggedInUser.updateOne({ $pull: { following: req.params.id } });
    await userToUnfollow.updateOne({ $pull: { followers: req.user._id } });

    res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  getUserProfileByUsername,
  updateUserProfile,
  searchUsers,
  followUser,
  unfollowUser,
  uploadAvatar,
};