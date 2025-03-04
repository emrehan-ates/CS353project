import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user details from localStorage
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const userId = user?.user_id;
  let userRole = user?.role;

  // Map 'user' role to 'buyer'
  if (userRole === 'user') {
    userRole = 'buyer';
  }

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      let response;

      if (userRole === 'buyer') {
        response = await axios.get(`http://localhost:3000/offers/buyer?buyer_id=${userId}`);
      } else if (userRole === 'seller') {
        response = await axios.get(`http://localhost:3000/offers/seller?seller_id=${userId}`);
      } else {
        throw new Error('Invalid user role');
      }

      console.log('API Response:', response);

      // Validate response structure
      if (response?.data?.data && Array.isArray(response.data.data)) {
        setOffers(response.data.data);
        setError(null);
      } else {
        console.warn('Unexpected API response structure:', response);
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('❌ Error fetching offers:', err.message || err);
      setError('Failed to fetch offers. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    if (!userId || !userRole) {
      console.error('User ID or role is missing in localStorage:', user);
      setError('User is not logged in or user details are missing.');
      setLoading(false);
      return;
    }

    fetchOffers();
  }, [fetchOffers, userId, userRole]);

  const handleStatusUpdate = async (offerId, status) => {
    try {
      await axios.post('http://localhost:3000/offers/update-status', {
        offer_id: offerId,
        status,
      });
      fetchOffers(); // Refresh offers
    } catch (err) {
      console.error('❌ Error updating offer status:', err.message || err);
      alert('Failed to update offer status');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-center mb-6">My Offers</h2>

      {/* Loading and Error States */}
      {loading && <p className="text-center">Loading offers...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Offers List */}
      {!loading && !error && offers.length === 0 && (
        <p className="text-center">No offers available.</p>
      )}

      {!loading && !error && offers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <div key={offer.offer_id} className="bg-white p-4 rounded-md shadow-md">
              <h3 className="text-xl font-bold mb-2">{offer.ad_title || 'No Title'}</h3>
              <p><strong>Amount:</strong> ${offer.amount || 0}</p>
              <p><strong>Status:</strong> {offer.status || 'Pending'}</p>
              
              {userRole === 'seller' && offer.status === 'pending' && (
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleStatusUpdate(offer.offer_id, 'accepted')}
                    className="bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(offer.offer_id, 'rejected')}
                    className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Offers;
