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
  Alert 
} from 'react-native';
// Note: Assuming 'RootStackParamList' is correctly defined in '../types'
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons'; 
import { useAuth } from '../context';
import type { RootStackParamList } from '../types'; 
import { LinearGradient } from 'expo-linear-gradient';
import MediaPickerSheet from '../components/MediaPickerSheet'; 

// 🛑 تعريف الألوان والأحجام
const GOLD = '#FFD700';
const GRAY = '#888888'; 
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const TEXT_SECONDARY = '#CCCCCC';
const BACKGROUND_DARK = '#080808';
const CARD_BACKGROUND = 'rgba(255,255,255,0.08)';
const BORDER_DARK = 'rgba(255,255,255,0.12)';
const RED_ERROR = '#EF4444';
const SIZES = {
    lg: 20,
    xl: 24,
    md: 16,
}; 

// تعريف نوع الـ Navigation (افتراضاً أن RootStackParamList موجود)
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

// ✅ مسار الصورة
const iCoachLogo = require('../../assets/icon.png'); 


// ------------------------------------------------
// 🌟 Dummy Story Data 
// ------------------------------------------------
const baseStories = [
  { id: 'me', name: 'Your Story', image: 'profile' },
  { id: '1', name: 'A. Smith', image: 'https://picsum.photos/id/1011/200/200' },
  { id: '2', name: 'B. Jhon', image: 'https://picsum.photos/id/1012/200/200' },
  { id: '3', name: 'C. Doe', image: 'https://picsum.photos/id/1015/200/200' },
  { id: '4', name: 'D. Ray', image: 'https://picsum.photos/id/1018/200/200' },
  { id: '5', name: 'E. Khan', image: 'https://picsum.photos/id/1019/200/200' },
];

const createExpandedStories = () => {
    let stories = [...baseStories];
    for (let i = 6; i <= 20; i++) {
        stories.push({ 
            id: i.toString(), 
            name: `Friend ${i}`, 
            image: `https://picsum.photos/id/${1000 + i}/200/200` 
        });
    }
    return stories;
};

const expandedStories = createExpandedStories();


// ------------------------------------------------
// 🎯 Story Item Component 
// ------------------------------------------------
interface StoryItemProps {
    item: typeof expandedStories[0];
    profileImageSource: any;
    onYourStoryPress: () => void;
}

const StoryItem: React.FC<StoryItemProps> = ({ item, profileImageSource, onYourStoryPress }) => {
    const isMine = item.id === 'me';
    
    const handlePress = () => {
        if (isMine) {
            onYourStoryPress(); 
        }
    };

    return (
        <TouchableOpacity 
            style={storyStyles.storyContainer}
            onPress={handlePress} 
            disabled={!isMine} 
        >
            <View style={[
                storyStyles.storyRing, 
                { borderColor: isMine ? GOLD : '#ccc5b9' } 
            ]}>
                {isMine ? (
                    profileImageSource ? (
                        <Image source={profileImageSource} style={storyStyles.storyImage} />
                    ) : (
                        <View style={storyStyles.storyPlaceholder} />
                    )
                ) : (
                    item.image ? (
                        <Image source={{ uri: item.image }} style={storyStyles.storyImage} />
                    ) : (
                        <View style={storyStyles.storyPlaceholder} />
                    )
                )}
                
                {isMine && (
                    <View style={storyStyles.addIcon}>
                        <MaterialIcons name="add-circle" size={20} color={GOLD} style={{ backgroundColor: BLACK, borderRadius: 10}}/> 
                    </View>
                )}
            </View>
            <Text style={[storyStyles.storyText, { color: WHITE }]} numberOfLines={1}> 
                {isMine ? 'Your Story' : item.name.split(' ')[0]}
            </Text>
        </TouchableOpacity>
    );
};


// ------------------------------------------------
// 🍽️ Meal Item Component 
// ------------------------------------------------
interface MealItemProps {
    title: string;
    onPress: () => void;
}

