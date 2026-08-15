'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { me, login as apiLogin, type User } from './api/auth';
import { getToken, setToken } from './api/client';
import { disconnectSocket } from './socket';

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (u: User) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => undefined,
  logout: () => undefined,
  setUser: () => undefined,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    me()
      .then(({ user }) => setUser(user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { token, user } = await apiLogin(email, password);
      setToken(token);
      setUser(user);
      router.push('/dashboard');
    },
    [router]
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    disconnectSocket();
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
