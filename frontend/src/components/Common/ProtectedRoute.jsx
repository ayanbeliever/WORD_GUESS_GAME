import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUser } from '../../services/api.jsx';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const user = getUser();

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if admin access is required
  if (requireAdmin && !user.is_admin) {
    return <Navigate to="/game" replace />;
  }

  return children;
};

export default ProtectedRoute;
