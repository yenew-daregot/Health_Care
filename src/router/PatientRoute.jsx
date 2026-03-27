// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const PatientRoute = ({ children }) => {
//   const { isAuthenticated, user } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (user?.role !== 'PATIENT') {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default PatientRoute;