import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { CustomInput, CustomButton, GoogleButton } from '../components/common';
import { AuthHeader } from '../components/auth';
import { COLORS, SIZES } from '../constants';
import { authService } from '../services';
import { useAuth } from '../context';

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register({
        username,
        email,
        password,
      });

      if (response.success && response.data) {
        await login(
          response.data.user,
          response.data.token,
          response.data.refreshToken
        );
        Alert.alert('Success', 'Account created successfully!');
      }
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Please try again');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../assets/home.png')}
      style={styles.background}
      resizeMode="contain"
    >
      <AuthHeader
        activeTab="SignIn"
        onTabPress={(tab) => tab === 'Login' && navigation.navigate('Login')}
      />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign up</Text>

        <CustomInput 
          placeholder="Enter your username" 
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        <CustomInput 
          placeholder="Enter your email" 
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <CustomInput 
          placeholder="Create your password" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry 
        />
        <CustomInput 
          placeholder="Confirm your password" 
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry 
        />

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <>
            <CustomButton title="Sign up" variant="secondary" onPress={handleSignUp} />
            <Text style={styles.orText}>OR</Text>
            <GoogleButton mode="signup" />
          </>
        )}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: COLORS.overlay,
    marginHorizontal: SIZES.xxl,
    padding: 25,
    borderRadius: SIZES.radiusMedium,
    alignItems: 'center',
    marginTop: 220,
  },
  title: {
    color: COLORS.primary,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  orText: {
    color: COLORS.gray,
    fontSize: SIZES.small,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  loader: {
    marginTop: SIZES.md,
  },
});
