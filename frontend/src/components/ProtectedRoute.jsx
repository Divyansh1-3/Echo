import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center text-outline gap-space-sm">
        <div className="w-8 h-8 rounded-full border-2 border-primary-container border-t-transparent animate-spin"></div>
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
          Verifying session...
        </span>
      </div>
    );
  }

  // If Supabase is configured and there's no user, redirect to /login
  if (isConfigured && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
