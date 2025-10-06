import { Link } from 'react-router-dom';

const NotificationItem = ({ notification }) => {
  const { sender, type, post, createdAt } = notification;

  const renderText = () => {
    switch (type) {
      case 'like':
        return <>liked your post.</>;
      case 'comment':
        return <>commented on your post.</>;
      case 'follow':
        return <>started following you.</>;
      default:
        return null;
    }
  };

  const linkTo = type === 'follow' ? `/profile/${sender.username}` : `/post/${post?._id}`;

  return (
    <Link to={linkTo} className={`flex items-center space-x-4 p-3 rounded-lg ${notification.read ? 'bg-white' : 'bg-blue-50'}`}>
      <div className="w-12 h-12 rounded-full bg-slate-300 shrink-0"></div>
      <div className="flex-1">
        <p className="text-slate-800">
          <span className="font-bold">{sender.username}</span> {renderText()}
        </p>
        <p className="text-sm text-slate-500">{new Date(createdAt).toLocaleString()}</p>
      </div>
      {type !== 'follow' && post?.image && (
        <img src={post.image} alt="Post thumbnail" className="w-14 h-14 rounded-md object-cover" />
      )}
    </Link>
  );
};

export default NotificationItem;