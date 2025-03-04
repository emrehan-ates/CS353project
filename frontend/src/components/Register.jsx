import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [userType, setUserType] = useState('buyer');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    forename: '',
    surname: '',
    notification_preference: 'yes',
    city: '',
    province: '',
    district: '',
    street: '',
    postal_code: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRegister = async () => {
    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        userType,
        forename: formData.forename,
        surname: formData.surname,
        notification_preference: formData.notification_preference,
        ...(userType === 'seller' && {
          city: formData.city,
          province: formData.province,
          district: formData.district,
          street: formData.street,
          postal_code: formData.postal_code,
        }),
      };

      await axios.post('http://localhost:3000/auth/register', payload);
      alert('Registration successful!');
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
      alert('Registration failed!');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <select
          name="userType"
          className="w-full p-2 mb-4 border border-gray-300 rounded"
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
        >
          <option value="buyer">Buyer</option>
          <option value="seller">Seller</option>
        </select>

        {/* Common Fields */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded"
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded"
          onChange={handleChange}
        />
        <input
          type="text"
          name="forename"
          placeholder="Forename"
          className="w-full p-2 mb-4 border rounded"
          onChange={handleChange}
        />
        <input
          type="text"
          name="surname"
          placeholder="Surname"
          className="w-full p-2 mb-4 border rounded"
          onChange={handleChange}
        />

        {/* Seller-Specific Fields */}
        {userType === 'seller' && (
          <>
            <input
              type="text"
              name="city"
              placeholder="City"
              className="w-full p-2 mb-4 border rounded"
              onChange={handleChange}
            />
            <input
              type="text"
              name="province"
              placeholder="Province"
              className="w-full p-2 mb-4 border rounded"
              onChange={handleChange}
            />
            <input
              type="text"
              name="district"
              placeholder="District"
              className="w-full p-2 mb-4 border rounded"
              onChange={handleChange}
            />
            <input
              type="text"
              name="street"
              placeholder="Street"
              className="w-full p-2 mb-4 border rounded"
              onChange={handleChange}
            />
            <input
              type="number"
              name="postal_code"
              placeholder="Postal Code"
              className="w-full p-2 mb-4 border rounded"
              onChange={handleChange}
            />
          </>
        )}

        <button
          onClick={handleRegister}
          className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Register;
