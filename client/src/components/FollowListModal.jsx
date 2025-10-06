import { Link } from 'react-router-dom';

const FollowListModal = ({ isOpen, onClose, title, users = [] }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="text-center p-4 border-b border-slate-200">
          <h2 className="font-bold text-lg text-slate-800">{title}</h2>
        </div>
        <div className="max-h-80 overflow-y-auto p-4">
          {users.length > 0 ? (
            users.map(user => (
              <Link
                key={user._id}
                to={`/profile/${user.username}`}
                onClick={onClose}
                className="flex items-center space-x-4 p-2 rounded-lg hover:bg-slate-100"
              >
                <div className="w-12 h-12 rounded-full bg-slate-300 shrink-0"></div>
                <span className="font-bold text-slate-800">{user.username}</span>
              </Link>
            ))
          ) : (
            <p className="text-center text-slate-500 py-4">No users to show.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;