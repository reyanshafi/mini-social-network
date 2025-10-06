// Import required packages
const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db'); // Import the connectDB function
const http = require('http'); // Import Node's built-in HTTP module
const { Server } = require('socket.io'); // Import the Server class from socket.io
const cors = require('cors'); // 1. Import the cors package



// Initialize dotenv to use environment variables
dotenv.config();

//connect to databse
connectDB();

// Create an Express app
const app = express();

 //Use the cors middleware right after creating the app
app.use(cors({
  origin: "http://localhost:5173"
}));

// Create an HTTP server from the Express app
const server = http.createServer(app);

// Create a new Socket.IO instance and attach it to the server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // The origin of your React frontend
    methods: ["GET", "POST"]
  }
});

let onlineUsers = [];

const addUser= (userId, socketId) => {
  !onlineUsers.some(user => user.userId === userId) &&
    onlineUsers.push({ userId, socketId });
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter(user => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find(user => user.userId === userId);
};


// --- SOCKET.IO CONNECTION LOGIC ---
io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  // You can add more socket event listeners here, like for chat messages
  // Event to add a new user to the online list
  socket.on('addUser', (userId) => {
    addUser(userId, socket.id);
  });

  //event to handle sending a message
  socket.on('sendMessage', async ({ senderId, receiverId, conversationId, text }) => {
    // Save the message to the database
    const Message = require('./models/Message');
    const newMessage = new Message({
      conversationId,
      sender: senderId,
      text,
    });
    const savedMessage = await newMessage.save();
    const populatedMessage = await savedMessage.populate('sender', 'username avatar');

    //event to handle user typing
socket.on('typing', ({ receiverId, conversationId }) => {
    console.log(`BACKEND: Received "typing" event for receiver ${receiverId}`);
    const receiver = getUser(receiverId);
    if (receiver) {
            console.log(`BACKEND: Relaying "userTyping" to socket ${receiver.socketId}`);

      io.to(receiver.socketId).emit('userTyping', { conversationId });
    }
  });

  //event to handle user stopping typing
  socket.on('stopTyping', ({ receiverId, conversationId }) => {
        console.log(`BACKEND: Received "stopTyping" event for receiver ${receiverId}`);

    const receiver = getUser(receiverId);
    if (receiver) {
            console.log(`BACKEND: Relaying "userStoppedTyping" to socket ${receiver.socketId}`);

      io.to(receiver.socketId).emit('userStoppedTyping', { conversationId });
    }
  });

  // to mark seen messages as seen
  socket.on('markAsSeen', async ({ conversationId, readerId }) => {
    try {
      const Conversation = require('./models/Conversation');
      const Message = require('./models/Message');

      const conversation = await Conversation.findById(conversationId);
      if (!conversation) return;

      // Find the other user (the one who sent the messages)
      const messageSenderId = conversation.participants.find(p => p.toString() !== readerId);
      
      // Update messages in the database that were sent by the other user and are unread
      await Message.updateMany(
        { conversationId: conversationId, sender: messageSenderId, read: false },
        { $set: { read: true } }
      );

      // Notify the original sender that their messages were seen
      const messageSenderSocket = getUser(messageSenderId.toString());
      if (messageSenderSocket) {
        io.to(messageSenderSocket.socketId).emit('messagesSeen', { conversationId });
      }
    } catch (error) {
      console.error("Error in markAsSeen event:", error);
    }
  });

    // find the recievers socket
        const receiver = getUser(receiverId);
      //If the receiver is online, send the message to them in real-time
    if (receiver) {
      io.to(receiver.socketId).emit('receiveMessage', populatedMessage);
    }
  });


  //handle disconnection
  socket.on('disconnect', () => {
    console.log('🔥 User disconnected:', socket.id);
  });
});



// Body Parser Middleware -> This allows us to accept JSON data in the body
app.use(express.json());

// Define the port
const PORT = process.env.PORT || 5000;

// A simple test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Mount Routes
app.use('/api/users', require('./routes/userRoutes')); // Use the user routes
app.use('/api/posts', require('./routes/postRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/stories', require('./routes/storyRoutes'));





// Start the server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});