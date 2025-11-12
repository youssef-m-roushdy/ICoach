import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import i18n from '../i18n/i18n';

type WelcomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeScreenNavigationProp>();
  const { t } = useTranslation();
  const [language, setLanguage] = useState('English');
  const [modalVisible, setModalVisible] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ar', label: 'العربية' },
    { code: 'fr', label: 'Français' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
    { code: 'it', label: 'Italiano' },
  ];

  const selectLanguage = (lang: { code: string; label: string }) => {
    i18n.changeLanguage(lang.code);
    setLanguage(lang.label);
    setModalVisible(false);
  };

  return (
    <ImageBackground
      source={require('../assets/coatch.png')}
      style={styles.background}
      resizeMode="contain"
      imageStyle={styles.image}
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <Image source={require('../assets/icon.png')} style={styles.logo} />
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.languageText}>{language}</Text>
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <Text style={styles.title}>{t('welcome')}</Text>
          <Text style={styles.title}>{t('to')}</Text>
          <Text style={styles.mainTitle}>{t('appName')}</Text>

          <Text style={styles.subtitle}>{t('subtitle')}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.buttonText}>{t('getStarted')}</Text>
          </TouchableOpacity>
        </View>

        <StatusBar style="light" />

        {/* Modal */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <FlatList
                data={languages}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.languageOption}
                    onPress={() => selectLanguage(item)}
                  >
                    <Text style={styles.languageOptionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#000', justifyContent: 'flex-end' },
  image: { marginBottom: 100 },
  overlay: { flex: 1, justifyContent: 'space-between', paddingTop: 50, paddingBottom: 60 },
  header: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 },
  logo: { width: 80, height: 60, resizeMode: 'contain' },
  languageText: { color: '#D4AF37', fontSize: 16, fontWeight: 'bold' },
  content: { alignItems: 'center', paddingHorizontal: 20 },
  title: { color: '#D4AF37', fontSize: 38, fontWeight: 'bold', textTransform: 'lowercase' },
  mainTitle: { color: '#D4AF37', fontSize: 34, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { color: '#ccc', fontSize: 14, textAlign: 'center', marginBottom: 40, width: 300 },
  button: { backgroundColor: '#D4AF37', paddingVertical: 8``, paddingHorizontal: 120, borderRadius: 15 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 28 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#222', borderRadius: 10, padding: 20, width: 250, alignItems: 'center' },
  languageOption: { paddingVertical: 10, width: '100%', alignItems: 'center' },
  languageOptionText: { color: '#D4AF37', fontSize: 18 },
  closeButton: { marginTop: 10, paddingVertical: 10 },
  closeText: { color: '#fff', fontSize: 16 },
});