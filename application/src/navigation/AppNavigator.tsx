import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
// ❌ تم حذف الاستيراد: import { RootStackParamList } from '../types';
import { useAuth } from '../context';
import WelcomeScreen from '../screens/WelcomeScreen';
import SignUpScreen from '../screens/SignupScreen';
import SignInScreen from '../screens/SignInScreen';
import HomeScreen from '../screens/HomeScreen';
import AuthCallbackScreen from '../screens/AuthCallbackScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import EditBodyInfoScreen from '../screens/EditBodyInfoScreen';
import FoodsScreen from '../screens/FoodsScreen';
import MessagesScreen from '../screens/MessagesScreen'; 

import { 
  ActivityIndicator, 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  Text,
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

// ✅ الحل: تم وضع تعريف الأنواع هنا مؤقتاً لحل خطأ 'Messages'
export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Login: undefined;
  AuthCallback: undefined;
  Onboarding: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  EditBodyInfo: undefined;
  Foods: undefined;
  // 🎯 هذا هو السطر الذي يحل المشكلة
  Messages: undefined; 
};


const Stack = createNativeStackNavigator<RootStackParamList>();
const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Custom Drawer Menu Component
interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

function DrawerMenu({ visible, onClose, navigation }: DrawerMenuProps) {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      onClose();
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleNavigate = (screen: keyof RootStackParamList) => { // استخدام الأنواع
    onClose();
    navigation.navigate(screen);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none" // تم تغيير animationType إلى 'none' للسماح بالتحكم اليدوي
      onRequestClose={onClose}
    >
      <View style={drawerStyles.overlay}>
        {/*
          نضع Drawer أولاً في شجرة المكونات
          مع استخدام position: 'absolute' و left: 0
          لضمان ظهوره على اليسار بشكل ثابت
        */}
        <View style={drawerStyles.drawer}> 
          <View style={drawerStyles.header}>
            <TouchableOpacity 
              style={drawerStyles.closeButton}
              onPress={onClose}
            >
              <MaterialIcons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={drawerStyles.menuItems}>
            <TouchableOpacity 
              style={drawerStyles.menuItem}
              onPress={() => handleNavigate('Home')}
            >
              <MaterialIcons name="home" size={24} color={COLORS.primary} />
              <Text style={drawerStyles.menuText}>Home</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={drawerStyles.menuItem}
              onPress={() => handleNavigate('Profile')}
            >
              <MaterialIcons name="person" size={24} color={COLORS.primary} />
              <Text style={drawerStyles.menuText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={drawerStyles.menuItem}
              onPress={() => handleNavigate('Foods')}
            >
              <MaterialIcons name="restaurant" size={24} color={COLORS.primary} />
              <Text style={drawerStyles.menuText}>Foods</Text>
            </TouchableOpacity>
            
            {/* ✅ زر الرسائل */}
            <TouchableOpacity 
              style={drawerStyles.menuItem}
              onPress={() => handleNavigate('Messages')}
            >
              <MaterialIcons name="message" size={24} color={COLORS.primary} />
              <Text style={drawerStyles.menuText}>Messages</Text>
            </TouchableOpacity>
          </View>

          <View style={drawerStyles.footer}>
            <TouchableOpacity 
              style={drawerStyles.logoutButton}
              onPress={handleLogout}
            >
              <MaterialIcons name="logout" size={24} color="#ef4444" />
              <Text style={drawerStyles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/*
          هذا المكون يغطي باقي الشاشة ويغلق القائمة عند الضغط عليه.
          نضع الـ View هنا لضمان أنه يغطي المساحة المتبقية على اليمين.
        */}
        <TouchableOpacity 
          style={drawerStyles.overlayTouchable} 
          activeOpacity={1} 
          onPress={onClose}
        />
      </View>
    </Modal>
  );
}

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [navigationRef, setNavigationRef] = useState<any>(null);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Check if user needs onboarding (no body information filled)
  const needsOnboarding = isAuthenticated && user && !hasCompletedBodyInformation(user);

  return (
    <>
      <NavigationContainer
        ref={(nav) => setNavigationRef(nav)}
      >
        <Stack.Navigator 
          screenOptions={({ navigation, route }) => ({
            headerShown: isAuthenticated,
            headerStyle: {
              backgroundColor: COLORS.background,
            },
            headerTintColor: COLORS.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerLeft: isAuthenticated ? () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => setDrawerVisible(true)}
              >
                <MaterialIcons name="menu" size={28} color={COLORS.primary} />
              </TouchableOpacity>
            ) : undefined,
          })}
        >
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
              <Stack.Screen name="SignIn" component={SignUpScreen} options={{ headerShown: false }} />
              <Stack.Screen name="Login" component={SignInScreen} options={{ headerShown: false }} />
              <Stack.Screen name="AuthCallback" component={AuthCallbackScreen} options={{ headerShown: false }} />
            </>
          ) : needsOnboarding ? (
            <>
              <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={({ navigation }) => ({ 
                  title: 'ICoach',
                  // 🎯 إضافة زر الرسائل على اليمين هنا
                  headerRight: () => (
                    <TouchableOpacity
                      style={{ marginRight: 15 }}
                      onPress={() => navigation.navigate('Messages' as any)}
                    >
                      {/* استخدام MaterialIcons كرمز للرسائل */}
                      <MaterialIcons name="message" size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                  ),
                })} 
              />
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
              <Stack.Screen name="Foods" component={FoodsScreen} options={{ title: 'Foods' }} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
              <Stack.Screen name="EditBodyInfo" component={EditBodyInfoScreen} options={{ title: 'Edit Body Info' }} />
              {/* ✅ شاشة الرسائل */}
              <Stack.Screen name="Messages" component={MessagesScreen} options={{ title: 'Messages' }} />
            </>
          ) : (
            <>
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={({ navigation }) => ({
                  title: 'ICoach',
                  // 🎯 إضافة زر الرسائل على اليمين هنا
                  headerRight: () => (
                    <TouchableOpacity
                      style={{ marginRight: 15 }}
                      onPress={() => navigation.navigate('Messages' as any)}
                    >
                      <MaterialIcons name="message" size={28} color={COLORS.primary} />
                    </TouchableOpacity>
                  ),
                })} 
              />
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
              <Stack.Screen name="Foods" component={FoodsScreen} options={{ title: 'Foods' }} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
              <Stack.Screen name="EditBodyInfo" component={EditBodyInfoScreen} options={{ title: 'Edit Body Info' }} />
              {/* ✅ شاشة الرسائل */}
              <Stack.Screen name="Messages" component={MessagesScreen} options={{ title: 'Messages' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
      {isAuthenticated && navigationRef && (
        <DrawerMenu 
          visible={drawerVisible} 
          onClose={() => setDrawerVisible(false)}
          navigation={navigationRef}
        />
      )}
    </>
  );
};

// Helper function to check if user has completed body information
const hasCompletedBodyInformation = (user: any): boolean => {
  return !!(
    user.gender ||
    user.dateOfBirth ||
    user.height ||
    user.weight ||
    user.fitnessGoal ||
    user.activityLevel ||
    user.bodyFatPercentage
  );
};

// 🎯 الأنماط المعدلة
const drawerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    // 🛠️ تم التغيير: لجعل القائمة تظهر من اليسار، نستخدم ترتيب المكونات العادي
    flexDirection: 'row', 
  },
  overlayTouchable: {
    // هذا سيأخذ المساحة المتبقية على اليمين
    flex: 1,
  },
  drawer: {
    width: SCREEN_WIDTH * 0.75,
    backgroundColor: COLORS.background,
    // 🛠️ التعديل الرئيسي: لتثبيت القائمة على اليسار
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 10, // تأكد من أنه فوق الـ overlayTouchable
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.lg,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.darkGray,
  },
  closeButton: {
    alignSelf: 'flex-start',
  },
  menuItems: {
    flex: 1,
    paddingTop: SIZES.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.lg,
    paddingHorizontal: SIZES.xl,
    gap: SIZES.md,
  },
  menuText: {
    fontSize: SIZES.h3,
    color: COLORS.white,
    fontWeight: '600',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.darkGray,
    padding: SIZES.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    gap: SIZES.md,
  },
  logoutText: {
    fontSize: SIZES.body,
    color: '#ef4444',
    fontWeight: '600',
  },
});

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});