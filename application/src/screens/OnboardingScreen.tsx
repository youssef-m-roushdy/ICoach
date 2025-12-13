import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Image, } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { CustomInput, CustomButton } from '../components/common';
import { COLORS, SIZES } from '../constants';
import { userService } from '../services';
import { useAuth } from '../context';

type OnboardingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
const maleImageSource = require('../../assets/male.png'); 
const femaleImageSource = require('../../assets/female.png'); 

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingNavigationProp>();
  const { user, token, updateUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

   const [gender, setGender] = useState<'male' | 'female' | ''>('');
  const [dateOfBirth, setDateOfBirth] = useState('25-11-2004');

  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFatPercentage, setBodyFatPercentage] = useState('');

  
  const [fitnessGoal, setFitnessGoal] = useState<'weight_loss' | 'muscle_gain' | 'maintenance' | ''>('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active' | ''>('');

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

      
      if (gender) bodyData.gender = gender;
      if (dateOfBirth) bodyData.dateOfBirth = dateOfBirth;

      
      if (height) bodyData.height = parseFloat(height);
      if (weight) bodyData.weight = parseFloat(weight);
      if (bodyFatPercentage) bodyData.bodyFatPercentage = parseFloat(bodyFatPercentage);

     
      if (fitnessGoal) bodyData.fitnessGoal = fitnessGoal;
      if (activityLevel) bodyData.activityLevel = activityLevel;

     
      if (Object.keys(bodyData).length > 0) {
        const response = await userService.updateBodyInformation(bodyData, token);
        
       
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
            currentStep === step && styles.stepDotActive,
            currentStep > step && styles.stepDotCompleted,
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      <View style={styles.optionsRowCenter}>
        
      
        <TouchableOpacity
          style={[
            styles.genderOptionButton, 
            { borderColor: gender === 'male' ? COLORS.primary : COLORS.inputBackground } 
          ]}
          onPress={() => setGender('male')}
        >
         
          <View 
            style={[
              styles.genderImageArea, 
              { backgroundColor: gender === 'male' ? COLORS.primary : COLORS.inputBackground }
            ]}
          >
           
            <Image 
              source={maleImageSource} 
              style={styles.genderImage}
              resizeMode="contain" 
            />
          </View>

          
          <Text 
            style={[
              styles.genderLabelText, 
              { color: gender === 'male' ? COLORS.primary : COLORS.white }
            ]}
          >
            Male
          </Text>
        </TouchableOpacity>

       
        <TouchableOpacity
          style={[
            styles.genderOptionButton, 
            { borderColor: gender === 'female' ? COLORS.primary : COLORS.inputBackground } 
          ]}
          onPress={() => setGender('female')}
        >
          
          <View 
            style={[
              styles.genderImageArea, 
              { backgroundColor: gender === 'female' ? COLORS.primary : COLORS.inputBackground } 
            ]}
          >
          
            <Image 
              source={femaleImageSource} 
              style={styles.genderImage}
              resizeMode="contain"
            />
          </View>
          
           <Text 
            style={[
              styles.genderLabelText, 
              { color: gender === 'female' ? COLORS.primary : COLORS.white }
            ]}
          >
            Female
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.label, { marginTop: SIZES.xl }]}>Date of Birth (YYYY-MM-DD)</Text>
      <CustomInput
        placeholder="YYYY-MM-DD"
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
    <View style={styles.container}>
       {currentStep > 1 && (
        <TouchableOpacity style={styles.backButtonTop} onPress={handleBack}>
          <MaterialIcons name="arrow-back-ios" size={24} color={COLORS.white} />
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {renderStepIndicator()}

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <View style={styles.buttonContainer}>
        {isLoading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <CustomButton
              title={currentStep === 3 ? 'Finish' : 'Next'}
              onPress={handleNext}
           disabled={currentStep === 1 && !gender} 
              buttonStyle={styles.customButtonStyle}
              textStyle={styles.customButtonTextStyle}
            />
          )}
        </View>

        <CustomButton
          title="Skip for now"
          onPress={handleSkip}
          buttonStyle={styles.skipButtonStyle}
          textStyle={styles.skipButtonTextStyle}
        />
        
        <View style={styles.bottomBar} /> 

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
    paddingHorizontal: SIZES.xl,
    paddingTop: SIZES.lg,
    paddingBottom: SIZES.xxl,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xl * 2,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gray,
    marginHorizontal: 4,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  stepDotCompleted: {
    backgroundColor: COLORS.primary,
  },
  stepContainer: {},
  stepTitle: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginBottom: SIZES.xl * 2,
    textAlign: 'center',
  },
  label: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginBottom: SIZES.sm,
    marginTop: SIZES.md,
    textAlign: 'left',
  },
  
  optionsRowCenter: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SIZES.lg,
    marginBottom: SIZES.md,
  },
  genderOptionButton: {
    flex: 1,
    maxWidth: 150,
    backgroundColor: COLORS.background, 
    padding: 0, 
    borderRadius: SIZES.radiusSmall, 
    borderWidth: 2, 
    borderColor: COLORS.inputBackground, 
    alignItems: 'center',
    overflow: 'hidden', 
  },
 
  genderImageArea: {
    width: '100%',
    height: 150, 
    justifyContent: 'center',
    alignItems: 'center',
   },
  
   genderImage: {
    width: '100%', 
    height: '100%',
  },

  genderLabelText: {
    color: COLORS.white,
    fontWeight: 'bold',
    paddingVertical: SIZES.md,
    fontSize: SIZES.body,
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
    backgroundColor: COLORS.inputBackground,
    padding: SIZES.md,
    borderRadius: SIZES.radiusSmall,
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
    marginTop: SIZES.xl * 2,
    marginBottom: SIZES.md,
  },
  customButtonStyle: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusSmall,
    paddingVertical: SIZES.md,
  },
  customButtonTextStyle: {
    color: COLORS.background,
    fontSize: SIZES.h3,
    fontWeight: 'bold',
  },
  skipButtonStyle: {
    backgroundColor: 'transparent',
    alignSelf: 'center',
    padding: SIZES.sm,  borderWidth: 0, 
  },
  skipButtonTextStyle: {
    color: COLORS.gray,
    fontSize: SIZES.body,
    textDecorationLine: 'underline',
  },

  backButtonTop: {
    position: 'absolute',
    top: 50,
    left: SIZES.xl,
    zIndex: 10,
    padding: SIZES.sm,
  },
  bottomBar: {
    height: 4,
    width: 100,
    backgroundColor: COLORS.white,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SIZES.xl,
  },
});