import React from 'react';
import { AuthProvider } from './src/context';
import { AppNavigator } from './src/navigation/AppNavigator';
import './i18n/i18n';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}