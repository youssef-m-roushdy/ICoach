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
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!emailOrUsername || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ emailOrUsername, password });
      
      console.log('🔐 Login Response:', JSON.stringify(response, null, 2));
      console.log('✅ Success:', response.success);
      console.log('📦 Data:', response.data);
      console.log('👤 User:', response.data?.user);
      console.log('🎫 Access Token:', response.data?.accessToken);
      console.log('🔄 Refresh Token:', response.data?.refreshToken);

      if (response.success && response.data) {
        await login(
          response.data.user,
          response.data.accessToken,
          response.data.refreshToken
        );
        Alert.alert('Success', 'Logged in successfully!');
      }
    } catch (error: any) {
      console.error('❌ Login Error:', error);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Error Stack:', error.stack);
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
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
      <AuthHeader
        activeTab="Login"
        onTabPress={(tab) => tab === 'SignIn' && navigation.navigate('SignIn')}
      />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text> 

        <CustomInput 
          placeholder="Enter your email or username" 
          value={emailOrUsername}
          onChangeText={setEmailOrUsername}
          autoCapitalize="none"
        />
        <CustomInput 
          placeholder="Enter your password" 
          value={password}
          onChangeText={setPassword}
          secureTextEntry 
        />

        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          <>
            <CustomButton title="Login" variant="secondary" onPress={handleLogin} />
            <Text style={styles.orText}>OR</Text>
            <GoogleButton mode="signin" />
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
