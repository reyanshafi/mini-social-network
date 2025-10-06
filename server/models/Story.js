const mongoose = require('mongoose');

const storySchema = new mongoose.Schema(
  {
    // The user who created the story
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // The URL of the image or video, hosted on Cloudinary
    mediaUrl: {
      type: String,
      required: true,
    },
    // This specific 'createdAt' field will be used by MongoDB's TTL index
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // We still include timestamps for the 'updatedAt' field, which is good practice
    timestamps: true,
  }
);

// This line creates the TTL index.
// It tells MongoDB to automatically delete any document in this collection
// 24 hours (86400 seconds) after its 'createdAt' time.
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
