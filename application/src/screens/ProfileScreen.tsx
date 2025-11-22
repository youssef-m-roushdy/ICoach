import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';
import type { RootStackParamList } from '../types';
import { COLORS, SIZES } from '../constants';
import { userService } from '../services';
import { useAuth } from '../context';

type ProfileNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { user: authUser, token, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Always fetch fresh profile data from API
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!token) {
      Alert.alert('Error', 'No authentication token found');
      return;
    }

    console.log('🔍 ProfileScreen - Loading profile...');
    console.log('🎫 Token:', token);
    console.log('👤 Auth User:', authUser);

    setIsLoading(true);
    try {
      const response = await userService.getProfile(token);
      console.log('✅ Profile Response:', JSON.stringify(response, null, 2));
      
      // Use API response data, which has all the body info
      if (response.data) {
        setUserData(response.data);
      } else if (authUser) {
        // Fallback to context user if API fails
        setUserData(authUser);
      }
    } catch (error: any) {
      console.error('❌ Profile Error:', error);
      console.error('❌ Error Message:', error.message);
      
      // On error, try to use context user data
      if (authUser) {
        setUserData(authUser);
      }
      
      Alert.alert('Error', error.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              if (token) {
                await logout();
              }
              navigation.replace('Welcome');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity onPress={loadProfile} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const bmiCategory = userData.bmi 
    ? userData.bmi < 18.5 ? 'Underweight'
      : userData.bmi < 25 ? 'Normal'
      : userData.bmi < 30 ? 'Overweight'
      : 'Obese'
    : null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header with Avatar */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {userData.avatar ? (
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <MaterialIcons name="person" size={60} color={COLORS.gray} />
            </View>
          )}
        </View>
        <Text style={styles.name}>
          {userData.firstName} {userData.lastName}
        </Text>
        <Text style={styles.username}>@{userData.username}</Text>
      </View>

      {/* Personal Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={styles.editButton}
          >
            <MaterialIcons name="edit" size={20} color={COLORS.primary} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={20} color={COLORS.gray} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{userData.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={20} color={COLORS.gray} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={[styles.infoValue, !userData.phone && styles.notProvided]}>
              {userData.phone || 'Not provided'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="info" size={20} color={COLORS.gray} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Bio</Text>
            <Text style={[styles.infoValue, !userData.bio && styles.notProvided]}>
              {userData.bio || 'Not provided'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="cake" size={20} color={COLORS.gray} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={[styles.infoValue, !userData.dateOfBirth && styles.notProvided]}>
              {userData.dateOfBirth || 'Not provided'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={20} color={COLORS.gray} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Gender</Text>
            <Text style={[styles.infoValue, !userData.gender && styles.notProvided]}>
              {userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not provided'}
            </Text>
          </View>
        </View>
      </View>

      {/* Body Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Body & Fitness</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('EditBodyInfo')}
            style={styles.editButton}
          >
            <MaterialIcons name="edit" size={20} color={COLORS.primary} />
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialIcons name="height" size={24} color={COLORS.primary} />
            <Text style={[styles.statValue, !userData.height && styles.notProvided]}>
              {userData.height ? `${userData.height} cm` : 'Not provided'}
            </Text>
            <Text style={styles.statLabel}>Height</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="monitor-weight" size={24} color={COLORS.primary} />
            <Text style={[styles.statValue, !userData.weight && styles.notProvided]}>
              {userData.weight ? `${userData.weight} kg` : 'Not provided'}
            </Text>
            <Text style={styles.statLabel}>Weight</Text>
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="analytics" size={24} color={COLORS.primary} />
            <Text style={[styles.statValue, !userData.bmi && styles.notProvided]}>
              {userData.bmi || 'Not provided'}
            </Text>
            <Text style={styles.statLabel}>BMI</Text>
            {bmiCategory && (
              <Text style={styles.statSubLabel}>{bmiCategory}</Text>
            )}
          </View>

          <View style={styles.statCard}>
            <MaterialIcons name="fitness-center" size={24} color={COLORS.primary} />
            <Text style={[styles.statValue, !userData.bodyFatPercentage && styles.notProvided]}>
              {userData.bodyFatPercentage ? `${userData.bodyFatPercentage}%` : 'Not provided'}
            </Text>
            <Text style={styles.statLabel}>Body Fat</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="flag" size={20} color={COLORS.gray} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Fitness Goal</Text>
            <Text style={[styles.infoValue, !userData.fitnessGoal && styles.notProvided]}>
              {userData.fitnessGoal ? userData.fitnessGoal.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Not provided'}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <MaterialIcons name="directions-run" size={20} color={COLORS.gray} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Activity Level</Text>
            <Text style={[styles.infoValue, !userData.activityLevel && styles.notProvided]}>
              {userData.activityLevel ? userData.activityLevel.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Not provided'}
            </Text>
          </View>
        </View>
      </View>

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="lock" size={20} color={COLORS.gray} />
          <Text style={styles.menuText}>Change Password</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="notifications" size={20} color={COLORS.gray} />
          <Text style={styles.menuText}>Notifications</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <MaterialIcons name="privacy-tip" size={20} color={COLORS.gray} />
          <Text style={styles.menuText}>Privacy</Text>
          <MaterialIcons name="chevron-right" size={20} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <MaterialIcons name="logout" size={20} color="#ef4444" />
          <Text style={[styles.menuText, { color: '#ef4444' }]}>Logout</Text>
          <MaterialIcons name="chevron-right" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: SIZES.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    marginBottom: SIZES.md,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusSmall,
  },
  retryText: {
    color: COLORS.secondary,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  header: {
    alignItems: 'center',
    paddingVertical: SIZES.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkGray,
  },
  avatarContainer: {
    marginBottom: SIZES.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.darkGray,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  name: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.xs,
  },
  username: {
    fontSize: SIZES.body,
    color: COLORS.gray,
  },
  section: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkGray,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.xs,
  },
  editText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.xs,
  },
  infoValue: {
    fontSize: SIZES.body,
    color: COLORS.white,
  },
  notProvided: {
    color: COLORS.gray,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.inputBackground,
    padding: SIZES.md,
    borderRadius: SIZES.radiusSmall,
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  statValue: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SIZES.xs,
  },
  statLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginTop: SIZES.xs,
  },
  statSubLabel: {
    fontSize: SIZES.small,
    color: COLORS.primary,
    marginTop: SIZES.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    gap: SIZES.sm,
  },
  menuText: {
    flex: 1,
    fontSize: SIZES.body,
    color: COLORS.white,
  },
});
