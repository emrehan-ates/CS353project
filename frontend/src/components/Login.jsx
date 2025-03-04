import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Both email and password are required');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/auth/login', {
        email,
        password,
      });

      const { user } = response.data;

      // Save user info to localStorage
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect based on user role
      if (user.role === 'admin') {
        navigate('/admin/dashboard'); // Redirect to admin dashboard
      } else {
        navigate('/dashboard'); // Redirect to user dashboard
      }
    } catch (error) {
      console.error('❌ Login Error:', error.response?.data || error.message);
      setError(
        error.response?.data?.error || 'An error occurred during login.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}
        <button
          onClick={handleLogin}
          className={`w-full ${loading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} text-white p-2 rounded`}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
    </div>
  );
};

export default Login;
