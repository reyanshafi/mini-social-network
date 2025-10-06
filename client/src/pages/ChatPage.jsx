import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';
import ChatWindow from '../components/chat/ChatWindow';

const ChatPage = () => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const { user, token } = useAuthStore((state) => state);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/conversations', config);
        setConversations(res.data);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, [token]);

  return (
    <div className="flex h-[calc(100vh-8rem)] border border-slate-200 rounded-2xl overflow-hidden">
      {/* Left Side: Conversation List */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col">
        <h2 className="text-xl font-bold p-4 border-b border-slate-200 shrink-0">Chats</h2>
        <div className="overflow-y-auto">
          {isLoading ? <p className="p-4">Loading chats...</p> : 
            conversations.map(convo => {
              const otherUser = convo.participants.find(p => p._id !== user._id);
              return (
                <div key={convo._id} onClick={() => setSelectedConvo(convo)} className={`flex items-center space-x-4 p-3 cursor-pointer border-b border-slate-100 ${selectedConvo?._id === convo._id ? 'bg-blue-50' : 'hover:bg-slate-100'}`}>
                  <div className="w-12 h-12 rounded-full bg-slate-300"></div>
                  <span className="font-bold text-slate-800">{otherUser.username}</span>
                </div>
              )
            })
          }
        </div>
      </div>

      {/* Right Side: Chat Window */}
      <div className="w-2/3">
        {selectedConvo ? (
          <ChatWindow conversation={selectedConvo} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;