// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

// const DoctorRoute = ({ children }) => {
//   const { isAuthenticated, user } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (user?.role !== 'DOCTOR') {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return children;
// };

// export default DoctorRoute;