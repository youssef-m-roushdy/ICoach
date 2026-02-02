import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { authService } from '../services';
import { socketService } from '../services/socketService';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, token: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  setAuthState: (token: string, user: User, refreshToken?: string) => Promise<void>;
  updateUser: (user: User) => void;
  token: string | null;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@icoach_token';
const REFRESH_TOKEN_KEY = '@icoach_refresh_token';
const USER_KEY = '@icoach_user';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Handle email verification event from WebSocket
  const handleEmailVerified = useCallback((data: {
    success: boolean;
    message: string;
    user: { id: string; email: string; isEmailVerified: boolean; firstName?: string };
  }) => {
    console.log('📧 Email verified event received in AuthContext:', data);
    
    if (data.success && user) {
      // Update user state with verified status
      const updatedUser = { ...user, isEmailVerified: true };
      setUser(updatedUser);
      
      // Update stored user data
      AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      
      // Show success notification to user
      Alert.alert(
        '✅ Email Verified!',
        data.message || 'Your email has been verified successfully. You now have full access to all features.',
        [{ text: 'Great!', style: 'default' }]
      );
    }
  }, [user]);

  // Connect to WebSocket when user is logged in
  useEffect(() => {
    if (user?.id && !user.isEmailVerified) {
      // Only connect if user is logged in and email not verified yet
      console.log('🔌 Connecting socket for unverified user:', user.id);
      socketService.connect(user.id, {
        onEmailVerified: handleEmailVerified,
        onConnected: () => console.log('✅ Socket connected for real-time updates'),
        onDisconnected: (reason) => console.log('🔌 Socket disconnected:', reason),
      });
    } else if (!user) {
      // Disconnect when user logs out
      socketService.disconnect();
    }

    return () => {
      // Cleanup on unmount (but not on every user change)
    };
  }, [user?.id, user?.isEmailVerified, handleEmailVerified]);

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Import and set the global refresh function
  useEffect(() => {
    const { setGlobalRefreshTokenFunction } = require('../services/api');
    setGlobalRefreshTokenFunction(refreshAccessToken);
  }, []);

  const loadStoredAuth = async () => {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, authToken: string, refreshToken?: string) => {
    try {
      setUser(userData);
      setToken(authToken);
      
      // Store in AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, authToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      if (refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        console.log('✅ Refresh token stored successfully in login');
      } else {
        console.warn('⚠️ No refresh token provided to login function');
      }
    } catch (error) {
      console.error('Error saving auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      if (token) {
        await authService.logout(token);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Disconnect WebSocket
      socketService.disconnect();
      
      // Clear local state and storage
      setUser(null);
      setToken(null);
      await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
    }
  };

  const setAuthState = async (authToken: string, userData: User, refreshToken?: string) => {
    try {
      setUser(userData);
      setToken(authToken);
      
      // Store in AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, authToken);
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      // Store refresh token if provided
      if (refreshToken) {
        await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        console.log('✅ Refresh token stored successfully');
      } else {
        console.warn('⚠️ No refresh token provided to setAuthState');
      }
    } catch (error) {
      console.error('Error setting auth state:', error);
      throw error;
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      console.log('🔄 Attempting to refresh access token...');
      const storedRefreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!storedRefreshToken) {
        console.error('❌ No refresh token available in storage');
        console.log('📦 Checking all stored keys...');
        const allKeys = await AsyncStorage.getAllKeys();
        console.log('🔑 Stored keys:', allKeys);
        return null;
      }

      console.log('✅ Refresh token found, calling API...');
      const response = await authService.refreshToken(storedRefreshToken);
      
      if (response.success && response.data) {
        const newAccessToken = response.data.accessToken;
        setToken(newAccessToken);
        await AsyncStorage.setItem(TOKEN_KEY, newAccessToken);
        
        // Update refresh token if provided
        if (response.data.refreshToken) {
          await AsyncStorage.setItem(REFRESH_TOKEN_KEY, response.data.refreshToken);
        }
        
        return newAccessToken;
      }
      
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // If refresh fails, logout user
      await logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        setAuthState,
        updateUser,
        token,
        refreshAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
