import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView, 
  Image,
  SafeAreaView, 
  Dimensions
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../context'; 
import { LinearGradient } from 'expo-linear-gradient';
import MediaPickerSheet from '../components/MediaPickerSheet'; 

const GOLD = '#FFD700';
const BLACK = '#000000';
const WHITE = '#FFFFFF';
const BG_GRADIENT = ['#0F0F0F', '#1A1A1A', '#000000'] as const;

export default function HomeScreen() {
  const { user } = useAuth() as any; 
  const [showAll, setShowAll] = useState(false);
  const [isSheetVisible, setIsSheetVisible] = useState(false);

 
  const userImage = useMemo(() => {
    
    const googlePhotoUrl = user?.photoURL || user?.avatar;
    
    
    if (googlePhotoUrl && typeof googlePhotoUrl === 'string' && googlePhotoUrl.startsWith('http')) {
      return { uri: googlePhotoUrl };
    }
    
    
    const name = user?.firstName || user?.username || 'User';
    console.warn('⚠️ No Google photo found, using generated avatar for:', name);
    return { uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FFD700&color=000&bold=true` };
  }, [user]);

  const INITIAL_MEALS = ['Breakfast', 'Lunch', 'Workout Meal', 'Dinner'];
  const EXTRA_MEALS = ['Morning Snack', 'Evening Snack', 'Post-Workout Shake'];
  const displayedMeals = showAll ? [...INITIAL_MEALS, ...EXTRA_MEALS] : INITIAL_MEALS;

  return (
    <View style={styles.main}>
      <LinearGradient colors={BG_GRADIENT} style={StyleSheet.absoluteFill} />
      
      {/* Background Image */}
      <Image 
        source={require('../../assets/Boy.png')} 
        style={styles.backgroundImage} 
      />
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          
          <View style={styles.headerTop}>
             <View>
                <Text style={styles.welcomeTxt}>Hello...</Text>
                <Text style={styles.nameTxt}>Champion 🔥</Text>
             </View>
             <View style={styles.headerBtnsContainer}>
                <TouchableOpacity style={styles.chatbotBtn}>
                   <MaterialCommunityIcons name="robot-outline" size={22} color={GOLD} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.notifBtn}>
                   <Ionicons name="notifications-outline" size={22} color={GOLD} />
                </TouchableOpacity>
             </View>
          </View>

          <View style={styles.storiesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20 }}>
                
                {/* My Story */}
                <TouchableOpacity style={storyStyles.container} onPress={() => setIsSheetVisible(true)} activeOpacity={0.8}>
                    <View style={[storyStyles.ring, { borderColor: GOLD }]}>
                        <Image 
                            source={userImage} 
                            style={storyStyles.img}
                            key={userImage.uri} 
                        />
                        <View style={storyStyles.add}><Ionicons name="add" size={14} color={BLACK} /></View>
                    </View>
                    <Text style={storyStyles.txt}>My Story</Text>
                </TouchableOpacity>

                
                {['Youssef', 'Omar', 'Amr', 'Mazen'].map((name, index) => (
                    <View key={index} style={storyStyles.container}>
                        <View style={[storyStyles.ring, { borderColor: 'rgba(45, 14, 88, 0.1)' }]}>
                            <Image source={{ uri: `https://picsum.photos/id/${1011+index}/200/200` }} style={storyStyles.img} />
                        </View>
                        <Text style={storyStyles.txt}>{name}</Text>
                    </View>
                ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Daily Routine</Text>
                <TouchableOpacity onPress={() => setShowAll(!showAll)}>
                    <Text style={styles.seeAll}>{showAll ? 'Show Less' : 'See All'}</Text>
                </TouchableOpacity>
            </View>
            
            {displayedMeals.map((meal, index) => (
                <MealCard key={index} title={meal} />
            ))}
          </View>

        </ScrollView>
      </SafeAreaView>

      
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}><MaterialCommunityIcons name="arm-flex" size={28} color={GOLD} /><Text style={styles.navTxt}>Workouts</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navItemCenter}>
            <LinearGradient colors={[GOLD, '#B8860B'] as const} style={styles.centerCircle}>
                <MaterialCommunityIcons name="food-apple" size={30} color={BLACK} /> 
            </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}><Ionicons name="settings-sharp" size={26} color="#666" /><Text style={[styles.navTxt, {color: '#666'}]}>Settings</Text></TouchableOpacity>
      </View>

      <MediaPickerSheet isVisible={isSheetVisible} onClose={() => setIsSheetVisible(false)} onSelectMedia={() => {}} />
    </View>
  );
}


