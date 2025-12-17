import React, { useEffect } from 'react';
import { AuthProvider } from './src/context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';


import './i18n/i18n';

export default function App() {
  useEffect(() => {
    // Initialize Google Sign-In
    GoogleSignin.configure({
      webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
      offlineAccess: true, // Required to get idToken
      forceCodeForRefreshToken: true, // Force to get refresh token
    });
  }, []);
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}