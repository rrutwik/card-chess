import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  console.log('🔒 ProtectedRoute: Checking auth state:', {
    isAuthenticated,
    isLoading,
    user,
    currentPath: location.pathname,
    hasUser: !!user,
    userId: user?._id
  });

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    console.log('🚫 ProtectedRoute: User not authenticated, redirecting to login');
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ ProtectedRoute: User authenticated, rendering protected content');
  return <>{children}</>;
};
