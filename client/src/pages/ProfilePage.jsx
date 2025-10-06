import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import EditProfileModal from '../components/EditProfileModal';
import FollowListModal from '../components/FollowListModal';


const ProfilePage = () => {
  const { username } = useParams();
  const { user: loggedInUser, token } = useAuthStore((state) => state);

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // State for follow modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    users: [],
  });
  
  //functions to open and close the follow modal
   const openFollowersModal = () => {
    setModalState({ isOpen: true, title: 'Followers', users: profile.followers });
  };
  const openFollowingModal = () => {
    setModalState({ isOpen: true, title: 'Following', users: profile.following });
  };
  const closeModal = () => {
    setModalState({ isOpen: false, title: '', users: [] });
  };

  // State for follow button
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);


  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [profileRes, postsRes] = await Promise.all([
          axios.get(`/api/users/profile/${username}`),
          axios.get(`/api/posts/user/${username}`)
        ]);
        
        setProfile(profileRes.data);
        setPosts(postsRes.data);
        
        // Check if the logged-in user is following the profile user
setIsFollowing(profileRes.data.followers.some(follower => follower._id === loggedInUser?._id));
        setFollowersCount(profileRes.data.followers.length);

      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setError('User not found.');
      } finally {
        setIsLoading(false);
      }
    };

    if (username) {
      fetchProfileData();
    }
  }, [username, loggedInUser?._id]);

  const handleFollowToggle = async () => {
    const endpoint = isFollowing ? 'unfollow' : 'follow';
    
    // Optimistic UI Update
    setIsFollowing(!isFollowing);
    setFollowersCount(isFollowing ? followersCount - 1 : followersCount + 1);

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(`/api/users/${endpoint}/${profile._id}`, {}, config);
    } catch (error) {
        console.error("Failed to follow/unfollow", error);
        // Revert UI on error
        setIsFollowing(isFollowing);
        setFollowersCount(followersCount);
    }
  };

  //handler for the message button
  const handleMessageClick = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // This will either get the existing convo or create a new one
      await axios.post(`/api/conversations/${profile._id}`, {}, config);
      // Navigate to the chat page
      navigate('/chat');
    } catch (error) {
      console.error("Failed to start conversation", error);
    }
  };


  if (isLoading) return <div className="text-center p-10">Loading profile...</div>;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;
  if (!profile) return <div className="text-center p-10">User not found.</div>;

  const isOwnProfile = loggedInUser?.username === profile.username;

  return (
    <>
    <div>
      {/* Profile Header */}
      <header className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 p-4 border-b border-slate-200">
 <div className="w-32 h-32 rounded-full bg-slate-300 shrink-0 overflow-hidden">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white bg-gradient-to-br from-blue-400 to-purple-500 text-5xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
  <div className="text-center md:text-left">
    <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
      <h1 className="text-3xl font-light text-slate-800">{profile.username}</h1>
      {isOwnProfile ? (
        <button onClick={() => setIsEditModalOpen(true)} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg text-sm">
          Edit Profile
        </button>
      ) : (
        // This block is updated
        <div className="flex space-x-2">
          <button onClick={handleFollowToggle} className={`font-semibold py-2 px-6 rounded-lg text-sm transition-colors ${isFollowing ? 'bg-slate-200 text-slate-800' : 'bg-blue-500 text-white'}`}>
            {isFollowing ? 'Following' : 'Follow'}
          </button>
          {/* ADDED THIS MESSAGE BUTTON */}
          <button onClick={handleMessageClick} className="bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg text-sm">
            Message
          </button>
        </div>
      )}
    </div>
    <div className="flex justify-center md:justify-start space-x-6 text-lg text-slate-700">
      <span><span className="font-bold text-slate-900">{posts.length}</span> posts</span>
      <button onClick={openFollowersModal} className="hover:text-slate-900">
        <span className="font-bold text-slate-900">{followersCount}</span> followers
      </button>
      <button onClick={openFollowingModal} className="hover:text-slate-900">
        <span className="font-bold text-slate-900">{profile.following.length}</span> following
      </button>
    </div>    
    <p className="mt-4 text-slate-700 max-w-lg">{profile.bio || 'No bio yet.'}</p>
  </div>
</header>

      {/* Post Grid */}
      <div className="mt-8 border-t border-slate-200 pt-4">
        {posts.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {posts.map(post => (
              <div key={post._id} className="aspect-square bg-slate-200">
                {post.image ? (
                  <img src={post.image} alt="Post" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-2 text-slate-500 text-sm overflow-hidden">{post.text.substring(0, 50)}...</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-16 text-slate-500">
            <h2 className="text-2xl font-semibold">No posts yet</h2>
            <p>When this user creates posts, they'll appear here.</p>
          </div>
        )}
      </div>

      <EditProfileModal 
      isOpen={isEditModalOpen} 
      onClose={() => setIsEditModalOpen(false)} 
      profile={profile} 
      />

      <FollowListModal 
      isOpen={modalState.isOpen} 
      onClose={closeModal} 
      title={modalState.title} 
      users={modalState.users} 
      />

    </div>
    </>
  );
};

export default ProfilePage;