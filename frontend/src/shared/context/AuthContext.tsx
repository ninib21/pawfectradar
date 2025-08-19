import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { quantumAPI } from '../api/apiClient';

// 🔐 QUANTUM AUTH CONTEXT: Military-grade authentication state management
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'sitter' | 'admin';
  avatar?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: any) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Check for stored user data
      const userData = await SecureStore.getItemAsync('quantum_user_data');
      const token = await SecureStore.getItemAsync('quantum_access_token');
      
      if (userData && token) {
        const user = JSON.parse(userData);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        
        // Verify token is still valid
        await refreshUser();
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to initialize authentication',
      });
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await quantumAPI.login(email, password);
      const { user } = response;
      
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      
      // Track login event
      await quantumAPI.trackEvent({
        action: 'login',
        category: 'authentication',
        label: 'success',
        value: 1,
      });
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Login failed',
      }));
      
      // Track failed login
      await quantumAPI.trackEvent({
        action: 'login_failed',
        category: 'authentication',
        label: 'error',
        value: 1,
        metadata: { error: error.message },
      });
    }
  };

  const register = async (userData: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await quantumAPI.register(userData);
      
      // Track registration event
      await quantumAPI.trackEvent({
        action: 'register',
        category: 'authentication',
        label: 'success',
        value: 1,
      });
      
      // Don't automatically log in after registration
      setState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Registration failed',
      }));
      
      // Track failed registration
      await quantumAPI.trackEvent({
        action: 'register_failed',
        category: 'authentication',
        label: 'error',
        value: 1,
        metadata: { error: error.message },
      });
    }
  };

  const logout = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      await quantumAPI.logout();
      
      // Clear stored data
      await SecureStore.deleteItemAsync('quantum_access_token');
      await SecureStore.deleteItemAsync('quantum_refresh_token');
      await SecureStore.deleteItemAsync('quantum_user_data');
      
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      
      // Track logout event
      await quantumAPI.trackEvent({
        action: 'logout',
        category: 'authentication',
        label: 'success',
        value: 1,
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear local state
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const updateProfile = async (userData: any) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const updatedUser = await quantumAPI.updateProfile(userData);
      
      setState(prev => ({
        ...prev,
        user: updatedUser,
        isLoading: false,
      }));
      
      // Update stored user data
      await SecureStore.setItemAsync('quantum_user_data', JSON.stringify(updatedUser));
      
      // Track profile update
      await quantumAPI.trackEvent({
        action: 'profile_update',
        category: 'user',
        label: 'success',
        value: 1,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Profile update failed',
      }));
    }
  };

  const refreshUser = async () => {
    try {
      const user = await quantumAPI.getCurrentUser();
      
      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
      }));
      
      // Update stored user data
      await SecureStore.setItemAsync('quantum_user_data', JSON.stringify(user));
    } catch (error) {
      console.error('User refresh error:', error);
      // If refresh fails, user might be logged out
      await logout();
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
