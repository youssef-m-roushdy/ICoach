import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView, 
  Platform, 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context';
import { COLORS, SIZES } from '../constants';
import type { RootStackParamList } from '../types';
import { LinearGradient } from 'expo-linear-gradient';

type HomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

interface GoogleUser {
  email: string;
  firstName: string;
  lastName: string;
  photo?: string;
  googleId: string;
}

export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  // 💡 ملاحظة: يجب أن يحتوي نوع الـ User في useAuth على خاصية photo?: string لتجنب التحذيرات
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

  const displayName =
    googleUser?.firstName
      ? `${googleUser.firstName} ${googleUser.lastName}`
      : user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.username || 'User';

  // 🎯 التعديل لحل مشكلة photo: 
  const profileImageSource = googleUser?.photo 
    ? { uri: googleUser.photo } 
    // ✅ نستخدم (user as any) للوصول إلى photo إذا كانت موجودة في الـ object ولكن غير معرفة في النوع
    : user && (user as any).photo 
    ? { uri: (user as any).photo } 
    : undefined;


  return (
    <LinearGradient
      colors={['#080808', '#121212', '#1A1A1A']}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent} 
      >
        
        {/* ==== HEADER (Profile Section) ==== */}
        <View style={styles.header}> 
          <View style={styles.profileSection}>
            {profileImageSource ? (
              <Image source={profileImageSource} style={styles.profileImage} />
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

        {/* ==== CARDS ==== */}
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

      </ScrollView>

      {/* ==== ثابت الشريط السفلي (BOTTOM BAR) ==== */}
      <View style={styles.bottomBar}>
        
        {/* صورة البروفايل */}
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {profileImageSource ? (
              <Image source={profileImageSource} style={styles.bottomProfileImage} />
            ) : (
              <View style={styles.bottomPlaceholderImage} />
            )}
        </TouchableOpacity>

        {/* زر تسجيل الخروج */}
        <TouchableOpacity style={styles.bottomLogoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#EF4444" style={{ marginRight: 5 }} />
          <Text style={styles.bottomLogoutButtonText}>Logout</Text>
        </TouchableOpacity>

      </View>
      <SafeAreaView style={styles.safeAreaBottom} /> 
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollViewContent: {
    paddingBottom: 80, 
  },

  header: {
    paddingHorizontal: SIZES.xl,
    paddingTop: 10,
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

  // **********************************
  // الأنماط للشريط السفلي الثابت
  // **********************************

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70, 
    backgroundColor: '#333333', 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.xl,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  
  bottomProfileImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  bottomPlaceholderImage: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#555',
  },

  bottomLogoutButton: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: 'transparent', 
    borderWidth: 1.5,
    borderColor: COLORS.primary, 
    elevation: 0, 
    shadowOpacity: 0, 
  },

  bottomLogoutButtonText: {
    color: COLORS.primary, 
    fontSize: 16,
    fontWeight: 'bold',
  },

  safeAreaBottom: {
    backgroundColor: '#333333',
    height: Platform.OS === 'ios' ? 30 : 0, 
  }
});