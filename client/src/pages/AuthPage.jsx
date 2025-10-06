import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const AuthPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate(); // Initialize navigate hook
  const login = useAuthStore((state) => state.login); // Get the login action from the store

  

  const { username, email, password } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const switchModeHandler = () => {
    setIsLoginMode((prevMode) => !prevMode);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? '/api/users/login' : '/api/users/register';
    const payload = isLoginMode ? { email, password } : { username, email, password };

    try {
      const res = await axios.post(endpoint, payload);
      console.log(`${isLoginMode ? 'Login' : 'Registration'} successful:`, res.data);

    // Use the login action from our store
    login(res.data, res.data.token)

    // Redirect to the main feed page
      navigate('/feed');
      
      // Next step: Handle token and redirect
    } catch (err) {
      console.error(`${isLoginMode ? 'Login' : 'Registration'} failed:`, err.response?.data || err.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Background patterns from HomePage */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-50 via-white to-blue-50/30"></div>
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-100/40 rounded-full filter blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-100/40 rounded-full filter blur-3xl opacity-50"></div>
      </div>

      {/* Navigation from HomePage */}
      <nav className="relative z-20 flex justify-between items-center px-6 lg:px-12 py-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-800">MiniSocial</span>
        </Link>
      </nav>

      {/* Auth Form Section */}
      <div className="relative z-10 flex justify-center items-center pt-12 pb-24">
        <div className="w-full max-w-md bg-white/70 backdrop-blur-xl p-8 rounded-2xl shadow-lg border border-slate-200">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-2">
            {isLoginMode ? 'Welcome Back!' : 'Create an Account'}
          </h2>
          <p className="text-slate-600 text-center mb-8">
            {isLoginMode ? 'Login to continue to your network.' : 'Join the community to get started.'}
          </p>

          <form onSubmit={onSubmit} className="flex flex-col space-y-4">
            {!isLoginMode && (
              <input
                type="text" name="username" value={username} onChange={onChange}
                placeholder="Username" required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            )}
            <input
              type="email" name="email" value={email} onChange={onChange}
              placeholder="Email Address" required
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            <input
              type="password" name="password" value={password} onChange={onChange}
              placeholder="Password" required minLength="6"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
            />
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-xl text-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              {isLoginMode ? 'Login' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button onClick={switchModeHandler} className="text-sm font-medium text-blue-600 hover:text-indigo-600 hover:underline">
              {isLoginMode ? "Don't have an account? Sign Up" : 'Already have an account? Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;