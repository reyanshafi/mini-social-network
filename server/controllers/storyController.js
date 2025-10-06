const Story = require('../models/Story');
const User = require('../models/User'); // We might need this later
const cloudinary = require('cloudinary').v2;
const DatauriParser = require('datauri/parser');
const path = require('path');

const parser = new DatauriParser();

// @desc    Create a new story
// @route   POST /api/stories
// @access  Private
const createStory = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded for the story' });
    }

    // Format the file for Cloudinary
    const dataUri = parser.format(path.extname(req.file.originalname).toString(), req.file.buffer);

    // Upload to Cloudinary in a 'stories' folder
    const result = await cloudinary.uploader.upload(dataUri.content, {
      folder: "mini-social-stories",
      resource_type: "auto" // This allows both images and videos
    });

    // Create a new Story document in our database
    const newStory = new Story({
      user: req.user._id,
      mediaUrl: result.secure_url,
    });

    await newStory.save();
    const populatedStory = await newStory.populate('user', 'username avatar');

    res.status(201).json(populatedStory);
  } catch (error) {
    console.error("Error creating story:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get stories for the user's feed
// @route   GET /api/stories
// @access  Private
const getStoriesForFeed = async (req, res) => {
  try {
    const loggedInUser = await User.findById(req.user._id);
    const followingIds = loggedInUser.following;

    // Also include the user's own stories
    followingIds.push(req.user._id);

    // Find stories from the last 24 hours created by followed users
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stories = await Story.find({
      user: { $in: followingIds },
      createdAt: { $gte: twentyFourHoursAgo },
    }).populate('user', 'username avatar');

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          _id: story.user._id,
          username: story.user.username,
          avatar: story.user.avatar,
          stories: [],
        };
      }
      acc[userId].stories.push({
        _id: story._id,
        mediaUrl: story.mediaUrl,
        createdAt: story.createdAt,
      });
      return acc;
    }, {});

    res.status(200).json(Object.values(groupedStories));
  } catch (error) {
    console.error("Error fetching stories:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { createStory, getStoriesForFeed };