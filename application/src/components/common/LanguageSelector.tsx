import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../../i18n/i18n';
import { COLORS, SIZES } from '../../constants';

interface Language {
  code: string;
  label: string;
}

const languages: Language[] = [
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'es', label: 'Español' },
  { code: 'it', label: 'Italiano' },
];

export const LanguageSelector: React.FC = () => {
  const { i18n: i18nInstance } = useTranslation();
  const [language, setLanguage] = useState('English');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Load saved language on component mount
    loadSavedLanguage();
  }, []);

  useEffect(() => {
    // Update language display when language changes
    const currentLangCode = i18nInstance.language;
    const langItem = languages.find(l => l.code === currentLangCode);
    if (langItem) {
      setLanguage(langItem.label);
    }
  }, [i18nInstance.language]);

  const loadSavedLanguage = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang) {
        const langItem = languages.find(l => l.code === savedLang);
        if (langItem) {
          setLanguage(langItem.label);
          await i18n.changeLanguage(savedLang);
        }
      }
    } catch (error) {
      console.error('Failed to load language:', error);
    }
  };

  const selectLanguage = async (lang: Language) => {
    try {
      await i18n.changeLanguage(lang.code);
      await AsyncStorage.setItem('appLanguage', lang.code);
      setLanguage(lang.label);
      setModalVisible(false);
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  return (
    <>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <Text style={styles.languageText}>{language}</Text>
      </TouchableOpacity>

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
    </>
  );
};

const styles = StyleSheet.create({
  languageText: {
    color: COLORS.primary,
    fontSize: SIZES.body,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.modalOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: COLORS.modalBackground,
    borderRadius: 10,
    padding: 20,
    width: 250,
    alignItems: 'center',
  },
  languageOption: {
    paddingVertical: 10,
    width: '100%',
    alignItems: 'center',
  },
  languageOptionText: {
    color: COLORS.primary,
    fontSize: SIZES.h4,
  },
  closeButton: {
    marginTop: 10,
    paddingVertical: 10,
  },
  closeText: {
    color: COLORS.white,
    fontSize: SIZES.body,
  },
});