const MealCard = ({ title }: { title: string }) => {
    const [open, setOpen] = useState(false);

  
    const mealDetails = {
        'Breakfast': [
            { 
                name: 'Eggs & Toast',
                calories: '230 kcal',
                protein: '11g',
                carbs: '10g',
                fat: '14g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/eggs_benedict.jpg',
                description: 'بيض + عيش أبيض'
            },
            { 
                name: 'French Toast',
                calories: '210 kcal',
                protein: '8g',
                carbs: '22g',
                fat: '8g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/french_toast.jpg',
                description: 'عيش + بيض + سكر'
            },
            { 
                name: 'Apple & Almonds',
                calories: '160 kcal',
                protein: '6g',
                carbs: '16g',
                fat: '8g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/apple.jpg',
                description: 'تفاح + لوز'
            }
        ],
        'Lunch': [
            { 
                name: 'Grilled Salmon & Rice',
                calories: '280 kcal',
                protein: '22g',
                carbs: '25g',
                fat: '13g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/grilled_salmon.jpg',
                description: 'سمك مشوي + أرز + سلطة'
            },
            { 
                name: 'Kofta & Bread',
                calories: '280 kcal',
                protein: '24g',
                carbs: '20g',
                fat: '18g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/kofta.jpg',
                description: 'كفتة + عيش + طحينة'
            },
            { 
                name: 'Caesar Salad',
                calories: '180 kcal',
                protein: '10g',
                carbs: '7g',
                fat: '10g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/caesar_salad.jpg',
                description: 'سلطة + دجاج + صوص'
            }
        ],
        'Workout Meal': [
            { 
                name: 'Banana & Honey',
                calories: '160 kcal',
                protein: '1.5g',
                carbs: '41g',
                fat: '0.5g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/banana.jpg',
                description: 'موز + عسل (قبل الرياضة)'
            },
            { 
                name: 'Toast & Peanut Butter',
                calories: '200 kcal',
                protein: '8g',
                carbs: '20g',
                fat: '10g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/french_toast.jpg',
                description: 'عيش + زبدة الفول السوداني'
            },
            { 
                name: 'Dates & Milk',
                calories: '140 kcal',
                protein: '4g',
                carbs: '32g',
                fat: '2g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/fig.jpg',
                description: 'تمر + حليب'
            }
        ],
        'Dinner': [
            { 
                name: 'Kebda & Rice',
                calories: '240 kcal',
                protein: '26g',
                carbs: '20g',
                fat: '7g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/kebda.jpg',
                description: 'كبدة + أرز + خضار'
            },
            { 
                name: 'Fish & Bread',
                calories: '260 kcal',
                protein: '20g',
                carbs: '18g',
                fat: '12g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/fish.jpg',
                description: 'سمك + عيش + طماطم'
            },
            { 
                name: 'Chicken Wings & Rice',
                calories: '280 kcal',
                protein: '20g',
                carbs: '25g',
                fat: '12g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/chicken_wings.jpg',
                description: 'دجاج + أرز + ملوخية'
            }
        ],
        'Morning Snack': [
            { 
                name: 'Apple & Cheese',
                calories: '150 kcal',
                protein: '8g',
                carbs: '14g',
                fat: '6g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/apple.jpg',
                description: 'تفاح + جبن'
            },
            { 
                name: 'Yogurt & Granola',
                calories: '180 kcal',
                protein: '10g',
                carbs: '20g',
                fat: '5g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/frozen_yogurt.jpg',
                description: 'زبادي + جرانولا'
            },
            { 
                name: 'Banana & Almonds',
                calories: '160 kcal',
                protein: '5g',
                carbs: '25g',
                fat: '6g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/banana.jpg',
                description: 'موز + لوز محمص'
            }
        ],
        'Evening Snack': [
            { 
                name: 'Cheese & Crackers',
                calories: '170 kcal',
                protein: '10g',
                carbs: '12g',
                fat: '10g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/cheese_plate.jpg',
                description: 'جبن + بسكويت مالح'
            },
            { 
                name: 'Grapes & Nuts',
                calories: '150 kcal',
                protein: '4g',
                carbs: '20g',
                fat: '7g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/grape.jpg',
                description: 'عنب + جوز'
            },
            { 
                name: 'Fig & Honey',
                calories: '130 kcal',
                protein: '1g',
                carbs: '32g',
                fat: '0.5g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/fig.jpg',
                description: 'تين + عسل'
            }
        ],
        'Post-Workout Shake': [
            { 
                name: 'Banana & Milk',
                calories: '120 kcal',
                protein: '8g',
                carbs: '18g',
                fat: '2g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/banana.jpg',
                description: 'موز + حليب (بروتين)'
            },
            { 
                name: 'Dates & Yogurt',
                calories: '140 kcal',
                protein: '6g',
                carbs: '28g',
                fat: '2g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/fig.jpg',
                description: 'تمر + زبادي يوناني'
            },
            { 
                name: 'Fool & Bread',
                calories: '160 kcal',
                protein: '8g',
                carbs: '16g',
                fat: '9g',
                imageUrl: 'https://res.cloudinary.com/dsdkaxbl3/image/upload/v1763120284/icoach/foods/fool.jpg',
                description: 'فول + عيش + طحينة'
            }
        ]
    };

    const foodItems = mealDetails[title as keyof typeof mealDetails] || [];

    return (
        <TouchableOpacity style={[mealStyles.card, open && { borderColor: GOLD }]} onPress={() => setOpen(!open)} activeOpacity={0.9}>
            <View style={mealStyles.header}>
                <View><Text style={mealStyles.title}>{title}</Text><Text style={mealStyles.subTitle}>{foodItems.length} foods</Text></View>
                <Feather name={open ? "chevron-up" : "chevron-right"} size={20} color={open ? GOLD : '#666'} />
            </View>
            {open && (
                <View style={mealStyles.content}>
                    {foodItems.map((food, index) => (
                        <View key={index} style={mealStyles.foodItem}>
                            {/* الصورة */}
                            <Image 
                                source={{ uri: food.imageUrl }} 
                                style={mealStyles.foodImg} 
                            />
                            {/* التفاصيل */}
                            <View style={mealStyles.foodDetails}>
                                <Text style={mealStyles.foodName}>{food.name}</Text>
                                <Text style={mealStyles.foodDescription}>{food.description}</Text>
                                <View style={mealStyles.nutritionRow}>
                                    <View style={mealStyles.nutritionItem}>
                                        <Text style={mealStyles.nutritionLabel}>Cal</Text>
                                        <Text style={mealStyles.nutritionValue}>{food.calories}</Text>
                                    </View>
                                    <View style={mealStyles.nutritionItem}>
                                        <Text style={mealStyles.nutritionLabel}>P</Text>
                                        <Text style={mealStyles.nutritionValue}>{food.protein}</Text>
                                    </View>
                                    <View style={mealStyles.nutritionItem}>
                                        <Text style={mealStyles.nutritionLabel}>C</Text>
                                        <Text style={mealStyles.nutritionValue}>{food.carbs}</Text>
                                    </View>
                                    <View style={mealStyles.nutritionItem}>
                                        <Text style={mealStyles.nutritionLabel}>F</Text>
                                        <Text style={mealStyles.nutritionValue}>{food.fat}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: '#000' },
    backgroundImage: { 
      position: 'absolute', 
      top: 0, 
      right: 0, 
      width: '100%', 
      height: '100%', 
      opacity: 0.1,
      resizeMode: 'contain',
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
    welcomeTxt: { color: '#888', fontSize: 16 },
    nameTxt: { color: '#FFF', fontSize: 24, fontWeight: '800' },
    headerBtnsContainer: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    notifBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)' },
    chatbotBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,215,0,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, borderColor: 'rgba(255,215,0,0.2)' },
    storiesContainer: { marginVertical: 25 },
    section: { paddingHorizontal: 20 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
    sectionTitle: { color: '#FFF', fontSize: 20, fontWeight: '700' },
    seeAll: { color: GOLD, fontSize: 14, fontWeight: '500' },
    bottomNav: { position: 'absolute', bottom: 25, left: 20, right: 20, height: 75, backgroundColor: 'rgba(25, 25, 25, 0.95)', borderRadius: 25, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    navItem: { alignItems: 'center' },
    navTxt: { color: GOLD, fontSize: 10, marginTop: 4, fontWeight: '600' },
    navItemCenter: { top: -20 },
    centerCircle: { width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center' },
});

const storyStyles = StyleSheet.create({
    container: { alignItems: 'center', marginRight: 18 },
    ring: { width: 68, height: 68, borderRadius: 34, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    img: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#222' },
    txt: { color: '#BBB', fontSize: 11, fontWeight: '500' },
    add: { position: 'absolute', bottom: 2, right: 2, backgroundColor: GOLD, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1A1A1A' }
});

const mealStyles = StyleSheet.create({
    card: { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { color: '#FFF', fontSize: 17, fontWeight: '700' },
    subTitle: { color: '#666', fontSize: 12, marginTop: 2 },
    content: { marginTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 15, gap: 12 },
    mealImg: { width: 110, height: 110, borderRadius: 15, marginRight: 12 },
    
      
    foodItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,215,0,0.05)', borderRadius: 15, padding: 12, borderWidth: 1, borderColor: 'rgba(255,215,0,0.1)' },
    foodImg: { width: 100, height: 100, borderRadius: 12, marginRight: 12, backgroundColor: '#222' },
    foodDetails: { flex: 1 },
    foodName: { color: GOLD, fontSize: 14, fontWeight: '700', marginBottom: 8 },
    
    
    nutritionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 2, marginTop: 4 },
    nutritionItem: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 6, padding: 4, alignItems: 'center' },
    nutritionLabel: { color: '#888', fontSize: 8, fontWeight: '600', marginBottom: 1 },
    nutritionValue: { color: '#FFF', fontSize: 9, fontWeight: '700' },
    foodDescription: { color: '#AAA', fontSize: 11, marginTop: 2, marginBottom: 4, fontStyle: 'italic' }
});