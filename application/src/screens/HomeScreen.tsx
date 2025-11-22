import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context';
import { COLORS, SIZES } from '../constants';
import type { RootStackParamList } from '../types';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  photo?: string;
  googleId: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { user, logout } = useAuth();
  const route = useRoute();
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);

  useEffect(() => {
    // Check if we have Google user data from navigation params
    const params = route.params as any;
    if (params?.userData) {
      setGoogleUser(params.userData);
    } else {
      // Try to load from AsyncStorage
      loadGoogleUser();
    }
  }, [route.params]);

  const loadGoogleUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('googleUser');
      if (userData) {
        setGoogleUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load Google user:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await AsyncStorage.removeItem('googleUser');
      await AsyncStorage.removeItem('idToken');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const displayName = googleUser?.firstName 
    ? `${googleUser.firstName} ${googleUser.lastName}` 
    : user?.firstName && user?.lastName
    ? `${user.firstName} ${user.lastName}`
    : user?.username || 'User';
  const displayEmail = googleUser?.email || user?.email || '';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          {googleUser?.photo && (
            <Image 
              source={{ uri: googleUser.photo }} 
              style={styles.profileImage}
            />
          )}
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{displayName}</Text>
            {user?.username && (
              <Text style={styles.username}>@{user.username}</Text>
            )}
          </View>
        </View>
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
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  username: {
    fontSize: SIZES.body,
    color: COLORS.gray,
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
  email: {
    fontSize: SIZES.small,
    color: COLORS.darkGray,
    marginTop: SIZES.xs,
  },
  userInfoCard: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: SIZES.lg,
    margin: SIZES.lg,
    borderRadius: SIZES.radiusMedium,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  infoTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  infoText: {
    fontSize: SIZES.small,
    color: COLORS.text,
    marginBottom: SIZES.xs,
    lineHeight: 20,
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
