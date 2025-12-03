import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  Animated,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import Ion from 'react-native-vector-icons/Ionicons';
import { COLORS, SIZES } from '../constants';

export default function FoodsScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useState(new Animated.Value(0))[0];

  const openSheet = () => {
    setModalVisible(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const closeSheet = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const openCamera = () => {
    closeSheet();
    launchCamera({ mediaType: 'photo' }, (res) => console.log(res.assets));
  };

  const openGallery = () => {
    closeSheet();
    launchImageLibrary({ mediaType: 'photo' }, (res) => console.log(res.assets));
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🍎 Foods</Text>
        <Text style={styles.subtitle}>Track your nutrition and meals</Text>

        <TouchableOpacity style={styles.card} onPress={openSheet}>
          <Text style={styles.cardTitle}>Food Tracking</Text>
          <Text style={styles.cardText}>Tap to upload a food image</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={openSheet}>
          <Text style={styles.cardTitle}>AI Food Recognition</Text>
          <Text style={styles.cardText}>Tap to scan food</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card} onPress={openSheet}>
          <Text style={styles.cardTitle}>Nutrition Database</Text>
          <Text style={styles.cardText}>Tap to add food photo</Text>
        </TouchableOpacity>
      </View>

      {/* ====== BOTTOM SHEET ====== */}
      <Modal transparent visible={modalVisible} animationType="none">
        <TouchableWithoutFeedback onPress={closeSheet}>
          <View style={styles.modalBackground} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY }] },
          ]}
        >
          <View style={styles.handleBar} />

          <TouchableOpacity style={styles.option} onPress={openCamera}>
            <Icon name="camera" size={28} color="#FFD700" />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.option} onPress={openGallery}>
            <Ion name="images-outline" size={30} color="#FFD700" />
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </Animated.View>
      </Modal>
    </ScrollView>
  );
}

/* ========== STYLES ========== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SIZES.lg,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.gray,
    marginBottom: SIZES.xl,
  },
  card: {
    backgroundColor: COLORS.inputBackground,
    padding: SIZES.lg,
    borderRadius: SIZES.radiusMedium,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  cardTitle: {
    fontSize: SIZES.h3,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  cardText: {
    fontSize: SIZES.body,
    color: COLORS.gray,
  },

  /* ===== Bottom Sheet ===== */
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#222', 
    paddingTop: 12,
    paddingBottom: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleBar: {
    width: 45,
    height: 5,
    backgroundColor: '#666',
    alignSelf: 'center',
    borderRadius: 10,
    marginBottom: 15,
  },
  option: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 25,
    alignItems: 'center',
  },
  optionText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
});