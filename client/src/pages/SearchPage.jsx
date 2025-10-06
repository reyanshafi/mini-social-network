import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.get(`/api/users/search?q=${query}`, config);
        setResults(res.data);
      } catch (error) {
        console.error('Failed to search users:', error.response?.data || error.message);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query, token]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for users..."
        autoFocus
        className="w-full p-3 mb-4 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex-1 overflow-y-auto">
        {isLoading && <p className="text-slate-500">Searching...</p>}
        {!isLoading && results.length === 0 && query && <p className="text-slate-500">No users found.</p>}
        {results.map(user => (
          <Link key={user._id} to={`/profile/${user.username}`} className="flex items-center space-x-4 p-2 rounded-lg hover:bg-slate-100">
            <div className="w-12 h-12 rounded-full bg-slate-300 shrink-0"></div>
            <span className="font-bold text-slate-800">{user.username}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;