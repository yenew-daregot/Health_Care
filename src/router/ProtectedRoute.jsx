import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();
  
  console.log('🔒 [PROTECTED ROUTE]', {
    isAuthenticated,
    userRole: user?.role,
    userRaw: user?._raw,
    allowedRoles: roles,
    loading,
    path: location.pathname
  });
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('🔒 [PROTECTED ROUTE] Not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If roles are specified, check if user has required role
  if (roles.length > 0 && user?.role) {
    const userRole = user.role.toUpperCase();
    const hasRole = roles.some(requiredRole => 
      userRole === requiredRole.toUpperCase()
    );
    
    if (!hasRole) {
      console.log('🚫 [PROTECTED ROUTE] Insufficient role:', {
        userRole,
        requiredRoles: roles
      });
      
      // Redirect to role-appropriate dashboard
      const roleRedirects = {
        'ADMIN': '/admin/dashboard',
        'DOCTOR': '/doctor/dashboard',
        'PATIENT': '/patient/dashboard',
      
      };
      
      const redirectPath = roleRedirects[userRole] || '/dashboard';
      
      return <Navigate to={redirectPath} replace />;
    }
  }
  
  return children;
};

export default ProtectedRoute;