const express = require('express');
const router = express.Router();
const { getMessages, getUnreadMessagesCount, markMessagesAsRead } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.get('/unread-count', protect, getUnreadMessagesCount);
router.route('/:conversationId').get(protect, getMessages);
router.put('/read/:conversationId', protect, markMessagesAsRead);


module.exports = router;