const express = require('express');
const router = express.Router();
const { getConversations, createOrGetConversation } = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getConversations);
router.route('/:userId').post(protect, createOrGetConversation); // Add this line


module.exports = router;