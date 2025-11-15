import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Linking } from 'react-native';
import { COLORS, SIZES } from '../../constants';
import { authService } from '../../services';

export const GoogleButton: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      const googleUrl = authService.getGoogleOAuthUrl();
      const canOpen = await Linking.canOpenURL(googleUrl);
      
      if (canOpen) {
        await Linking.openURL(googleUrl);
      } else {
        console.error('Cannot open Google OAuth URL');
      }
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  return (
    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
      <View style={styles.iconContainer}>
        <Text style={styles.googleIcon}>G</Text>
      </View>
      <Text style={styles.googleButtonText}>Continue with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: SIZES.radiusSmall,
    marginTop: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: SIZES.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    color: COLORS.background,
    fontSize: SIZES.body,
    fontWeight: '600',
  },
});
