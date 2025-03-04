import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Ads = () => {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get('http://localhost:3000/ads');
        setAds(response.data);
      } catch (error) {
        console.error('Error fetching ads:', error.message);
      }
    };
    fetchAds();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Available Ads</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ads.map((ad) => (
          <div key={ad.listing_id} className="p-4 bg-white rounded shadow">
            <h3 className="font-bold">{ad.title}</h3>
            <p>Make: {ad.make}</p>
            <p>Price: ${ad.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Ads;
