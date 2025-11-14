import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { COLORS, SIZES } from '../../constants';

interface CustomInputProps extends TextInputProps {
  placeholder: string;
}

export const CustomInput: React.FC<CustomInputProps> = ({ placeholder, ...props }) => {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={COLORS.gray}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    backgroundColor: COLORS.inputBackground,
    padding: 14,
    borderRadius: SIZES.radiusSmall,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
    color: COLORS.white,
  },
});
