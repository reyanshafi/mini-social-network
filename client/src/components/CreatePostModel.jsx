import { useState } from 'react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const CreatePostModal = ({ isOpen, onClose }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const { token } = useAuthStore((state) => state);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const payload = { text, image };
      await axios.post('/api/posts', payload, config);

      // Clear form and close modal on success
      setText('');
      setImage('');
      onClose();
    window.location.reload();
      // We can add a function here to refetch posts later
    } catch (error) {
      console.error('Failed to create post:', error.response?.data || error.message);
    }
  };

  if (!isOpen) return null;

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Create New Post</h2>
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full p-3 h-32 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            required
          />
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="Image URL (optional)"
            className="w-full mt-4 p-3 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
          <div className="flex justify-end space-x-4 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2 rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700">
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;