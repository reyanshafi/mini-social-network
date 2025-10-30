import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import Post from '../components/Post';
import StoryReel from '../components/StoryReel';
// Loading skeleton component for better UX
const PostSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
        <div>
          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
      <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
    </div>
    <div className="px-6 pb-4 border-t border-gray-200">
      <div className="flex items-center space-x-4 py-3">
        <div className="h-6 bg-gray-300 rounded w-16"></div>
        <div className="h-6 bg-gray-300 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Empty state component
const EmptyFeedState = () => (
  <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">Your feed is empty</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">
      Follow some users to see their posts and start building your social network!
    </p>
    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
      Discover People
    </button>
  </div>
);

// Error state component
const ErrorState = ({ onRetry }) => (
  <div className="bg-white border border-red-200 rounded-xl p-12 text-center">
    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-3">Something went wrong</h3>
    <p className="text-gray-600 mb-6">
      We couldn't load your feed. Please check your connection and try again.
    </p>
    <button 
      onClick={onRetry}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const { token, user } = useAuthStore((state) => state);


  const fetchFeedPosts = async () => {
    try {
      setIsLoading(true);
      setError(false);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const res = await axios.get('/api/posts/feed', config);
      setPosts(res.data);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: State to manage the story viewer
  const [storyViewerState, setStoryViewerState] = useState({
    isOpen: false,
    users: [],
    startIndex: 0,
  });

  useEffect(() => {
    fetchFeedPosts();
  }, [token]);

  // Function to open the story viewer
  const handleStoryClick = (users, startIndex) => {
    setStoryViewerState({ isOpen: true, users, startIndex });
  };

  // Placeholder for opening the upload modal
  const handleAddStoryClick = () => {
    console.log("Open add story modal...");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Your Feed</h1>
              <p className="text-gray-600 mt-1">Stay up to date with your network</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Create Post Prompt */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 bg-gray-50 rounded-full px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">
              <p className="text-gray-500">What's on your mind, {user?.username}?</p>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        ) : error ? (
          <ErrorState onRetry={fetchFeedPosts} />
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => (
              <Post key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <EmptyFeedState />
        )}

        {/* Load More Button - Optional for future implementation */}
        {posts.length > 0 && !isLoading && (
          <div className="text-center mt-8">
            <button className="text-gray-500 hover:text-gray-700 font-medium transition-colors">
              Load more posts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedPage;