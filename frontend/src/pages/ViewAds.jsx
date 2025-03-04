import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ViewAds = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    make: '',
    price_min: '',
    price_max: ''
  });

  const navigate = useNavigate();
  
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/ads', { params: filters });
      setAds(response.data);
    } catch (err) {
      setError('Failed to fetch ads');
      console.error('❌ Error fetching ads:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const handleApplyFilters = () => {
    fetchAds();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h2 className="text-3xl font-bold text-center mb-6">Available Ads</h2>

      {/* Filters */}
      <div className="bg-white p-4 rounded-md shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-2">Filter Ads</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            name="make"
            placeholder="Make"
            value={filters.make}
            onChange={handleFilterChange}
            className="p-2 border rounded-md"
          />
          <input
            type="number"
            name="price_min"
            placeholder="Min Price"
            value={filters.price_min}
            onChange={handleFilterChange}
            className="p-2 border rounded-md"
          />
          <input
            type="number"
            name="price_max"
            placeholder="Max Price"
            value={filters.price_max}
            onChange={handleFilterChange}
            className="p-2 border rounded-md"
          />
        </div>
        <button
          onClick={handleApplyFilters}
          className="mt-4 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
        >
          Apply Filters
        </button>
      </div>

      {/* Loading State */}
      {loading && <p className="text-center">Loading ads...</p>}

      {/* Error State */}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Ads List */}
      {!loading && !error && ads.length === 0 && (
        <p className="text-center">No ads found matching your criteria.</p>
      )}

      {!loading && !error && ads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.listing_id} className="bg-white p-4 rounded-md shadow-md">
              <h3 className="text-xl font-bold mb-2">{ad.title}</h3>
              <p><strong>Make:</strong> {ad.make}</p>
              <p><strong>Price:</strong> ${ad.price}</p>
              <p><strong>Status:</strong> {ad.status}</p>
              <button
                onClick={() => navigate(`/ads/${ad.listing_id}`)}
                className="mt-2 bg-green-500 text-white p-2 rounded-md hover:bg-green-600"
                >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewAds;
