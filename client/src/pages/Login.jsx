

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile) {
      if (profile.role === 'provider') navigate('/provider/dashboard');
      if (profile.role === 'recipient') navigate('/recipient/dashboard');
      if (profile.role === 'admin') navigate('/admin/dashboard');
    }
  }, [profile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn({ email, password });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white flex flex-col">
      {/* Header */}
      <header className="py-6 flex justify-center items-center bg-white shadow-sm">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 21C12 21 3 13.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12.99 5.08C14.07 3.81 15.74 3 17.5 3C20.58 3 23 5.42 23 8.5C23 13.5 12 21 12 21Z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span className="text-2xl font-bold text-primary">FoodBridge</span>
        </div>
      </header>
      {/* Main */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="mb-8 text-center">
          <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mx-auto mb-2"><path d="M12 21C12 21 3 13.5 3 8.5C3 5.42 5.42 3 8.5 3C10.24 3 11.91 3.81 12.99 5.08C14.07 3.81 15.74 3 17.5 3C20.58 3 23 5.42 23 8.5C23 13.5 12 21 12 21Z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <h1 className="text-3xl font-bold text-gray-900">Welcome to FoodBridge</h1>
          <p className="text-gray-500 mt-2">Reducing food waste, one meal at a time</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">Sign In</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <div>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-base"
                required
              />
            </div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-base pr-12"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-gray-500 hover:text-primary text-sm"
                tabIndex={-1}
              >
                {showPass ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              type="submit"
              className="bg-primary text-white rounded-lg py-2 font-semibold mt-2 transition hover:bg-primary-dark disabled:bg-primary-light text-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-spin inline-block mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4"></span>
              ) : null}
              Sign In
            </button>
            {error && <div className="text-red-500 text-sm mt-2 text-center">{error}</div>}
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up here</Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;