const MealItem: React.FC<MealItemProps> = ({ title, onPress }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    const mealImages = [
        'https://picsum.photos/id/1080/100/100',
        'https://picsum.photos/id/1082/100/100',
        'https://picsum.photos/id/1083/100/100',
    ];

    return (
        <View style={mealStyles.container}>
            {/* ====== Header (Clickable) ====== */}
            <TouchableOpacity style={mealStyles.header} onPress={() => setIsExpanded(!isExpanded)}>
                
                {/* 1. العنوان على اليسار (Meal Name) */}
                <View style={mealStyles.titleContainerLeft}>
                    <Text style={mealStyles.title}>{title}</Text>
                </View>

                {/* 2. القفل في المنتصف (عمود أفقي) */}
                <View style={mealStyles.lockContainerCenter}>
                    <MaterialIcons 
                        name="lock-outline" 
                        size={20} 
                        color={GRAY} 
                    />
                </View>

                {/* 3. السهم على اليمين (للتوسيع/الإغلاق) */}
                <View style={mealStyles.actionsRight}>
                    <Feather 
                        name={isExpanded ? "chevron-up" : "chevron-down"} 
                        size={24} 
                        color={GOLD} 
                    /> 
                </View>
            </TouchableOpacity>

            {/* ====== Expanded Content (Images) ====== */}
            {isExpanded && (
                <View style={mealStyles.content}>
                    <Text style={mealStyles.contentTitle}>Recommended Meals:</Text>
                    <View style={mealStyles.imageRow}>
                        {mealImages.map((uri, index) => (
                            <TouchableOpacity key={index} onPress={onPress}>
                                <Image 
                                    source={{ uri }} 
                                    style={mealStyles.mealImage} 
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={mealStyles.infoText}>Tap an image to view details.</Text>
                </View>
            )}
        </View>
    );
};

// ------------------------------------------------
// 🗓️ Daily Routine Component 
// ------------------------------------------------
const mealRoutine = [
    { name: 'Breakfast', key: 'breakfast' },
    { name: 'Pre-Workout', key: 'preworkout' },
    { name: 'Lunch', key: 'lunch' },
    { name: 'Post-Workout', key: 'postworkout' },
    { name: 'Dinner', key: 'dinner' },
    { name: 'Snack', key: 'snack' },
];

const DailyRoutine: React.FC = () => {
    
    const handleImagePress = () => {
        Alert.alert("Meal Details", "You pressed an image. This would navigate to the recipe/details screen.");
    };

    return (
        <View style={styles.dailyRoutineContainer}>
            {/* استخدام النمط الجديد routineTitle لتطبيق اللون الذهبي */}
            <Text style={styles.routineTitle}>Daily Routine</Text>
            
            {mealRoutine.map((meal) => (
                <MealItem
                    key={meal.key}
                    title={meal.name}
                    onPress={handleImagePress}
                />
            ))}
        </View>
    );
};

// ------------------------------------------------
// 🏠 Main HomeScreen Component 
// ------------------------------------------------
export default function HomeScreen() {
  const navigation = useNavigation<HomeNavigationProp>();
  const { user, logout } = useAuth(); 
  const route = useRoute();
  const [googleUser, setGoogleUser] = useState<GoogleUser | null>(null);
  const [isSheetVisible, setIsSheetVisible] = useState(false); 

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
  
  const profileImageSource = googleUser?.photo 
    ? { uri: googleUser.photo } 
    : user && (user as any).photo 
    ? { uri: (user as any).photo } 
    : undefined;

  const openStorySheet = () => {
    setIsSheetVisible(true);
  };
  
  const handleStoryMediaSelection = (uri: string | undefined) => {
    if (uri) {
        console.log("Story media selected:", uri);
    }
    setIsSheetVisible(false);
  };


  return (
    <LinearGradient
      colors={[BACKGROUND_DARK, '#121212', '#1A1A1A']}
      style={styles.container}
    >
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent} 
      >
        
        {/* ==== Stories Bar ==== */}
        <View style={styles.storiesWrapper}>
            <ScrollView
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={storyStyles.listContainer}
                nestedScrollEnabled={true} 
            >
                {expandedStories.map((item) => (
                    <StoryItem 
                        key={item.id} 
                        item={item} 
                        profileImageSource={profileImageSource} 
                        onYourStoryPress={openStorySheet} 
                    />
                ))}
            </ScrollView>
        </View>

        {/* ==== DAILY ROUTINE ==== */}
        <View style={styles.content}>
            <DailyRoutine />
        </View>
        
        {/* ==== CARD LIST (Nutrition, Workout, etc.) ==== */}
        <View style={styles.content}>
             <Text style={[styles.routineTitle, { marginBottom: 15 }]}>Features</Text>
             {/* قمت بإضافة مكونات dummy مؤقتة لملء المساحة */}
             <Text style={styles.infoText}>Nutrition Tracking Card Here...</Text>
             <Text style={styles.infoText}>Workout Plans Card Here...</Text>
        </View>


      </ScrollView>

      {/* ==== BOTTOM BAR ==== */}
      <View style={[styles.bottomBar, { backgroundColor: '#333333' }]}> 
        
        {/* Profile Image */}
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          {profileImageSource ? (
              <Image source={profileImageSource} style={[styles.bottomProfileImage, { borderColor: GOLD }]} />
            ) : (
              <View style={styles.bottomPlaceholderImage} />
            )}
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity style={[styles.bottomLogoutButton, { borderColor: GOLD }]} onPress={handleLogout}> 
          <Ionicons name="log-out-outline" size={24} color={RED_ERROR} style={{ marginRight: 5 }} /> 
          <Text style={[styles.bottomLogoutButtonText, { color: GOLD }]}>Logout</Text> 
        </TouchableOpacity>

      </View>
      
      {/* Media Picker Sheet (Requires manual GOLD/BLACK updates) */}
      <MediaPickerSheet 
        isVisible={isSheetVisible}
        onClose={() => setIsSheetVisible(false)}
        onSelectMedia={handleStoryMediaSelection}
      />

      <SafeAreaView style={styles.safeAreaBottom} /> 
    </LinearGradient>
  );
}

// ------------------------------------------------
// 🎨 Styles للـ Header Image
// ------------------------------------------------
const headerStyles = StyleSheet.create({
    logoImage: {
        width: 90, 
        height: 30,  
        marginLeft: 10, 
        tintColor: GOLD, 
    },
    iconMargin: {
        // فاصل صغير للأيقونات الجانبية (مثل المسافة اليمنى لزر المنيو، أو اليسرى لزر الرسائل)
        marginHorizontal: 5, 
    },
    // ⭐️ النمط الجديد لتوفير مسافة بين أيقونات الهيدر اليمنى
    iconSpacing: {
        marginRight: 15, // مسافة بين أيقونة الشات بوت وأيقونة الرسائل
    }
});


// ------------------------------------------------
// 🎨 Meal Styles 
// ------------------------------------------------
const mealStyles = StyleSheet.create({
    container: {
        backgroundColor: CARD_BACKGROUND, 
        borderRadius: 12,
        marginBottom: 10,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: BORDER_DARK, 
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    titleContainerLeft: {
        flex: 1, 
        alignItems: 'flex-start', 
    },
    lockContainerCenter: {
        width: 40, 
        alignItems: 'center',
    },
    actionsRight: {
        width: 40,
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: WHITE, 
        textAlign: 'left', 
    },
    content: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
    },
    contentTitle: {
        color: TEXT_SECONDARY, 
        marginBottom: 10,
        fontSize: 14,
        fontWeight: '500',
    },
    imageRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    mealImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    infoText: {
        color: TEXT_SECONDARY, 
        fontSize: 12,
        textAlign: 'center',
        marginTop: 5,
    }
});


// ------------------------------------------------
// 🎨 Story Styles 
// ------------------------------------------------
const STORY_SIZE = 70;
const storyStyles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: SIZES.lg,
        paddingVertical: 10,
        flexDirection: 'row', 
        alignItems: 'center',
    },
    storyContainer: {
        alignItems: 'center',
        marginRight: SIZES.md,
        width: STORY_SIZE + 10,
    },
    storyRing: {
        width: STORY_SIZE + 6,
        height: STORY_SIZE + 6,
        borderRadius: (STORY_SIZE + 6) / 2,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: GOLD, 
        marginBottom: 5,
    },
    storyImage: {
        width: STORY_SIZE,
        height: STORY_SIZE,
        borderRadius: STORY_SIZE / 2,
    },
    storyPlaceholder: {
        width: STORY_SIZE,
        height: STORY_SIZE,
        borderRadius: STORY_SIZE / 2,
        backgroundColor: '#555',
        justifyContent: 'center',
        alignItems: 'center',
    },
    storyText: {
        color: WHITE, 
        fontSize: 12,
        maxWidth: STORY_SIZE,
        textAlign: 'center',
    },
    addIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        zIndex: 1,
        backgroundColor: BLACK, 
        borderRadius: 10,
    }
});

// ------------------------------------------------
// 🎨 General Styles 
// ------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  scrollViewContent: {
    paddingBottom: 80, 
  },
  
  storiesWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 5,
    height: 120, 
  },

  content: {
    padding: SIZES.lg,
    paddingTop: SIZES.xl, 
  },
  
  dailyRoutineContainer: {
    paddingVertical: 10,
  },
  routineTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: GOLD, 
    marginBottom: SIZES.md,
    textAlign: 'left',
  },
  infoText: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    marginTop: 10,
  },
  
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
    borderColor: GOLD, 
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: 'transparent', 
    borderWidth: 1.5,
    borderColor: GOLD, 
    elevation: 0, 
    shadowOpacity: 0, 
  },

  bottomLogoutButtonText: {
    color: GOLD, 
    fontSize: 16,
    fontWeight: 'bold',
  },

  safeAreaBottom: {
    backgroundColor: '#333333',
    height: Platform.OS === 'ios' ? 30 : 0, 
  }
});