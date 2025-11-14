import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { CustomInput, CustomButton } from '../components/common';
import { AuthHeader } from '../components/auth';
import { COLORS, SIZES } from '../constants';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  return (
    <ImageBackground
      source={require('../../assets/home.png')}
      style={styles.background}
      resizeMode="contain"
    >
      <AuthHeader
        activeTab="Login"
        onTabPress={(tab) => tab === 'SignIn' && navigation.navigate('SignIn')}
      />

      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        <CustomInput placeholder="Enter your username" />
        <CustomInput 
          placeholder="Enter your password" 
          secureTextEntry 
        />

        <CustomButton title="Login" variant="secondary" />
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
});
