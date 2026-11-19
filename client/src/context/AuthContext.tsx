import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';
import { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  demoLogin: (role: Role) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
  isDonor: boolean;
  isNgo: boolean;
  isVolunteer: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('sharebite_token');
    const savedUser = localStorage.getItem('sharebite_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to parse saved user', e);
        localStorage.removeItem('sharebite_token');
        localStorage.removeItem('sharebite_user');
      }
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (data: any): User => {
    const loggedUser: User = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
      verificationStatus: data.verificationStatus,
      organisationId: data.organisationId,
      organisationName: data.organisationName,
    };

    setToken(data.token);
    setUser(loggedUser);
    localStorage.setItem('sharebite_token', data.token);
    localStorage.setItem('sharebite_user', JSON.stringify(loggedUser));
    return loggedUser;
  };

  const login = async (email: string, password: string): Promise<User> => {
    const response = await api.post('/auth/login', { email, password });
    return handleAuthSuccess(response.data);
  };

  const demoLogin = async (role: Role): Promise<User> => {
    const response = await api.post(`/auth/demo-login/${role}`);
    return handleAuthSuccess(response.data);
  };

  const register = async (data: any): Promise<User> => {
    const response = await api.post('/auth/register', data);
    return handleAuthSuccess(response.data);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('sharebite_token');
    localStorage.removeItem('sharebite_user');
  };

  const refreshProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const updatedUser: User = {
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        role: response.data.role,
        phone: response.data.phone,
        verificationStatus: response.data.verificationStatus,
        organisationId: response.data.organisationId,
        organisationName: response.data.organisationName,
      };
      setUser(updatedUser);
      localStorage.setItem('sharebite_user', JSON.stringify(updatedUser));
    } catch (e) {
      console.warn('Could not refresh profile', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        demoLogin,
        register,
        logout,
        refreshProfile,
        isAuthenticated: !!user,
        isDonor: user?.role === 'DONOR',
        isNgo: user?.role === 'NGO',
        isVolunteer: user?.role === 'VOLUNTEER',
        isAdmin: user?.role === 'ADMIN',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
