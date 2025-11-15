import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context';
import { COLORS, SIZES } from '../constants';

export default function HomeScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to ICoach! 🎉</Text>
        <Text style={styles.subtitle}>
          Hello, {user?.username || 'User'}!
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🍎 Nutrition Tracking</Text>
          <Text style={styles.cardText}>
            Track your meals and monitor your daily nutrition intake
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏋️ Workout Plans</Text>
          <Text style={styles.cardText}>
            Get personalized workout routines tailored to your goals
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Progress Analytics</Text>
          <Text style={styles.cardText}>
            Monitor your fitness journey with detailed analytics
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>🤖 AI Food Recognition</Text>
          <Text style={styles.cardText}>
            Scan your meals to instantly get nutritional information
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.xl,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.gray,
  },
  content: {
    padding: SIZES.lg,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: SIZES.lg,
    borderRadius: SIZES.radiusMedium,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  cardTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  cardText: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: SIZES.radiusXLarge,
    margin: SIZES.xl,
    marginTop: SIZES.lg,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: COLORS.lightGray,
    fontWeight: 'bold',
    fontSize: SIZES.h4,
  },
});
