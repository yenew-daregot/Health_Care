import React, { createContext, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();

  // Role checks based on current user
  const isPatient = user?.role === 'PATIENT';
  const isDoctor = user?.role === 'DOCTOR';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <RoleContext.Provider value={{
      userRole: user?.role || '',
      isPatient,
      isDoctor,
      isAdmin,
      isAuthenticated: !!user
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};