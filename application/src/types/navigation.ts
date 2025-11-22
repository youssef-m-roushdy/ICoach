export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  EditBodyInfo: undefined;
  Onboarding: undefined;
  AuthCallback: {
    token: string;
    user: string;
  };
};

export type AuthStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  Login: undefined;
};

export type MainStackParamList = {
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  EditBodyInfo: undefined;
  Onboarding: undefined;
};

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  fitnessGoal?: 'weight_loss' | 'muscle_gain' | 'maintenance';
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  bodyFatPercentage?: number;
  bio?: string;
  phone?: string;
  avatar?: string;
  bmi?: number;
  role?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  authProvider?: string;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
}
