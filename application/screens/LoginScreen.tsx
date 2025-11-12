import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  return (
    <ImageBackground
      source={require('../assets/home.png')}
      style={styles.background}
      resizeMode="contain"
    >
      {/* العنوان فوق */}
      <View style={styles.topRight}>
        <View style={styles.headerTextContainer}>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <Text style={[styles.headerText, styles.inactiveText]}>Sign In</Text>
          </TouchableOpacity>
          <Text style={[styles.headerText, styles.activeText]}>Login</Text>
        </View>
        <View style={styles.underline} />
      </View>

      {/* المحتوى */}
      <View style={styles.formContainer}>
        <Text style={styles.title}>Login</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your username"
          placeholderTextColor="#ccc"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          placeholderTextColor="#ccc"
          secureTextEntry
        />

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  topRight: {
    position: 'absolute',
    top: 60,
    right: 30,
    alignItems: 'flex-end',
  },
  headerTextContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  headerText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'lowercase',
  },
  inactiveText: {
    opacity: 0.6,
  },
  activeText: {
    opacity: 1,
  },
  underline: {
    height: 2,
    width: 45,
    backgroundColor: '#fff',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 40,
    padding: 25,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 220,
  },
  title: {
    color: '#D4AF37',
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    backgroundColor: 'rgba(255, 234, 234, 0.1)',
    padding: 14,
    borderRadius: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#444',
    color: '#fff',
  },
  button: {
    backgroundColor: '#0D0000',
    paddingVertical: 16,
    paddingHorizontal: 50,
    borderRadius: 22,
    marginTop: 15,
  },
  buttonText: {
    color: '#D9D9D9',
    fontWeight: 'bold',
    fontSize: 18,
  },
});