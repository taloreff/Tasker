'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { AuthService } from '@/services/auth';
import { AuthContextType, LoginCredentials, RegisterCredentials } from '@/types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Initialize token from cookies
  useEffect(() => {
    const storedToken = Cookies.get('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  // Fetch user profile when token exists
  const { data: user, isLoading: isUserLoading } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: AuthService.getProfile,
    enabled: !!token,
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      const { access_token, user } = data;
      Cookies.set('access_token', access_token, { expires: 7 }); // 7 days
      setToken(access_token);
      queryClient.setQueryData(['user', 'profile'], user);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: AuthService.register,
    onSuccess: (data) => {
      const { access_token, user } = data;
      Cookies.set('access_token', access_token, { expires: 7 }); // 7 days
      setToken(access_token);
      queryClient.setQueryData(['user', 'profile'], user);
    },
  });

  // Logout function
  const logout = () => {
    Cookies.remove('access_token');
    setToken(null);
    queryClient.clear();
  };

  // Login function
  const login = async (credentials: LoginCredentials): Promise<void> => {
    await loginMutation.mutateAsync(credentials);
  };

  // Register function
  const register = async (credentials: RegisterCredentials): Promise<void> => {
    await registerMutation.mutateAsync(credentials);
  };

  const isLoading = isUserLoading || loginMutation.isPending || registerMutation.isPending;
  const isAuthenticated = !!user && !!token;

  const contextValue: AuthContextType = {
    user: user || null,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}