import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Payments = () => {
    const [balance, setBalance] = useState(0);
    const [offers, setOffers] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const user = JSON.parse(localStorage.getItem('user')) || {};
    const userId = user?.id || user?.user_id;

    useEffect(() => {
        fetchBalance();
        fetchAcceptedOffers();
        fetchPaymentHistory();
    }, []);

    const fetchBalance = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/payments/balance?user_id=${userId}`);
            setBalance(response.data.balance);
        } catch (err) {
            console.error('❌ Error fetching balance:', err.message);
            setError('Failed to fetch balance');
        }
    };

    const fetchAcceptedOffers = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/payments/offers?user_id=${userId}`);
            setOffers(response.data);
        } catch (err) {
            console.error('❌ Error fetching offers:', err.message);
            setError('Failed to fetch offers');
        }
    };

    const fetchPaymentHistory = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/payments/history?user_id=${userId}`);
            setPaymentHistory(response.data);
        } catch (err) {
            console.error('❌ Error fetching payment history:', err.message);
            setError('Failed to fetch payment history');
        }
    };

    const handlePayment = async (offerId) => {
        try {
            if (!offerId || !userId) {
                throw new Error('Missing required data for payment');
            }
    
            const response = await axios.post('http://localhost:3000/payments/pay', {
                offer_id: offerId,
                user_id: userId,
                payment_method: 'balance'
            });
    
            if (response.data.status === 'paid') {
                alert('Payment successful');
                fetchAcceptedOffers(); // Refresh offers
                fetchBalance(); // Refresh balance
                fetchPaymentHistory(); // Refresh payment history
            } else {
                throw new Error('Payment failed unexpectedly');
            }
        } catch (err) {
            console.error('❌ Error processing payment:', err.response?.data?.error || err.message);
            alert(`Payment failed: ${err.response?.data?.error || err.message}`);
        }
    };
    
    
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h2 className="text-3xl font-bold text-center mb-6">My Payments</h2>
            
            <div className="mb-6 p-4 bg-white rounded-md shadow-md">
                <h3 className="text-xl font-bold">Balance: ${balance}</h3>
            </div>

            <h3 className="text-2xl font-bold mb-4">Accepted Offers</h3>
            {offers.map((offer) => (
                <div key={offer.offer_id} className="p-4 mb-4 bg-white rounded-md shadow-md flex justify-between">
                    <div>
                        <p><strong>{offer.ad_title}</strong></p>
                        <p>Amount: ${offer.amount}</p>
                        <p>Status: {offer.status}</p>
                    </div>
                    <button
                        onClick={() => handlePayment(offer.offer_id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-md"
                    >
                        Pay Now
                    </button>
                </div>
            ))}

            <h3 className="text-2xl font-bold mt-6 mb-4">Payment History</h3>
            {paymentHistory.map((payment) => (
                <div key={payment.transaction_id} className="p-4 mb-4 bg-white rounded-md shadow-md">
                    <p><strong>Amount:</strong> ${payment.amount}</p>
                    <p><strong>Date:</strong> {payment.transaction_date}</p>
                </div>
            ))}
        </div>
    );
};

export default Payments;
