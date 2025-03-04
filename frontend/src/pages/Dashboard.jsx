import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userEmail = user?.email || '';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-center mb-6">User Dashboard</h2>
      <p className="text-center mb-4">Welcome, <strong>{userEmail}</strong>!</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* My Ads */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <h3 className="text-xl font-semibold mb-2">My Ads</h3>
          <p>View and manage your ads here.</p>
          <button
            onClick={() => navigate('/ads')}
            className="mt-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
          >
            View Ads
          </button>
        </div>

        {/* My Offers */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <h3 className="text-xl font-semibold mb-2">My Offers</h3>
          <p>Track your offers and purchases.</p>
          <button
            onClick={() => navigate('/offers')}
            className="mt-2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
          >
            View Offers
          </button>
        </div>

        {/* My Payments */}
        <div className="bg-white p-4 rounded-md shadow-md">
          <h3 className="text-xl font-semibold mb-2">My Payments</h3>
          <p>Manage your payment methods and balances.</p>
          <button
            onClick={() => navigate('/payments')}
            className="mt-2 bg-yellow-500 text-white p-2 rounded-md hover:bg-yellow-600"
          >
            Manage Payments
          </button>
        </div>

        {/* Add New Ad (Hidden for buyers) */}
        {!userEmail.includes('buyer') && (
          <div className="bg-white p-4 rounded-md shadow-md">
            <h3 className="text-xl font-semibold mb-2">Add New Ad</h3>
            <p>Want to sell a vehicle? Create a new ad here.</p>
            <button
              onClick={() => navigate('/ads/create')}
              className="mt-2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
            >
              Add Ad
            </button>
          </div>
        )}
      </div>

      {/* Logout Button */}
      <button
        onClick={() => {
          localStorage.removeItem('user');
          navigate('/login');
        }}
        className="mt-6 bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
