import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getCurrentUser, loginUser, registerUser } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const accessToken = localStorage.getItem('accessToken');

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      setUser(null);
      setIsAuthLoading(false);
      return;
    }

    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async ({ login, password }) => {
    const tokens = await loginUser({
      login,
      password,
    });

    localStorage.setItem('accessToken', tokens.access_token);
    localStorage.setItem('refreshToken', tokens.refresh_token);

    const currentUser = await getCurrentUser();
    setUser(currentUser);

    return currentUser;
  }, []);

  const register = useCallback(async (payload) => {
    return registerUser(payload);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && accessToken),
      isAuthLoading,
      login,
      register,
      logout,
      reloadUser: loadUser,
    }),
    [
      user,
      accessToken,
      isAuthLoading,
      login,
      register,
      logout,
      loadUser,
    ],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}