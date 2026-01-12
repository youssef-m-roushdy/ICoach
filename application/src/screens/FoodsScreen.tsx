import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import Ion from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../constants';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { foodService } from '../services/api';
import type { FoodPredictionResponse } from '../services/api';

export default function FoodsScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<FoodPredictionResponse | null>(null);
  const slideAnim = useState(new Animated.Value(0))[0];

  const openSheet = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const predictFood = async (imageUri: string) => {
    setLoading(true);
    try {
      const data = await foodService.predictFood(imageUri);
      setPrediction(data);
      setSelectedImage(imageUri);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to identify food. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openCamera = () => {
    closeSheet();
    launchCamera(
      {
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      },
      (response) => {
        if (response.didCancel) {
          return;
        } else if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets[0].uri) {
          predictFood(response.assets[0].uri);
        }
      }
    );
  };

  const openGallery = () => {
    closeSheet();
    launchImageLibrary(
      {
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      },
      (response) => {
        if (response.didCancel) {
          return;
        } else if (response.errorMessage) {
          Alert.alert('Error', response.errorMessage);
        } else if (response.assets && response.assets[0].uri) {
          predictFood(response.assets[0].uri);
        }
      }
    );
  };

  const clearResult = () => {
    setSelectedImage(null);
    setPrediction(null);
  };

  const formatFoodName = (name: string): string => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>🍎 {t('foods')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>AI-powered food identification</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Identifying food...</Text>
          </View>
        ) : prediction && selectedImage ? (
          <View style={[styles.resultContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Image source={{ uri: selectedImage }} style={styles.foodImage} />
            
            <View style={[styles.predictionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.foodName, { color: colors.text }]}>{formatFoodName(prediction.food_data.name)}</Text>
              <Text style={[styles.confidence, { color: colors.primary }]}>
                Confidence: {(prediction.confidence * 100).toFixed(1)}%
              </Text>
              
              <View style={styles.nutritionGrid}>
                <View style={[styles.nutritionItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Calories</Text>
                  <Text style={[styles.nutritionValue, { color: colors.primary }]}>{prediction.food_data.calories}</Text>
                  <Text style={[styles.nutritionUnit, { color: colors.textSecondary }]}>kcal</Text>
                </View>
                <View style={[styles.nutritionItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Protein</Text>
                  <Text style={[styles.nutritionValue, { color: colors.primary }]}>{prediction.food_data.protein}</Text>
                  <Text style={[styles.nutritionUnit, { color: colors.textSecondary }]}>g</Text>
                </View>
                <View style={[styles.nutritionItem, { backgroundColor: colors.background, borderColor: colors.border }]}>

                  <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Carbs</Text>
                  <Text style={[styles.nutritionValue, { color: colors.primary }]}>{prediction.food_data.carbohydrate}</Text>
                  <Text style={[styles.nutritionUnit, { color: colors.textSecondary }]}>g</Text>
                </View>
                <View style={[styles.nutritionItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Fat</Text>
                  <Text style={[styles.nutritionValue, { color: colors.primary }]}>{prediction.food_data.fat}</Text>
                  <Text style={[styles.nutritionUnit, { color: colors.textSecondary }]}>g</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={[styles.newScanButton, { backgroundColor: colors.primary }]} onPress={clearResult}>
              <Icon name="camera" size={20} color={colors.text === '#FFFFFF' ? '#000000' : '#FFFFFF'} />
              <Text style={[styles.newScanButtonText, { color: colors.text === '#FFFFFF' ? '#000000' : '#FFFFFF' }]}>Scan Another Food</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={[styles.scanCard, { borderColor: colors.primary }]} onPress={openSheet}>
            <Icon name="camera" size={48} color={colors.primary} />
            <Text style={[styles.scanTitle, { color: colors.text }]}>Scan Your Food</Text>
            <Text style={[styles.scanText, { color: colors.textSecondary }]}>
              Take a photo or choose from gallery to identify food and get nutrition info
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ====== BOTTOM SHEET ====== */}
      <Modal transparent visible={modalVisible} animationType="none">
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalBackground} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY }], backgroundColor: colors.background },
          ]}
        >
          <View style={styles.handleBar} />

          <TouchableOpacity style={styles.option} onPress={openCamera}>
            <Icon name="camera" size={28} color={colors.primary} />
            <Text style={[styles.optionText, { color: colors.text }]}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={openGallery}>
            <Ion name="images-outline" size={30} color={colors.primary} />
            <Text style={[styles.optionText, { color: colors.text }]}>Choose from Gallery</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </ScrollView>
  );
}

/* ========== STYLES ========== */
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
  scanCard: {
    backgroundColor: COLORS.inputBackground,
    padding: SIZES.xxl,
    borderRadius: SIZES.radiusMedium,
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  scanTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: SIZES.md,
    marginBottom: SIZES.sm,
  },
  scanText: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingContainer: {
    padding: SIZES.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 250,
  },
  loadingText: {
    fontSize: SIZES.body,
    color: COLORS.primary,
    marginTop: SIZES.md,
  },
  resultContainer: {
    marginBottom: SIZES.lg,
  },
  foodImage: {
    width: '100%',
    height: 250,
    borderRadius: SIZES.radiusMedium,
    marginBottom: SIZES.md,
  },
  predictionCard: {
    backgroundColor: COLORS.inputBackground,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusMedium,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
    marginBottom: SIZES.md,
  },
  foodName: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  confidence: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginBottom: SIZES.lg,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: COLORS.background,
    padding: SIZES.md,
    borderRadius: SIZES.radiusSmall,
    marginBottom: SIZES.sm,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: SIZES.small,
    color: COLORS.gray,
    marginBottom: SIZES.xs,
  },
  nutritionValue: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  nutritionUnit: {
    fontSize: SIZES.small,
    color: COLORS.gray,
  },
  newScanButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: SIZES.radiusMedium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newScanButtonText: {
    fontSize: SIZES.body,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: SIZES.sm,
  },

  /* ===== Bottom Sheet ===== */
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#222', 
    paddingTop: 12,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleBar: {
    width: 45,
    height: 5,
    backgroundColor: '#666',
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 15,
  },
  option: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  optionText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
});