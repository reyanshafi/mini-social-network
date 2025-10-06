const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');


// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res) => {
  try {
    const { text, image } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Post cannot be empty' });
    }

    const newPost = new Post({
      text,
      image: image || '', // Set image or default to an empty string
      user: req.user._id, // The user ID comes from the 'protect' middleware
    });

    const post = await newPost.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//get feed posts function
const getFeedPosts = async (req, res) => {
  try {
    // Find the currently logged-in user to get their 'following' list
    const loggedInUser = await User.findById(req.user._id);
    
    // Get the array of user IDs the current user is following
    const followingIds = loggedInUser.following;
    
    // Include the user's own posts in their feed, which is standard
    followingIds.push(req.user._id);

    // Find all posts where the author ('user') is in the list of IDs we've gathered
    const feedPosts = await Post.find({ user: { $in: followingIds } })
      .sort({ createdAt: -1 }) // Sort posts by newest first
      .populate('user', 'username avatar')
      .populate('comments.user', 'username avatar'); // Attach the author's username and avatar to each post

    res.status(200).json(feedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//function to like/unlike posts
const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the post has already been liked by this user
    const userIdStr = req.user._id.toString();
    if (post.likes.map(id => id.toString()).includes(userIdStr)) {
      // User has already liked, so UNLIKE
      await post.updateOne({ $pull: { likes: req.user._id } });
      res.status(200).json({ message: 'Post unliked' });
    } else {
      // User has not liked yet, so LIKE
      await post.updateOne({ $push: { likes: req.user._id } });
       // Create notification (but not if you like your own post)
  if (post.user.toString() !== req.user._id.toString()) {
    await Notification.create({
      user: post.user,
      sender: req.user._id,
      type: 'like',
      post: post._id,
    });
  }
      res.status(200).json({ message: 'Post liked' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//function to add/ remove comments
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      text: text,
      user: req.user._id,
    };

    // Add to the beginning of the comments array
    post.comments.unshift(newComment);
    await post.save();
    
    // Create notification (but not for your own post)
if (post.user.toString() !== req.user._id.toString()) {
  await Notification.create({
    user: post.user,
    sender: req.user._id,
    type: 'comment',
    post: post._id,
  });
}
    // Populate user info in the new comment before sending it back
    const populatedPost = await post.populate('comments.user', 'username avatar');
    
    res.status(201).json(populatedPost.comments[0]); // Send back just the new comment, populated

  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//function to fetch all posts for a specific user
const getPostsByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username avatar');
      
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


module.exports = {
  createPost,
  getFeedPosts,
  likePost,
  addComment,
  getPostsByUsername,

};