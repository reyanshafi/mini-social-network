import { useState, useEffect } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import { Link } from 'react-router-dom';

// Enhanced heart icon with smooth transitions
const HeartIcon = ({ isLiked }) => (
  <svg 
    className={`w-6 h-6 cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 ${
      isLiked 
        ? 'text-red-500 drop-shadow-sm' 
        : 'text-gray-400 hover:text-red-400'
    }`} 
    fill={isLiked ? 'currentColor' : 'none'} 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={isLiked ? 0 : 1.5} 
      d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z" 
    />
  </svg>
);

// Comment icon for visual enhancement
const CommentIcon = () => (
  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const Post = ({ post }) => {
  const { user, token } = useAuthStore((state) => state);

  // State for optimistic UI update (adding likes on posts)
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);

  //State for adding comments on posts
  const [comments, setComments] = useState(post.comments);
  const [newComment, setNewComment] = useState('');

  // Check if the current user has liked this post
  useEffect(() => {
    setIsLiked(likes.includes(user?._id));
  }, [user, likes]);
  
  // handler for liking the posts
  const handleLike = async () => {
    // Optimistic update: Update the UI immediately
    const originalLikes = [...likes];
    const newIsLiked = !isLiked;
    
    setIsLiked(newIsLiked);
    setLikes(newIsLiked 
      ? [...likes, user._id] 
      : likes.filter(id => id !== user._id)
    );

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/posts/${post._id}/like`, {}, config);
    } catch (error) {
      console.error('Failed to like post:', error);
      // If the API call fails, revert the UI back to its original state
      setLikes(originalLikes);
      setIsLiked(!newIsLiked);
    }
  };

  // handler for submitting a comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post(`/api/posts/${post._id}/comment`, { text: newComment }, config);
      
      // Add the new comment returned from the API to the top of the list
      setComments([res.data, ...comments]);
      setNewComment(''); // Clear the input field
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  if (!post || !post.user) {
    return null;
  }

  return (
    <article className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 mb-6 overflow-hidden">
      {/* Post Header & Content */}
      <div className="p-6">
        {/* User Info Header */}
        <div className="flex items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 mr-4 flex items-center justify-center shadow-sm">
            <span className="text-white font-semibold text-lg">
              {post.user.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-base">
              <Link 
                to={`/profile/${post.user.username}`} 
                className="hover:text-blue-600 transition-colors duration-150"
              >
                {post.user.username}
              </Link>
            </p>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(post.createdAt).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </p>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed text-base mb-4 whitespace-pre-wrap">
            {post.text}
          </p>
          {post.image && (
            <div className="rounded-xl overflow-hidden bg-gray-50">
              <img 
                src={post.image} 
                alt="Post content" 
                className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300" 
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Actions and Comments Section */}
      <div className="border-t border-gray-100">
        {/* Engagement Stats */}
        <div className="px-6 py-3 bg-gray-50/50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span className="font-medium">{likes.length} {likes.length === 1 ? 'like' : 'likes'}</span>
            {comments.length > 0 && (
              <span>{comments.length} {comments.length === 1 ? 'comment' : 'comments'}</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-3 border-t border-gray-100">
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-150"
            >
              <HeartIcon isLiked={isLiked} />
              <span className={`text-sm font-medium ${isLiked ? 'text-red-500' : 'text-gray-600'}`}>
                Like
              </span>
            </button>
            <div className="flex items-center space-x-2 px-3 py-2">
              <CommentIcon />
              <span className="text-sm font-medium text-gray-600">Comment</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {comments.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100">
            <div className="space-y-3">
              {comments.slice(0, 2).map((comment) => (
                <div key={comment._id} className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium text-sm">
                      {comment.user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="bg-gray-50 rounded-2xl px-4 py-2">
                      <p className="font-semibold text-gray-900 text-sm">
                        {comment.user.username}
                      </p>
                      <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
              {comments.length > 2 && (
                <button className="text-sm text-gray-500 hover:text-gray-700 font-medium py-1 transition-colors duration-150">
                  View all {comments.length} comments
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add Comment Form */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/30">
          <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-transparent outline-none text-sm placeholder-gray-500"
              />
              <button 
                type="submit" 
                className={`ml-3 px-4 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                  newComment.trim() 
                    ? 'text-blue-600 hover:bg-blue-50 cursor-pointer' 
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                disabled={!newComment.trim()}
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </article>
  );
};

export default Post;