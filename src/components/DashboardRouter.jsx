import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectCurrentUser } from '../features/auth/authSlice';
import { USER_ROLES } from '../constants/userRoles';
import AdminDashboard from '../pages/AdminDashboard';
import ClientDashboard from '../pages/ClientDashboard';
import StaffDashboard from '@/pages/StaffDashboard';

const DashboardRouter = () => {
  const user = useSelector(selectCurrentUser);
  
  // If no user, redirect to login (shouldn't happen with AuthGuard, but just in case)
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Directly render the appropriate dashboard based on role_id
  switch(user.role_id) {
    case USER_ROLES.ADMIN: // '1'
      return <AdminDashboard />;
    case USER_ROLES.STAFF: // '2'
      return <StaffDashboard />;
    case USER_ROLES.CLIENT: // '3'
      return <ClientDashboard />;
    default:
      // If role is undefined or unknown, redirect to login
      console.error('Unknown user role:', user.role_id);
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRouter;
