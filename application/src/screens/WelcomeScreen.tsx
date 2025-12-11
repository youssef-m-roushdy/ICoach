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

type WelcomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Welcome'
>;

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
          {/* Logo WITHOUT container */}
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
          />

          <LanguageSelector />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{t('welcome')}</Text>
            <Text style={styles.title}>{t('to')}</Text>
            <Text style={styles.mainTitle}>{t('appName')}</Text>
          </View>

          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitle}>{t('subtitle')}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <CustomButton
              title={t('getStarted')}
              variant="primary"
              onPress={() => navigation.navigate('SignIn')}
            />
          </View>
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
  },
  image: {
    marginBottom: 120,
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 80,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },

  // Removed logoContainer completely
  logo: {
    width: 70,
    height: 50,
    resizeMode: 'contain',
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
    gap: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    color: COLORS.primary,
    fontSize: SIZES.h1 + 4,
    fontWeight: 'bold',
    textTransform: 'capitalize',
    letterSpacing: 1,
  },
  mainTitle: {
    color: COLORS.primary,
    fontSize: SIZES.h2 + 8,
    fontWeight: 'bold',
    marginTop: 8,
    textShadowColor: 'rgba(76, 175, 80, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitleContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 12,
    marginVertical: 20,
  },
  subtitle: {
    color: COLORS.lightGray,
    fontSize: SIZES.body,
    textAlign: 'center',
    lineHeight: 22,
    width: 280,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
});
