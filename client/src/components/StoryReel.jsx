import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const StoryReel = ({ onStoryClick, onAddStoryClick }) => {
  const [storyUsers, setStoryUsers] = useState([]);
  const { user, token } = useAuthStore((state) => state);

  useEffect(() => {
    const fetchStories = async () => {
      if (!token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get('/api/stories', config);
        // Put the current user's story first, if it exists
        const currentUserStories = res.data.find(storyUser => storyUser._id === user._id);
        const otherUsersStories = res.data.filter(storyUser => storyUser._id !== user._id);
        setStoryUsers(currentUserStories ? [currentUserStories, ...otherUsersStories] : otherUsersStories);
      } catch (error) {
        console.error("Failed to fetch stories", error);
      }
    };
    fetchStories();
  }, [token, user._id]);

  const currentUser = useAuthStore((state) => state.user);

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-6">
      <div className="flex items-center space-x-4">
        {/* Add Story Button */}
        <div onClick={onAddStoryClick} className="flex flex-col items-center space-y-1 cursor-pointer text-center shrink-0">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-3xl text-slate-400 hover:bg-slate-200 transition-colors relative">
            <img src={currentUser?.avatar} alt="Your avatar" className="w-full h-full object-cover rounded-full" />
            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 text-white border-2 border-white">+</div>
          </div>
          <p className="text-xs font-medium text-slate-600 w-16 truncate">Your Story</p>
        </div>

        {/* Story Avatars */}
        {storyUsers.map((storyUser, index) => (
          <div key={storyUser._id} onClick={() => onStoryClick(storyUsers, index)} className="flex flex-col items-center space-y-1 cursor-pointer text-center shrink-0">
            <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500">
              <div className="bg-white p-0.5 rounded-full h-full w-full">
                <img src={storyUser.avatar} alt={storyUser.username} className="w-full h-full object-cover rounded-full" />
              </div>
            </div>
            <p className="text-xs text-slate-600 w-16 truncate">{storyUser.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoryReel;