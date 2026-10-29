import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  switchRole: (role: Role) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mentor_connect_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('mentor_connect_token')) {
        // default to mentee demo if nothing stored
        const res = await api.switchDemo('mentee');
        localStorage.setItem('mentor_connect_token', res.token);
        setToken(res.token);
        setUser(res.user);
      } else {
        const res = await api.getMe();
        setUser(res.user);
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Failed to restore session, falling back to demo', err);
      try {
        const res = await api.switchDemo('mentee');
        localStorage.setItem('mentor_connect_token', res.token);
        setToken(res.token);
        setUser(res.user);
      } catch (e) {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      localStorage.setItem('mentor_connect_token', res.token);
      setToken(res.token);
      setUser(res.user);
      const me = await api.getMe();
      setProfile(me.profile);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      localStorage.setItem('mentor_connect_token', res.token);
      setToken(res.token);
      setUser(res.user);
      const me = await api.getMe();
      setProfile(me.profile);
    } finally {
      setLoading(false);
    }
  };

  const switchRole = async (role: Role) => {
    setLoading(true);
    try {
      const res = await api.switchDemo(role);
      localStorage.setItem('mentor_connect_token', res.token);
      setToken(res.token);
      setUser(res.user);
      const me = await api.getMe();
      setProfile(me.profile);
    } catch (err) {
      console.error('Role switch failed', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mentor_connect_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const refreshUser = async () => {
    if (localStorage.getItem('mentor_connect_token')) {
      const me = await api.getMe();
      setUser(me.user);
      setProfile(me.profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        login,
        register,
        switchRole,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
