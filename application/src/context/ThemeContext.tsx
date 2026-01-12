import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'dark' | 'light';

interface ThemeColors {
  background: string;
  bgGradient: string[];
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  card: string;
  border: string;
}

interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const darkTheme: ThemeColors = {
  background: '#000000',
  bgGradient: ['#0F0F0F', '#1A1A1A', '#000000'],
  primary: '#FFD700',
  secondary: '#B8860B',
  text: '#FFFFFF',
  textSecondary: '#E0E0E0',
  card: '#000000',
  border: '#FFD700',
};

const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  bgGradient: ['#F5F5F5', '#FFFFFF', '#FFFFFF'],
  primary: '#1E90FF',
  secondary: '#4169E1',
  text: '#000000',
  textSecondary: '#333333',
  card: '#000000',
  border: '#1E90FF',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>('dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('appTheme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colors = theme === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
