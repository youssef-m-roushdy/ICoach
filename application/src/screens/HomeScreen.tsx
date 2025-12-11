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
import LinearGradient from 'react-native-linear-gradient';


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
    const params = route.params as any;
    if (params?.userData) {
      setGoogleUser(params.userData);
    } else loadGoogleUser();
  }, [route.params]);

  const loadGoogleUser = async () => {
    try {
      const data = await AsyncStorage.getItem('googleUser');
      if (data) setGoogleUser(JSON.parse(data));
    } catch (err) {
      console.log(err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await AsyncStorage.removeItem('googleUser');
      await AsyncStorage.removeItem('idToken');
    } catch (err) {
      console.log(err);
    }
  };

  const displayName = googleUser?.firstName
    ? googleUser.firstName + ' ' + googleUser.lastName
    : user?.firstName && user?.lastName
    ? user.firstName + ' ' + user.lastName
    : user?.username || 'User';

  return (
    <LinearGradient
      colors={['#080808', '#121212', '#1A1A1A']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            {googleUser?.photo ? (
              <Image source={{ uri: googleUser.photo }} style={styles.profileImage} />
            ) : (
              <View style={styles.placeholderImage} />
            )}

            <View>
              <Text style={styles.userName}>{displayName}</Text>
              {user?.username && (
                <Text style={styles.username}>@{user.username}</Text>
              )}
            </View>
          </View>
        </View>

        {/* CONTENT CARDS */}
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

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    padding: SIZES.xl,
    paddingTop: 70,
  },

  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  profileImage: {
    width: 65,
    height: 65,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  placeholderImage: {
    width: 65,
    height: 65,
    borderRadius: 40,
    backgroundColor: '#333',
  },

  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },

  username: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },

  content: {
    padding: SIZES.lg,
  },

  card: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 6,
  },

  cardText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },

  logoutButton: {
    backgroundColor: '#202020',
    paddingVertical: 16,
    borderRadius: 50,
    marginHorizontal: 30,
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef444444',
  },

  logoutButtonText: {
    color: '#ef4444',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
