import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-blue-600 tracking-tight">
            ExpenseTracker
          </span>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600 transition-colors'
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/expenses"
              className={({ isActive }) =>
                isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600 transition-colors'
              }
            >
              Expenses
            </NavLink>
          </nav>

          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500 hidden md:inline">
              {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-500 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
