const express = require('express');
const router = express.Router();
const { createStory, getStoriesForFeed } = require('../controllers/storyController');
const { protect } = require('../middleware/authMiddleware');
const { storyUpload } = require('../middleware/multer'); // Import our new middleware

// The route for creating a story
router.post('/', protect, storyUpload, createStory);

//route to get stories 
router.get('/', protect, getStoriesForFeed); // Add this line


module.exports = router;