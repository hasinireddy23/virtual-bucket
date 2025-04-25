import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  // Check for access token and email on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const storedEmail = localStorage.getItem('email');
    if (token && storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  // Handle logout: clear localStorage and redirect
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('email');
    setEmail('');
    navigate('/'); // Redirect to login
  };

  return (
    <header className="bg-white text-gray-800 px-6 py-4 w-full shadow-md fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Virtual Bucket Logo"
            className="h-12 w-12 rounded-xl shadow-md"
          />
          <h1 className="text-2xl font-bold tracking-tight">Virtual Bucket</h1>
        </div>

        {/* Auth Navigation */}
        <div>
          {email ? (
            // Logged-in view
            <div className="flex items-center gap-4">
              <span className="text-base font-medium">{email}</span>
              <button
                onClick={handleLogout}
                className="text-blue-600 hover:underline transition duration-150"
              >
                Logout
              </button>
            </div>
          ) : (
            // Guest view
            <div className="space-x-4">
              <Link to="/" className="hover:underline text-blue-600 font-medium">
                Login
              </Link>
              <Link to="/signup" className="hover:underline text-blue-600 font-medium">
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
