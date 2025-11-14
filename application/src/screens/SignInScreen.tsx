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

type SignInScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignIn'>;

export default function SignInScreen() {
  const navigation = useNavigation<SignInScreenNavigationProp>();

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

        <CustomInput placeholder="Enter your username" />
        <CustomInput 
          placeholder="Create your password" 
          secureTextEntry 
        />
        <CustomInput 
          placeholder="Rewrite your password" 
          secureTextEntry 
        />

        <CustomButton title="Sign up" variant="secondary" />
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
