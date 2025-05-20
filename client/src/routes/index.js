// client/src/routes/index.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../utils/ProtectedRoute';

// Import pages
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import AdminSignup from '../pages/auth/AdminSignup';
import MainPlayer from '../pages/player/MainPlayer';
import MainAdmin from '../pages/admin/MainAdmin';
import ResultsAdmin from '../pages/admin/ResultsAdmin';
import LivePage from '../pages/LivePage';

const AppRoutes = ({ user, loading, onLogin }) => {
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={!user ? <Login onLogin={onLogin} /> : <Navigate to={user.isAdmin ? '/admin' : '/player'} />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to={user.isAdmin ? '/admin' : '/player'} />} />
      <Route path="/admin-signup" element={!user ? <AdminSignup /> : <Navigate to='/admin' />} />

      {/* Protected routes */}
      <Route path="/player" element={
        <ProtectedRoute user={user} adminOnly={false}>
          <MainPlayer />
        </ProtectedRoute>
      } />
      
      <Route path="/admin" element={
        <ProtectedRoute user={user} adminOnly={true}>
          <MainAdmin />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/results" element={
        <ProtectedRoute user={user} adminOnly={true}>
          <ResultsAdmin />
        </ProtectedRoute>
      } />
      
      <Route path="/live" element={
        <ProtectedRoute user={user}>
          <LivePage />
        </ProtectedRoute>
      } />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to={user ? (user.isAdmin ? '/admin' : '/player') : '/login'} />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;