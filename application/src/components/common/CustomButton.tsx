import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

export const CustomButton: React.FC<CustomButtonProps> = ({ 
  title, 
  variant = 'secondary',
  ...props 
}) => {
  return (
    <TouchableOpacity 
      style={[styles.button, variant === 'primary' ? styles.primaryButton : styles.secondaryButton]}
      {...props}
    >
      <Text style={[styles.buttonText, variant === 'primary' ? styles.primaryText : styles.secondaryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: SIZES.radiusXLarge,
    marginTop: 15,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 120,
    borderRadius: SIZES.radiusLarge,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 50,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  primaryText: {
    color: COLORS.white,
    fontSize: 28,
  },
  secondaryText: {
    color: COLORS.lightGray,
    fontSize: SIZES.h4,
  },
});
