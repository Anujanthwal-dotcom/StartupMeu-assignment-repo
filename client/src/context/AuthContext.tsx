import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getMe } from '../services/auth';
import type { AuthUser } from '../services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: if a token exists, rehydrate the current user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then((u) => setUser(u))
      .catch(() => {
        // Token invalid / expired — clean up
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token: string, u: AuthUser) {
    localStorage.setItem('token', token);
    setUser(u);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
