import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated, selectCurrentUser, selectIsOnboardingCompleted } from './features/auth/authSlice';
import { initializeFirebase } from './config/firebase';
import { USER_ROLES, isClient } from './constants/userRoles';

// Route Guards
import AuthGuard from './components/guards/AuthGuard';
import RoleGuard from './components/guards/RoleGuard';
import OnboardingGuard from './components/guards/OnboardingGuard';
import SubscriptionGuard from './components/guards/SubscriptionGuard';
import PublicRoute from './components/guards/PublicRoute';

// Regular imports (not lazy) to avoid UI issues
import Login from './pages/Login';
import Signup from './pages/Signup';
import Questionnaire from './pages/Questionnaire';
import DashboardRouter from './components/DashboardRouter';
import OnboardingWizard from './components/Onboarding/OnboardingWizard';
import PricingCheckout from './components/Stripe/PricingCheckout/PricingCheckout';
import SubscriptionManagement from './components/Stripe/SubscriptionManagement/SubscriptionManagement';
import SubscriptionPlanManager from './components/Admin/SubscriptionPlanManager/SubscriptionPlanManager';
import AmazonCallback from './pages/AmazonCallback';
import ShopifyCallback from './pages/ShopifyCallback';
import QuickBooksCallback from './pages/QuickBooksCallback';

// Import Firebase utilities
import './utils/testFirebaseConnection';
import './utils/debugFirebaseConnection';

import './App.css';
import Dashboard from './pages/Dashboard';
import QuickBooksData from './pages/dashboard/QuickBooksData';
import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminLayout from './pages/admin/AdminLayout';
// import AdminTasks from './pages/admin/AdminTasks';
// import AdminClients from './pages/admin/AdminClients';
// import AdminClientDetail from './pages/admin/AdminClientDetail';
import StaffLayout from './pages/staff/StaffLayout';
import StaffClients from './pages/staff/StaffClients';
import StaffClientDetail from './pages/staff/StaffClientDetail';
import StaffTasks from './pages/staff/StaffTasks';
import StaffReports from './pages/staff/StaffReports';
import StaffCreateTask from './pages/staff/StaffCreateTask';

// new admin layout and pages
import AdminLayout from './pages/new_Admin/AdminLayout';
import AdminDashboardHome from './pages/new_Admin/AdminDashboardHome';
import AdminStaff from './pages/new_Admin/AdminStaff';
import AdminDocuments from './pages/new_Admin/AdminDocuments';
import AdminMessages from './pages/new_Admin/AdminMessages';
import AdminSettings from './pages/new_Admin/AdminSettings';
import AdminTasks from './pages/new_Admin/AdminTasks';
import AdminClients from './pages/new_Admin/AdminClients';
import AdminClientDetail from './pages/new_Admin/AdminClientDetail';
import AdminTaskDetail from './pages/new_Admin/AdminTaskDetail';
import { Profile } from './components/common/profile';
import AdminAssignClients from './pages/new_Admin/AdminAssignClients';
import ErrorBoundary from './components/common/ErrorBoundary';


// import Questionnaire from './pages/questionnaire/Questionnaire';

