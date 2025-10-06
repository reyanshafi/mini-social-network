import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useAuthStore from '../../store/authStore';

// SVG Icon for the "Send" button
const SendIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
  </svg>
);

const ChatWindow = ({ conversation }) => {
  // --- STATE MANAGEMENT ---
  // Stores the array of message objects for the current chat
  const [messages, setMessages] = useState([]);
  // Holds the text of the message currently being typed in the input
  const [newMessage, setNewMessage] = useState('');
  // Tracks the loading state while fetching initial messages
  const [isLoading, setIsLoading] = useState(true);
  // Tracks if the other user is currently typing
  const [isTyping, setIsTyping] = useState(false);
  // Tracks if the last message sent by the current user has been seen
  const [isLastMessageSeen, setIsLastMessageSeen] = useState(false);
  
  // Get global state and actions from our Zustand store
  const { user, token, socket, markConversationAsRead } = useAuthStore((state) => state);
  
  // Refs for managing the scroll position and typing timeout
  const scrollRef = useRef();
  const typingTimeoutRef = useRef(null);

  // Helper to get the other user in the conversation
  const otherUser = conversation.participants.find(p => p._id !== user._id);

  // --- USEEFFECT HOOKS for side effects ---

  // Effect #1: Fetch initial message history when a conversation is selected
  useEffect(() => {
    if (!conversation) return;

    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`/api/messages/${conversation._id}`, config);
        setMessages(res.data);
        
        // After fetching, check the read status of the last message
        if (res.data.length > 0) {
          const lastMessage = res.data[res.data.length - 1];
          if (lastMessage.sender?._id === user._id && lastMessage.read) {
            setIsLastMessageSeen(true);
          } else {
            setIsLastMessageSeen(false);
          }
        }
      } catch (error) { console.error("Failed to fetch messages", error); }
      finally { setIsLoading(false); }
    };
    
    fetchMessages();
    
    // Tell the backend (and global store) that this conversation is now read
    markConversationAsRead(conversation._id);
    
    // Also emit a socket event for the other user to get a real-time 'seen' update
    if (socket) {
      socket.emit('markAsSeen', { conversationId: conversation._id, readerId: user._id });
    }
  }, [conversation, token, user._id, socket, markConversationAsRead]);

  // Effect #2: Set up all real-time event listeners from Socket.IO
  useEffect(() => {
    if (socket) {
      // Listen for new messages
      socket.on('receiveMessage', (message) => {
        if (message.conversationId === conversation._id) {
          setMessages((prev) => [...prev, message]);
          setIsLastMessageSeen(false); // A new message has arrived, so it can't be seen by the sender yet
          // Immediately mark the new message as seen since the chat window is open
          socket.emit('markAsSeen', { conversationId: conversation._id, readerId: user._id });
        }
      });
      // Listen for typing indicator
      socket.on('userTyping', ({ conversationId }) => { if (conversationId === conversation._id) setIsTyping(true); });
      socket.on('userStoppedTyping', ({ conversationId }) => { if (conversationId === conversation._id) setIsTyping(false); });
      // Listen for the 'seen' confirmation for messages you sent
      socket.on('messagesSeen', ({ conversationId: seenConvoId }) => {
        if (seenConvoId === conversation._id) {
          setIsLastMessageSeen(true);
        }
      });
    }
    // Cleanup: Remove listeners when the component unmounts to prevent memory leaks
    return () => {
      socket?.off('receiveMessage');
      socket?.off('userTyping');
      socket?.off('userStoppedTyping');
      socket?.off('messagesSeen');
    };
  }, [socket, conversation, user._id]);

  // Effect #3: Auto-scroll to the bottom of the chat when new messages are added
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- EVENT HANDLERS ---

  // Handles submitting the form to send a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messagePayload = { senderId: user._id, receiverId: otherUser._id, conversationId: conversation._id, text: newMessage, read: false };
    
    socket.emit('sendMessage', messagePayload);
    
    const tempMessage = { ...messagePayload, sender: user, createdAt: new Date().toISOString() };
    setMessages([...messages, tempMessage]);
    setNewMessage('');
    setIsLastMessageSeen(false); // Reset seen status because you just sent a new message
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('stopTyping', { receiverId: otherUser._id, conversationId: conversation._id });
  };
  
  // Handles changes in the input field to emit typing events
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (!socket) return;
    socket.emit('typing', { receiverId: otherUser._id, conversationId: conversation._id });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { receiverId: otherUser._id, conversationId: conversation._id });
    }, 2000);
  };

  // --- RENDER LOGIC ---

  if (isLoading) return <div className="flex items-center justify-center h-full"><p>Loading conversation...</p></div>;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header section with the other user's name */}
      <div className="flex items-center space-x-4 p-4 border-b border-slate-200">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center shrink-0">
          <span className="text-white font-semibold text-lg">{otherUser.username.charAt(0).toUpperCase()}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">{otherUser.username}</h2>
          <p className="text-sm text-gray-400">Offline</p>
        </div>
      </div>
      
      {/* Main message display area */}
      <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50">
        {messages.length === 0 && !isLoading && (
          <div className="text-center text-slate-500 pt-10"><p>This is the beginning of your conversation.</p></div>
        )}
        {messages.map((msg, index) => (
          <div key={msg._id || index} className={`flex my-2 ${msg.sender?._id === user._id ? 'justify-end' : 'justify-start'}`}>
            <div className={`py-2 px-4 rounded-2xl max-w-lg lg:max-w-xl shadow-sm ${msg.sender?._id === user._id ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-slate-800 rounded-bl-none'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {/* Seen status indicator */}
        {isLastMessageSeen && messages[messages.length - 1]?.sender?._id === user._id && (
          <div className="flex justify-end pr-2 mt-1"><p className="text-xs text-slate-500">Seen by {otherUser.username}</p></div>
        )}
        {/* Empty div that the page scrolls to */}
        <div ref={scrollRef} />
      </div>
      
      {/* Typing indicator, shown when the other user is typing */}
      {isTyping && <div className="p-2 px-4 text-sm text-slate-500 animate-pulse">{otherUser.username} is typing...</div>}
      
      {/* Message input form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center space-x-3 bg-white">
        <input 
          value={newMessage} 
          onChange={handleInputChange}
          type="text" 
          placeholder="Type a message..." 
          className="w-full p-3 bg-slate-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" 
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          disabled={!newMessage.trim()}
        >
          <SendIcon className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;