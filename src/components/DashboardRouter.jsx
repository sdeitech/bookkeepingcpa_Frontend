import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { selectCurrentUser } from '../features/auth/authSlice';
import AdminDashboard from '../pages/AdminDashboard';
import StaffDashboard from '../pages/StaffDashboard';
import ClientDashboard from '../pages/ClientDashboard';

const DashboardRouter = () => {
  const user = useSelector(selectCurrentUser);
  
  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Route based on role_id
  switch(user.role_id) {
    case '1': // Super Admin
      return <AdminDashboard />;
    case '2': // Staff
      return <StaffDashboard />;
    case '3': // Client
      return <ClientDashboard />;
    default:
      // If role is undefined or unknown, default to client dashboard
      return <ClientDashboard />;
  }
};

export default DashboardRouter;