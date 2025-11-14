// API service for backend communication
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

interface LoginCredentials {
  username: string;
  password: string;
}

interface SignUpData extends LoginCredentials {
  email?: string;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async signUp(data: SignUpData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Sign up failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },
};
