import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAuth } from '../context';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignupScreen from '../screens/SignupScreen';
import SignInScreen from '../screens/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import AuthCallbackScreen from '../screens/AuthCallbackScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Check if user needs onboarding (no body information filled)
  const needsOnboarding = isAuthenticated && user && !hasCompletedBodyInformation(user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignupScreen} />
            <Stack.Screen name="Login" component={SignInScreen} />
            <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} />
          </>
        ) : needsOnboarding ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Helper function to check if user has completed body information
const hasCompletedBodyInformation = (user: any): boolean => {
  return !!(
    user.gender ||
    user.dateOfBirth ||
    user.height ||
    user.weight ||
    user.fitnessGoal ||
    user.activityLevel ||
    user.bodyFatPercentage
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