// Simple redirect helper
const getDefaultRedirect = (user, isAuth, isOnboarded) => {
  if (!isAuth) return '/login';
  if (isClient(user) && !isOnboarded) return '/onboarding';
  return '/dashboard';
};

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectCurrentUser);
  const isOnboardingCompleted = useSelector(selectIsOnboardingCompleted);

  // Initialize Firebase once
  React.useEffect(() => {
    initializeFirebase();
    console.log('🔥 Firebase initialized');

    if (import.meta.env.VITE_ENV === 'development') {
      console.group('🔧 Environment Variables');
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('Environment:', import.meta.env.VITE_ENV);
      console.log('App Name:', import.meta.env.VITE_APP_NAME);
      console.log('Features:', {
        stripe: import.meta.env.VITE_ENABLE_STRIPE === 'true',
        amazon: import.meta.env.VITE_ENABLE_AMAZON === 'true',
        walmart: import.meta.env.VITE_ENABLE_WALMART === 'true',
        onboarding: import.meta.env.VITE_ENABLE_ONBOARDING === 'true'
      });
      console.groupEnd();
    }
  }, []);

  const defaultRedirect = getDefaultRedirect(user, isAuthenticated, isOnboardingCompleted);

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* ============ Public Routes ============ */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/new-dashboard"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[USER_ROLES.CLIENT]}>
                  <Dashboard />
                </RoleGuard>
              </AuthGuard>
            }
          >
            <Route path="quickbooks" element={<QuickBooksData />} />
            <Route path="profile" element={<Profile />} />
          </Route>


          {/* <Route path="/adminDashboard" element={
            <AuthGuard>
              <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminLayout />
              </RoleGuard>
            </AuthGuard>
          }>
            <Route path="" element={<AdminDashboard />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="clients/:clientId" element={<AdminClientDetail />} />
          </Route> */}

          <Route path="/admin" element={
            <AuthGuard>
              <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
                <AdminLayout />
              </RoleGuard>
            </AuthGuard>
          }>
            <Route index element={<AdminDashboardHome />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="tasks/:taskId" element={
              <ErrorBoundary fallbackMessage="Unable to load task details. The task may not exist or there was an error loading it." showHomeButton>
                <AdminTaskDetail />
              </ErrorBoundary>
            } />
            <Route path="clients" element={<AdminAssignClients/>} />
            <Route path="assign-clients" element={<AdminAssignClients />} />
            <Route path="clients/:clientId" element={<AdminClientDetail />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="documents" element={<AdminDocuments />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path='profile' element={<Profile/>} />
          </Route>


          <Route path="/staff" element={
            <AuthGuard>
              <RoleGuard allowedRoles={[USER_ROLES.STAFF]}>
                <StaffLayout />
              </RoleGuard>
            </AuthGuard>
          }>
            <Route path="clients" element={<StaffClients />} />
            <Route path="clients/:clientId" element={<StaffClientDetail />} />
            <Route path="tasks" element={<StaffTasks />} />
            <Route path="reports" element={<StaffReports />} />
            <Route path="create-task" element={<StaffCreateTask />} />
            <Route path="profile" element={<Profile />} />
          </Route>




          {/* Pricing is public but checkout requires auth */}
          <Route path="/pricing" element={<PricingCheckout />} />

          {/* Questionnaire - Public route for pre-payment flow */}
          <Route path="/questionnaire" element={<Questionnaire />} />

          {/* OAuth callbacks */}
          <Route path="/amazon-callback" element={<AmazonCallback />} />
          <Route path="/shopify-callback" element={<ShopifyCallback />} />
          <Route path="/quickbooks-callback" element={<QuickBooksCallback />} />

          {/* ============ Protected Routes ============ */}

          {/* Onboarding - Client only, blocks if completed */}
          <Route
            path="/onboarding"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[USER_ROLES.CLIENT]}>
                  <OnboardingGuard requireIncomplete>
                    <OnboardingWizard />
                  </OnboardingGuard>
                </RoleGuard>
              </AuthGuard>
            }
          />

          {/* Subscription Management - Clients and Admins */}
          <Route
            path="/subscription"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[USER_ROLES.CLIENT, USER_ROLES.ADMIN]}>
                  <SubscriptionManagement />
                </RoleGuard>
              </AuthGuard>
            }
          />

          {/* Admin Plan Management */}
          <Route
            path="/admin/plans"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={[USER_ROLES.ADMIN]}>
                  <SubscriptionPlanManager />
                </RoleGuard>
              </AuthGuard>
            }
          />

          {/* Main dashboard - DashboardRouter handles role-based rendering */}
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <OnboardingGuard>
                  <SubscriptionGuard>
                    <DashboardRouter />
                  </SubscriptionGuard>
                </OnboardingGuard>
              </AuthGuard>
            }
          />

          {/* ============ Default Routes ============ */}

          {/* Default redirect */}
          <Route
            path="/"
            element={<Navigate to={defaultRedirect} replace />}
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