const express = require('express');
const router = express.Router();
const { createPost, getFeedPosts, likePost, addComment, getPostsByUsername} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// The route for creating a post, protected by our auth middleware
router.post('/', protect, createPost);

//route for getting user's feed
router.get('/feed', protect, getFeedPosts);

//route for liking/unliking the posts
router.put('/:id/like', protect, likePost);

//route for adding comments on posts
router.post('/:id/comment', protect, addComment);

//router to get all posts from a specific user
router.get('/user/:username', getPostsByUsername);



module.exports = router;