// import { useContext } from 'react';
// import { AuthContext } from '../context/AuthContext'; 

// /**
//  * Custom hook to consume the AuthContext. 
//  * Provides user, token, and login/logout functions.
//  * Throws an error if used outside of the AuthProvider.
//  */
// export const useAuth = () => {
//   const context = useContext(AuthContext);
  
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
  
//   return context;
// };

// // This hook is used in ProtectedRoute and login/logout components.