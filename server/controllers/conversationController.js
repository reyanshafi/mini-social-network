const Conversation = require('../models/Conversation');

// @desc    Get all conversations for a user
// @route   GET /api/conversations
// @access  Private
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'username avatar')
      .sort({ updatedAt: -1 });
    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

//function to create or get convo with another user
const createOrGetConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUserId = req.user._id;

    // Check if a conversation between these two users already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [loggedInUserId, userId] },
    });

    if (conversation) {
      // If conversation exists, return it
      return res.status(200).json(conversation);
    }

    // If not, create a new one
    const newConversation = new Conversation({
      participants: [loggedInUserId, userId],
    });
    await newConversation.save();
    const populatedConversation = await newConversation.populate('participants', 'username avatar');

    res.status(201).json(populatedConversation);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getConversations, createOrGetConversation };
