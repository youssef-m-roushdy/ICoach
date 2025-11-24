// API service for backend communication
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: any;
    accessToken: string;
    refreshToken?: string;
  };
}

export const authService = {
  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      return result;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Logout user
  async logout(token: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/v1/users/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },

  // Refresh token
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Token refresh failed');
      }
      
      return result;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  },

  // Forgot password
  async forgotPassword(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Request failed');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  // Google OAuth - Get the OAuth URL
  getGoogleOAuthUrl(): string {
    return `${API_BASE_URL}/v1/auth/google`;
  },

  // Resend verification email
  async resendVerification(email: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to resend verification');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  },
};

interface BodyInformationData {
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  fitnessGoal?: 'weight_loss' | 'muscle_gain' | 'maintenance';
  activityLevel?: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  bodyFatPercentage?: number;
}

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
  bio?: string;
  phone?: string;
  avatar?: string;
}

export const userService = {
  // Get user profile
  async getProfile(token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to get profile');
      }
      
      return result;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(data: UpdateProfileData, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }
      
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Update body information
  async updateBodyInformation(data: BodyInformationData, token: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/users/body-information`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update body information');
      }
      
      return result;
    } catch (error) {
      console.error('Update body information error:', error);
      throw error;
    }
  },
};
