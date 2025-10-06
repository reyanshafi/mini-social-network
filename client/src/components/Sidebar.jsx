import { useState, useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import axios from 'axios';
import CreatePostModal from './CreatePostModel'; // Using your filename

// ----- SVG ICONS -----
const HomeIcon = (props) => ( <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> );
const UserIcon = (props) => ( <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> );
const LogoutIcon = (props) => ( <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg> );
const LogoIcon = (props) => ( <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg> );
const CreateIcon = (props) => ( <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> );
const SearchIcon = (props) => ( <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> );
const MessageIcon = (props) => ( <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>);
const BellIcon = (props) => ( <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> );
// --------------------

const Sidebar = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  // const [unreadMessages, setUnreadMessages] = useState(0);
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const unreadCount = useAuthStore((state) => state.unreadCount);
  const navigate = useNavigate();

  // Get the count and fetch functions from the store
  const unreadMessages = useAuthStore((state) => state.unreadMessages);
  const fetchUnreadMessages = useAuthStore((state) => state.fetchUnreadMessages);
  const fetchNotifications = useAuthStore((state) => state.fetchNotifications);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadMessages();
  }, [fetchNotifications, fetchUnreadMessages]);

  
  const handleLogout = () => { logout(); navigate("/auth"); };

  return (
    <>
      <aside className={`
        group z-50 flex
        transition-all duration-300 ease-in-out
        fixed bottom-0 left-0 w-full h-20 bg-white/95 backdrop-blur-lg border-t border-gray-200/80
        md:fixed md:top-6 md:left-6 md:bottom-6 md:flex-col 
        md:justify-between md:p-4 md:h-auto
        md:w-20 md:hover:w-72 md:bg-white/80 
        md:backdrop-blur-xl md:shadow-xl md:rounded-2xl md:border md:border-gray-200/60
        md:hover:shadow-2xl md:border-t
      `}>
        <div className="flex flex-row md:flex-col justify-between items-stretch w-full h-full md:min-h-0">
          <div className="flex flex-row md:flex-col justify-center md:justify-start items-stretch w-full md:flex-1 md:min-h-0">
            <div className="hidden md:flex items-center h-14 w-full mb-6">
              <div className="flex justify-center w-16 shrink-0"><div className="bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 rounded-xl p-2.5 shadow-lg"><LogoIcon className="w-7 h-7 text-white" /></div></div>
              <div className="overflow-hidden w-0 md:group-hover:w-48 transition-all duration-300 ease-out"><span className="whitespace-nowrap text-xl font-bold text-slate-800 ml-3">MiniSocial</span></div>
            </div>
            <nav className="flex flex-row md:flex-col justify-around md:justify-start items-center w-full md:space-y-1 md:flex-1">
              <NavItem to="/feed" icon={<HomeIcon className="w-6 h-6" />} label="Home" />
              <NavItem to="/explore/search" icon={<SearchIcon className="w-6 h-6" />} label="Search" />
              <NavItem to="/chat" label="Messages"
                icon={
                  <div className="relative">
                    <MessageIcon className="w-7 h-7" />
                    {unreadMessages > 0 && (<span className="absolute -top-1 -right-2 flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-red-500 rounded-full">{unreadMessages}</span>)}
                  </div>
                }
              />
              <NavItem to="/notifications" label="Notifications"
                icon={
                  <div className="relative">
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (<span className="absolute -top-1 -right-1 block h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-white shadow-sm"></span>)}
                  </div>
                } 
              />
              <NavButton onClick={() => setIsCreateModalOpen(true)} icon={<CreateIcon className="w-6 h-6" />} label="Create" className="bg-blue-50 hover:bg-blue-100 text-blue-600" />
              <NavItem to={`/profile/${user?.username}`} icon={<UserIcon className="w-6 h-6" />} label="Profile" />
            </nav>
          </div>
          <div className="hidden md:block md:flex-shrink-0 md:mt-4 md:pt-4 md:border-t md:border-gray-200/60">
            <NavButton onClick={handleLogout} icon={<LogoutIcon className="w-6 h-6" />} label="Logout" className="text-red-600 hover:bg-red-50" />
          </div>
        </div>
      </aside>
      <CreatePostModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
    </>
  );
};

const NavItem = ({ to, icon, label }) => {
  return (
    <NavLink to={to}>
      {({ isActive }) => (
        <div className={`
          flex items-center justify-center md:justify-start 
          h-14 md:h-12 w-full md:w-full
          rounded-xl md:rounded-lg
          transition-all duration-200 ease-in-out
          relative group/item
          ${isActive 
            ? 'text-blue-700 font-semibold md:bg-blue-100 md:shadow-sm' 
            : 'text-slate-600 md:hover:bg-slate-100 md:hover:text-slate-800'
          }
        `}>
          <div className="flex justify-center w-12 md:w-16 shrink-0 relative">{icon}</div>
          <div className="overflow-hidden w-0 md:group-hover:w-44 transition-all duration-300 ease-out">
            <span className="whitespace-nowrap text-base font-medium ml-2">{label}</span>
          </div>
          <div className={`
            md:hidden absolute top-0 left-1/2 -translate-x-1/2 
            w-8 h-1 bg-blue-500 rounded-full transition-opacity duration-200
            ${isActive ? 'opacity-100' : 'opacity-0'}
          `} />
        </div>
      )}
    </NavLink>
  );
};

const NavButton = ({ onClick, icon, label, className = "" }) => ( 
  <button onClick={onClick} className={`
    flex items-center justify-center md:justify-start 
    h-14 md:h-12 w-full md:w-full
    rounded-xl md:rounded-lg
    transition-all duration-200 ease-in-out
    text-slate-600 md:hover:bg-slate-100 md:hover:text-slate-800
    ${className}
  `}> 
    <div className="flex justify-center w-12 md:w-16 shrink-0">{icon}</div> 
    <div className="overflow-hidden w-0 md:group-hover:w-44 transition-all duration-300 ease-out">
      <span className="whitespace-nowrap text-base font-medium ml-2">{label}</span>
    </div> 
  </button> 
);

export default Sidebar;