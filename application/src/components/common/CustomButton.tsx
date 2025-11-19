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
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: COLORS.white,
    fontSize: 20,
    textTransform: 'uppercase',
  },
  secondaryText: {
    color: COLORS.lightGray,
    fontSize: SIZES.h4,
  },
});
