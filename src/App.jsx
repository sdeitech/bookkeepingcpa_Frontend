import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser } from './features/auth/authSlice';
import { selectIsOnboardingCompleted } from './features/onboarding/onboardingSlice';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardRouter from './components/DashboardRouter';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AmazonCallback from './pages/AmazonCallback';
import ProtectedRoute from './components/ProtectedRoute';

// Custom hook for onboarding sync
import { useOnboardingSync } from './hooks/useOnboardingSync';

// Onboarding Components
import OnboardingWizard  from './components/Onboarding/OnboardingWizard';
import OnboardingRouteGuard from './components/Onboarding/OnboardingRouteGuard';

// Stripe Components
import PricingCheckout from './components/Stripe/PricingCheckout/PricingCheckout';
import SubscriptionManagement from './components/Stripe/SubscriptionManagement/SubscriptionManagement';
import SubscriptionPlanManager from './components/Admin/SubscriptionPlanManager/SubscriptionPlanManager';

// Subscription Protected Route Component
import { RequireSubscription } from './routes/ProtectedRoute';
import './App.css';

// Helper component to check onboarding and redirect
const RequireOnboarding = ({ children }) => {
  const isOnboardingCompleted = useSelector(selectIsOnboardingCompleted);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isOnboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return children;
};

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isOnboardingCompleted = useSelector(selectIsOnboardingCompleted);
  
  // Sync onboarding status from API to Redux
  // This ensures Redux state matches the backend truth
  const { isLoading: isLoadingOnboarding } = useOnboardingSync();
  
  // Helper to check user role
  const isAdmin = user?.role_id === '1';
  const isStaff = user?.role_id === '2';
  const isClient = user?.role_id === '3';

  // Show loading state while syncing onboarding status
  if (isAuthenticated && isClient && isLoadingOnboarding) {
    return (
      <div className="app-loading">
        <div>Loading application state...</div>
      </div>
    );
  }

  return (
    <Router>
     
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ?
                (isClient ?
                  (!isOnboardingCompleted ?
                    <Navigate to="/onboarding" replace /> :
                    <Navigate to="/dashboard" replace />
                  ) :
                  <Navigate to="/dashboard" replace />
                ) :
                <Login />
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ?
                (isClient ?
                  (!isOnboardingCompleted ?
                    <Navigate to="/onboarding" replace /> :
                    <Navigate to="/dashboard" replace />
                  ) :
                  <Navigate to="/dashboard" replace />
                ) :
                <Signup />
            }
          />
          
          {/* Onboarding Route - Protected, for clients only */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                {isClient ? (
                  <OnboardingRouteGuard>
                    <OnboardingWizard />
                  </OnboardingRouteGuard>
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </ProtectedRoute>
            }
          />
          
          {/* Stripe/Subscription Routes */}
          
          {/* Unified Pricing & Checkout - Public: anyone can view plans, checkout requires login */}
          <Route path="/pricing" element={<PricingCheckout />} />
          
          {/* Subscription Management - Protected: for users to manage their subscription */}
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <SubscriptionManagement />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Plan Management - Only Admin can access (Staff has no role in payments) */}
          <Route
            path="/admin/plans"
            element={
              <ProtectedRoute>
                {isAdmin ? (
                  <SubscriptionPlanManager />
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
              </ProtectedRoute>
            }
          />
          

          {/* Protected routes - Main dashboard router */}
          {/* Dashboard requires onboarding completion and active subscription for clients */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                {isClient ? (
                  <RequireOnboarding>
                    <RequireSubscription>
                      <DashboardRouter />
                    </RequireSubscription>
                  </RequireOnboarding>
                ) : (
                  // Admin and Staff don't need onboarding or subscription
                  <DashboardRouter />
                )}
              </ProtectedRoute>
            }
          />

          {/* Individual dashboard routes for direct navigation */}
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute>
                {isAdmin ? <AdminDashboard /> : <Navigate to="/dashboard" replace />}
              </ProtectedRoute>
            }
          />

          <Route
            path="/staff-dashboard"
            element={
              <ProtectedRoute>
                {isStaff ? <StaffDashboard /> : <Navigate to="/dashboard" replace />}
              </ProtectedRoute>
            }
          />

          <Route
            path="/client-dashboard"
            element={
              <ProtectedRoute>
                {isClient ? (
                  <RequireOnboarding>
                    <RequireSubscription>
                      <ClientDashboard />
                    </RequireSubscription>
                  </RequireOnboarding>
                ) : (
                  <Navigate to="/dashboard" replace />
                )}
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
              isAuthenticated ? (
                // For clients: check onboarding first, then subscription
                isClient ? (
                  !isOnboardingCompleted ? (
                    <Navigate to="/onboarding" replace />
                  ) : (
                    <RequireSubscription fallbackPath="/pricing">
                      <Navigate to="/dashboard" replace />
                    </RequireSubscription>
                  )
                ) : (
                  // Admin and Staff go directly to dashboard
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <Navigate to="/login" replace />
              )
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