import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import CreateAd from './components/CreateAd'; // Import CreateAd component
import ViewAds from './pages/ViewAds';
import AdDetails from './pages/AdDetails';
import Offers from './components/Offers';
import Payments from './components/Payments';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));
  const isAuthenticated = user !== null;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* User Dashboard Route */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated && user.role !== 'admin' ? (
              <Dashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Admin Dashboard Route */}
        <Route
          path="/admin/dashboard"
          element={
            isAuthenticated && user.role === 'admin' ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Create Ad Route */}
        <Route
          path="/create-ad"
          element={
            isAuthenticated ? (
              <CreateAd />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/ads/create" element={<CreateAd />} />
        <Route path="/ads" element={<ViewAds />} />
        <Route path="/ads/:id" element={<AdDetails />} />
        <Route path="/offers" element={<Offers />} /> 
        <Route path="/payments" element={<Payments />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
