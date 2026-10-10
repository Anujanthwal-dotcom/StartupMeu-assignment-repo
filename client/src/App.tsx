import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages (stubbed — will be filled in later tasks)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import Layout from './components/Layout';

/** Redirect to /login if not authenticated */
function RequireAuth() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-gray-500">Loading…</span>
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

/** Redirect to /dashboard if already authenticated */
function GuestOnly() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Guest-only routes */}
        <Route element={<GuestOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected routes wrapped in the shared Layout */}
        <Route element={<RequireAuth />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
