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
