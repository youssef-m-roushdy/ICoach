import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  PanResponder,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { CustomInput, CustomButton } from '../components/common';
import { COLORS, SIZES } from '../constants';
import { userService } from '../services';
import { useAuth } from '../context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { user, token, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Personal Information
  const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Step 2: Body Measurements
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');

  // Step 3: Fitness Goals
  const [fitnessGoal, setFitnessGoal] = useState<'weight_loss' | 'muscle_gain' | 'maintenance' | ''>('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | ''>('');

  // Swipe gesture handler
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Activate if horizontal swipe is more than 20px
      return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
    },
    onPanResponderRelease: (evt, gestureState) => {
      const { dx } = gestureState;
      const swipeThreshold = SCREEN_WIDTH * 0.25; // 25% of screen width

      if (dx > swipeThreshold) {
        // Swipe right - go back
        handleBack();
      } else if (dx < -swipeThreshold) {
        // Swipe left - go next
        handleNext();
      }
    },
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigation.replace('Home');
  };

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Error', 'Authentication token not found');
      return;
    }

    setIsLoading(true);
    try {
      const bodyData: any = {};

      // Add data from step 1
      if (gender) bodyData.gender = gender;
      if (dateOfBirth) bodyData.dateOfBirth = dateOfBirth;

      // Add data from step 2
      if (height) bodyData.height = parseFloat(height);
      if (weight) bodyData.weight = parseFloat(weight);
      if (bodyFatPercentage) bodyData.bodyFatPercentage = parseFloat(bodyFatPercentage);

      // Add data from step 3
      if (fitnessGoal) bodyData.fitnessGoal = fitnessGoal;
      if (activityLevel) bodyData.activityLevel = activityLevel;

      // Only submit if at least one field is filled
      if (Object.keys(bodyData).length > 0) {
        const response = await userService.updateBodyInformation(bodyData, token);
        
        // Update user context with the new data
        if (response.data && user) {
          updateUser({ ...user, ...response.data });
        }
        
        Alert.alert('Success', 'Profile completed successfully!', [
          { text: 'OK', onPress: () => navigation.replace('Home') }
        ]);
      } else {
        navigation.replace('Home');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.stepDot,
            step <= currentStep && styles.stepDotActive,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      <Text style={styles.label}>Gender</Text>
      <View style={styles.optionsRow}>
        <TouchableOpacity
          style={[styles.optionButton, gender === 'male' && styles.optionButtonActive]}
          onPress={() => setGender('male')}
        >
          <Text style={[styles.optionText, gender === 'male' && styles.optionTextActive]}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, gender === 'female' && styles.optionButtonActive]}
          onPress={() => setGender('female')}
        >
          <Text style={[styles.optionText, gender === 'female' && styles.optionTextActive]}>Female</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
      <CustomInput
        placeholder="1990-01-01"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Body Measurements</Text>
      <Text style={styles.stepSubtitle}>Help us personalize your experience</Text>

      <Text style={styles.label}>Height (cm)</Text>
      <CustomInput
        placeholder="170"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Weight (kg)</Text>
      <CustomInput
        placeholder="70"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Body Fat Percentage (optional)</Text>
      <CustomInput
        placeholder="15"
        value={bodyFatPercentage}
        onChangeText={setBodyFatPercentage}
        keyboardType="numeric"
      />
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Fitness Goals</Text>
      <Text style={styles.stepSubtitle}>What are you aiming for?</Text>

      <Text style={styles.label}>Fitness Goal</Text>
      <View style={styles.optionsColumn}>
        <TouchableOpacity
          style={[styles.optionButton, fitnessGoal === 'weight_loss' && styles.optionButtonActive]}
          onPress={() => setFitnessGoal('weight_loss')}
        >
          <Text style={[styles.optionText, fitnessGoal === 'weight_loss' && styles.optionTextActive]}>
            Weight Loss
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, fitnessGoal === 'muscle_gain' && styles.optionButtonActive]}
          onPress={() => setFitnessGoal('muscle_gain')}
        >
          <Text style={[styles.optionText, fitnessGoal === 'muscle_gain' && styles.optionTextActive]}>
            Muscle Gain
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, fitnessGoal === 'maintenance' && styles.optionButtonActive]}
          onPress={() => setFitnessGoal('maintenance')}
        >
          <Text style={[styles.optionText, fitnessGoal === 'maintenance' && styles.optionTextActive]}>
            Maintenance
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Activity Level</Text>
      <View style={styles.optionsColumn}>
        <TouchableOpacity
          style={[styles.optionButton, activityLevel === 'sedentary' && styles.optionButtonActive]}
          onPress={() => setActivityLevel('sedentary')}
        >
          <Text style={[styles.optionText, activityLevel === 'sedentary' && styles.optionTextActive]}>
            Sedentary
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, activityLevel === 'lightly_active' && styles.optionButtonActive]}
          onPress={() => setActivityLevel('lightly_active')}
        >
          <Text style={[styles.optionText, activityLevel === 'lightly_active' && styles.optionTextActive]}>
            Lightly Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, activityLevel === 'moderately_active' && styles.optionButtonActive]}
          onPress={() => setActivityLevel('moderately_active')}
        >
          <Text style={[styles.optionText, activityLevel === 'moderately_active' && styles.optionTextActive]}>
            Moderately Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, activityLevel === 'very_active' && styles.optionButtonActive]}
          onPress={() => setActivityLevel('very_active')}
        >
          <Text style={[styles.optionText, activityLevel === 'very_active' && styles.optionTextActive]}>
            Very Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, activityLevel === 'extra_active' && styles.optionButtonActive]}
          onPress={() => setActivityLevel('extra_active')}
        >
          <Text style={[styles.optionText, activityLevel === 'extra_active' && styles.optionTextActive]}>
            Extra Active
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {currentStep === 3 && (
          <View style={styles.finishButtonContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : (
              <TouchableOpacity style={styles.finishButton} onPress={handleSubmit}>
                <Text style={styles.finishButtonText}>Finish</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.xl,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: SIZES.xl,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.gray,
    marginHorizontal: 6,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepContainer: {
    marginBottom: SIZES.xl,
  },
  stepTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginBottom: SIZES.xl,
    textAlign: 'center',
  },
  label: {
    fontSize: SIZES.body,
    color: COLORS.white,
    marginBottom: SIZES.sm,
    marginTop: SIZES.md,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.md,
  },
  optionsColumn: {
    marginBottom: SIZES.md,
  },
  optionButton: {
    flex: 1,
    backgroundColor: COLORS.inputBackground,
    padding: SIZES.md,
    borderRadius: SIZES.radiusSmall,
    marginHorizontal: 4,
    marginVertical: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
  },
  optionText: {
    color: COLORS.white,
    textAlign: 'center',
    fontSize: SIZES.body,
  },
  optionTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusSmall,
    gap: SIZES.sm,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusSmall,
    gap: SIZES.sm,
  },
  nextButtonText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  finishButtonContainer: {
    marginTop: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  finishButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButtonText: {
    color: COLORS.white,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  skipButton: {
    alignSelf: 'center',
    marginTop: SIZES.lg,
    padding: SIZES.sm,
  },
  skipText: {
    color: COLORS.gray,
    fontSize: SIZES.body,
    textDecorationLine: 'underline',
  },
});