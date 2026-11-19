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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('travora_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem('travora_token');
    return t && t !== 'demo_token' ? t : null;
  });

  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('travora_token');
      // Clean up legacy demo token if present
      if (storedToken === 'demo_token') {
        localStorage.removeItem('travora_token');
        localStorage.removeItem('travora_user');
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      if (storedToken) {
        try {
          const profile = await authAPI.me();
          setUser(profile);
          localStorage.setItem('travora_user', JSON.stringify(profile));
          setToken(storedToken);
        } catch (e) {
          localStorage.removeItem('travora_token');
          localStorage.removeItem('travora_user');
          setUser(null);
          setToken(null);
        }
      } else {
        setUser(null);
        setToken(null);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const data = await authAPI.login({ email, password: pass });
      localStorage.setItem('travora_token', data.access_token);
      localStorage.setItem('travora_user', JSON.stringify(data.user));
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
      localStorage.setItem('travora_user', JSON.stringify(data.user));
      setToken(data.access_token);
      setUser(data.user);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('travora_token');
    localStorage.removeItem('travora_user');
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
