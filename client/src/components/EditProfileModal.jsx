import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

// A simple spinner icon for the loading state
const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

const EditProfileModal = ({ isOpen, onClose, profile }) => {
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // NEW: State for loading
  const { token } = useAuthStore((state) => state);
  const fileInputRef = useRef();

  // Populate form with existing profile data when modal opens
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || '');
      setPreview(profile.avatar || null);
    }
  }, [profile]);

  // Handle new file selection and create a preview
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true); // Start loading state

    try {
      let avatarUrl = profile.avatar; // Start with the existing avatar URL

    // Step 1: If a new file was chosen, upload it first to get the new URL
    if (avatarFile) {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      const uploadConfig = { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } };
      const res = await axios.put('/api/users/avatar', formData, uploadConfig);
      avatarUrl = res.data.avatar; // Store the new URL from the server response
    }

    // Step 2: Make ONE single API call to update the profile with the final bio and avatar URL
    const updateConfig = { headers: { Authorization: `Bearer ${token}` } };
    await axios.put('/api/users/profile', { bio: bio, avatar: avatarUrl }, updateConfig);
      onClose();
      window.location.reload(); // Reload to see all changes reflected
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Optionally, show an error message to the user here
    } finally {
      setIsSaving(false); // End loading state
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-32 h-32 rounded-full bg-slate-200 mb-4 overflow-hidden shadow-inner">
              {preview ? (
                <img src={preview} alt="Avatar preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">No Image</div>
              )}
            </div>
            <button type="button" onClick={() => fileInputRef.current.click()} className="bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm hover:bg-slate-200 transition-colors">
              Change Picture
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>

          {/* Bio Section */}
          <label className="text-sm font-medium text-slate-600">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            className="w-full mt-1 h-24 p-3 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200" disabled={isSaving}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center disabled:bg-blue-400"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <SpinnerIcon />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;