import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FeedPage from './pages/FeedPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/feed" replace />} />
      <Route path="/feed" element={<FeedPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route path="/profile/id/:userId" element={<ProfilePage />} />
      <Route path="*" element={<Navigate to="/feed" replace />} />
    </Routes>
  );
}
