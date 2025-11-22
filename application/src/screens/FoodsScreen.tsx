import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { COLORS, SIZES } from '../constants';

export default function FoodsScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🍎 Foods</Text>
        <Text style={styles.subtitle}>Track your nutrition and meals</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Food Tracking</Text>
          <Text style={styles.cardText}>
            Coming soon: Track your meals, scan food items, and monitor your daily nutrition intake.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>AI Food Recognition</Text>
          <Text style={styles.cardText}>
            Use our AI-powered food scanner to instantly recognize meals and get nutritional information.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nutrition Database</Text>
          <Text style={styles.cardText}>
            Access a comprehensive database of foods with detailed nutritional information.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.lg,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginBottom: SIZES.xl,
  },
  card: {
    backgroundColor: COLORS.inputBackground,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusMedium,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  cardTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  cardText: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    lineHeight: 22,
  },
});
