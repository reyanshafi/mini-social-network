const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @desc    Get all messages for a conversation
// @route   GET /api/messages/:conversationId
// @access  Private
const getMessages = async (req, res) => {
  try {
    // Security check: Make sure the user is part of this conversation
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'User not authorized' });
    }

    const messages = await Message.find({ conversationId: req.params.conversationId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 'asc' }); // Sort oldest to newest

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

//get count of all unread messages
const getUnreadMessagesCount = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id });
    const conversationIds = conversations.map(c => c._id);
    
    const count = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      read: false,
      sender: { $ne: req.user._id } // Count messages not sent by the logged-in user
    });
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};


// function to mark messages as read
const markMessagesAsRead = async (req, res) => {
    try {
        await Message.updateMany(
            { conversationId: req.params.conversationId, sender: { $ne: req.user._id } },
            { $set: { read: true } }
        );
        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};



module.exports = { getMessages, getUnreadMessagesCount, markMessagesAsRead};