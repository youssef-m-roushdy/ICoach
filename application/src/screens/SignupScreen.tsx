import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { CustomInput, CustomButton, GoogleButton } from '../components/common';
import { AuthHeader } from '../components/auth';
import { COLORS, SIZES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { authService } from '../services';
import { useAuth } from '../context';

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const navigation = useNavigation<SignInScreenNavigationProp>();
  const { colors } = useTheme();
  const { login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
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
        firstName,
        lastName,
        username,
        email,
        password,
      });

      if (response.success && response.data) {
        await login(
          response.data.user,
          response.data.accessToken,
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
      source={require('../../assets/home.jpeg')}
      style={styles.background}
      resizeMode="contain"
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <AuthHeader
          activeTab="SignIn"
          onTabPress={(tab) => tab === 'Login' && navigation.navigate('Login')}
        />

        <View style={[styles.formContainer, { backgroundColor: colors.background + '99' }]}>
          <Text style={[styles.title, { color: colors.text }]}>Sign up</Text>

          <View style={styles.nameContainer}>
            <View style={styles.nameInput}>
              <CustomInput 
                placeholder="First name" 
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.nameInput}>
              <CustomInput 
                placeholder="Last name" 
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
            </View>
          </View>

          <CustomInput 
            placeholder="Choose a username" 
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
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : (
            <>
              <CustomButton title="Sign up" variant="secondary" onPress={handleSignUp} />
              <Text style={[styles.orText, { color: colors.text }]}>OR</Text>
              <GoogleButton mode="signup" />
            </>
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
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
  nameContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
    marginBottom: 15,
  },
  nameInput: {
    flex: 1,
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