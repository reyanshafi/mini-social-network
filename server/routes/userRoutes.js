const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getUserProfileByUsername, updateUserProfile, searchUsers, followUser, unfollowUser, uploadAvatar } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); 
const { multerUpload, storyUpload } = require('../middleware/multer');


// The route for registering a user
router.post('/register', registerUser);

//Login Route
router.post('/login', loginUser);

//route for get user profiles
router.get('/profile',protect, getUserProfile);

//router to get user profile by username
router.get('/profile/:username', getUserProfileByUsername);

//router to update user profile
router.put('/profile', protect, updateUserProfile);

//router to search user profiles
router.get('/search', protect, searchUsers);

//routes to follow/ unfollow user
router.put('/follow/:id', protect, followUser);
router.put('/unfollow/:id', protect, unfollowUser);

//route for uploading avatar for a user profile
router.put('/avatar', protect, multerUpload, uploadAvatar);


module.exports = router;