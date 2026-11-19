import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../services/types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'user_demo_123',
    name: 'Dr. Anusha Chhabra',
    email: 'demo@travora.ai',
    saved_trips_count: 3
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('travora_token') || 'demo_token');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('travora_token');
      if (storedToken) {
        try {
          const profile = await authAPI.me();
          setUser(profile);
        } catch (e) {
          console.warn('Using demo user fallback');
        }
      }
    };
    fetchUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const data = await authAPI.login({ email, password: pass });
      localStorage.setItem('travora_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const data = await authAPI.register({ name, email, password: pass });
      localStorage.setItem('travora_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('travora_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

