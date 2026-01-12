import React, { useEffect, useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, ThemeProvider } from './src/context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import i18n from './i18n/i18n';

import './i18n/i18n';
import { StyleSheet, ActivityIndicator, View } from 'react-native';

export default function App() {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize Google Sign-In
        GoogleSignin.configure({
          webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || '',
          offlineAccess: true,
          forceCodeForRefreshToken: true,
        });

        // Load saved language
        const savedLang = await AsyncStorage.getItem('appLanguage');
        if (savedLang) {
          await i18n.changeLanguage(savedLang);
        }
        
        setAppReady(true);
      } catch (error) {
        console.error('App initialization error:', error);
        setAppReady(true);
      }
    };

    initializeApp();
  }, []);

  if (!appReady) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  return (
     <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top', 'right', 'left', 'bottom']}>
      <AuthProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
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