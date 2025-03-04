import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AdDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [adDetails, setAdDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerPrice, setOfferPrice] = useState('');

  const fetchAdDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/ads/${id}`);
      setAdDetails(response.data);
      setError(null);
    } catch (error) {
      console.error('❌ Error fetching ad details:', error.message || error);
      setError('Failed to fetch ad details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdDetails();
  }, [id]);

  const handleMakeOffer = async () => {
    const user = JSON.parse(localStorage.getItem('user')) || {};
    const buyer_id = user.user_id;

    if (!offerPrice || isNaN(offerPrice) || offerPrice <= 0) {
      alert('Please enter a valid offer price.');
      return;
    }

    try {
      await axios.post('http://localhost:3000/offers/make', {
        ad_id: id,
        buyer_id,
        offer_price: offerPrice,
      });
      alert('Offer made successfully!');
      setShowOfferModal(false);
    } catch (error) {
      console.error('❌ Error making offer:', error.response?.data || error.message);
      alert('Failed to make an offer.');
    }
  };

  if (loading) return <p className="text-center">Loading ad details...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!adDetails) return <p className="text-center text-gray-500">No ad details available.</p>;

  // Check if user is a seller
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isSeller = user?.email?.includes('seller');

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h2 className="text-3xl font-bold mb-4">Ad Details</h2>
      <div className="bg-white p-6 rounded-md shadow-md">
        {/* Ad Details */}
        <p><strong>Make:</strong> {adDetails.make}</p>
        <p><strong>Year:</strong> {adDetails.year}</p>
        <p><strong>Mileage:</strong> {adDetails.mileage} km</p>
        <p><strong>Price:</strong> ${adDetails.price}</p>
        <p><strong>Color:</strong> {adDetails.color}</p>
        <p><strong>Condition:</strong> {adDetails.condition}</p>
        <p><strong>Transmission:</strong> {adDetails.transmission}</p>
        <p><strong>Status:</strong> {adDetails.status}</p>
        <p><strong>Description:</strong> {adDetails.description}</p>

        {/* Images Section */}
        {adDetails.images?.length > 0 && (
          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">Images</h3>
            <div className="grid grid-cols-2 gap-4">
              {adDetails.images.map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:3000/${image}`}
                  alt={`Ad Image ${index + 1}`}
                  className="w-full h-40 object-cover rounded-md"
                />
              ))}
            </div>
          </div>
        )}

        {/* Expert Report Section */}
        {adDetails.expert_report && (
          <div className="mt-4">
            <h3 className="text-xl font-bold mb-2">Expert Report</h3>
            <a
              href={`http://localhost:3000${adDetails.expert_report}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline"
            >
              Download Expert Report
            </a>
          </div>
        )}

        <div className="mt-4 flex space-x-4">
          <button onClick={() => navigate('/ads')} className="bg-blue-500 text-white px-4 py-2 rounded-md">
            Back to Ads
          </button>
          {/* Conditionally render "Make Offer" button if not a seller */}
          {!isSeller && (
            <button onClick={() => setShowOfferModal(true)} className="bg-green-500 text-white px-4 py-2 rounded-md">
              Make Offer
            </button>
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-md shadow-md w-96">
            <h3 className="text-xl font-bold mb-4">Make an Offer</h3>
            <input
              type="number"
              placeholder="Enter your offer price"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowOfferModal(false)} className="bg-gray-300 px-4 py-2 rounded-md">
                Cancel
              </button>
              <button onClick={handleMakeOffer} className="bg-green-500 text-white px-4 py-2 rounded-md">
                Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdDetails;
