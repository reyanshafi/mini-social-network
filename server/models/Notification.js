const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { // The user who receives the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: { // The user who triggered the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: { // The type of notification
      type: String,
      required: true,
      enum: ['like', 'comment', 'follow'],
    },
    post: { // Optional: the post related to the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    read: { // Whether the notification has been seen
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;