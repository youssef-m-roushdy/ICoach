import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';


import './i18n/i18n';
import { StyleSheet } from 'react-native';

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
     <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'right', 'left', 'bottom']}>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});