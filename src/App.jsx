import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from './features/auth/authSlice';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardRouter from './components/DashboardRouter';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AmazonCallback from './pages/AmazonCallback';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup />
            }
          />
          
          {/* Protected routes - Main dashboard router */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />
          
          {/* Individual dashboard routes for direct navigation */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                {user?.role_id === '1' ? <AdminDashboard /> : <Navigate to="/dashboard" replace />}
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/staff-dashboard"
            element={
              <ProtectedRoute>
                {user?.role_id === '2' ? <StaffDashboard /> : <Navigate to="/dashboard" replace />}
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute>
                {user?.role_id === '3' ? <ClientDashboard /> : <Navigate to="/dashboard" replace />}
              </ProtectedRoute>
            }
          />
          
          {/* Amazon OAuth Callback Route */}
          <Route
            path="/amazon-callback"
            element={<AmazonCallback />}
          />
          
          {/* Default redirect */}
          <Route
            path="/"
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            }
          />
          
          {/* 404 catch-all */}
          <Route 
            path="*" 
            element={
              <div className="not-found">
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;