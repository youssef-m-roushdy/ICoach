import React from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { CustomButton, LanguageSelector } from '../components/common';
import { COLORS, SIZES } from '../constants';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { t } = useTranslation();

  return (
    <ImageBackground
      source={require('../../assets/coatch.png')}
      style={styles.background}
      resizeMode="contain"
      imageStyle={styles.image}
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../../assets/icon.png')} style={styles.logo} />
          <LanguageSelector />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{t('welcome')}</Text>
          <Text style={styles.title}>{t('to')}</Text>
          <Text style={styles.mainTitle}>{t('appName')}</Text>

          <Text style={styles.subtitle}>{t('subtitle')}</Text>

          <CustomButton
            title={t('getStarted')}
            variant="primary"
            onPress={() => navigation.navigate('SignIn')}
          />
        </View>

        <StatusBar style="light" />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'flex-end',
  },
  image: {
    marginBottom: 100,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 60,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
  },
  logo: {
    width: 80,
    height: 60,
    resizeMode: 'contain',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
  },
  title: {
    color: COLORS.primary,
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    textTransform: 'lowercase',
  },
  mainTitle: {
    color: COLORS.primary,
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginBottom: SIZES.lg,
  },
  subtitle: {
    color: COLORS.gray,
    fontSize: SIZES.small,
    textAlign: 'center',
    marginBottom: SIZES.xxl,
    width: 300,
  },
});
