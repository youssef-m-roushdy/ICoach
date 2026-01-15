/**
 * LiveWorkoutScreen - AI Fitness Engine Test Screen
 * 
 * This screen demonstrates the AI Fitness Engine with:
 * 1. Camera preview
 * 2. Exercise selection
 * 3. Simulated pose landmarks for testing
 * 4. Real-time feedback display
 * 
 * Note: For production, integrate with a real pose detection library
 * like MediaPipe or TensorFlow.js
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  Modal,
  FlatList,
} from 'react-native';
import { Camera, useCameraDevices, useCameraPermission } from 'react-native-vision-camera';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {
  AIFitnessEngine,
  getFeedbackForCode,
  ExerciseLogic,
  ExerciseResult,
  Landmark,
  voiceFeedback,
} from '../services/aiFitnessEngine';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Supported exercises
const EXERCISES = AIFitnessEngine.getSupportedExercises();

const LiveWorkoutScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const { hasPermission, requestPermission } = useCameraPermission();
  const devices = useCameraDevices();
  const device = devices.find((d) => d.position === 'front') || devices[0];

  // State
  const [selectedExercise, setSelectedExercise] = useState<string>('squat');
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [result, setResult] = useState<ExerciseResult | null>(null);
  const [feedback, setFeedback] = useState({ message: 'Select an exercise' });

  // Exercise logic ref
  const trainerRef = useRef<ExerciseLogic | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFeedbackRef = useRef<string>(''); // Track last feedback to avoid repeating

  // Initialize voice feedback on mount
  useEffect(() => {
    voiceFeedback.initialize();
  }, []);

  // Initialize trainer when exercise changes
  useEffect(() => {
    trainerRef.current = AIFitnessEngine.getTrainer(selectedExercise);
    setResult(null);
    setFeedback({ message: `Ready for ${selectedExercise.replace('_', ' ')}` });
  }, [selectedExercise]);

  // Request camera permission
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  /**
   * Generate simulated landmarks for testing
   * In production, these come from pose detection (MediaPipe/TensorFlow)
   */
  const generateSimulatedLandmarks = (phase: 'up' | 'down' | 'middle'): Landmark[] => {
    // Create 33 landmarks (MediaPipe Pose has 33 points)
    const landmarks: Landmark[] = Array(33).fill(null).map(() => ({
      x: 0.5,
      y: 0.5,
      z: 0,
      visibility: 0.9,
    }));

    // Simulate different exercise phases
    if (selectedExercise === 'squat') {
      // Key points for squat: hip (23), knee (25), ankle (27)
      if (phase === 'up') {
        // Standing position
        landmarks[23] = { x: 0.5, y: 0.4, visibility: 0.9 }; // Hip high
        landmarks[25] = { x: 0.5, y: 0.6, visibility: 0.9 }; // Knee
        landmarks[27] = { x: 0.5, y: 0.85, visibility: 0.9 }; // Ankle
        landmarks[0] = { x: 0.5, y: 0.1, visibility: 0.9 }; // Nose (visible)
      } else if (phase === 'down') {
        // Squat down position
        landmarks[23] = { x: 0.5, y: 0.6, visibility: 0.9 }; // Hip low
        landmarks[25] = { x: 0.5, y: 0.6, visibility: 0.9 }; // Knee at hip level
        landmarks[27] = { x: 0.5, y: 0.85, visibility: 0.9 }; // Ankle
        landmarks[0] = { x: 0.5, y: 0.2, visibility: 0.9 }; // Nose
      }
    } else if (selectedExercise === 'jumping_jacks') {
      // Key points: shoulders, elbows, hips, knees, ankles
      // Logic: ankleDist > shDist * 1.5 && angLSh > 150 for UP
      // Logic: ankleDist < shDist * 1.0 for DOWN (count rep)
      if (phase === 'up') {
        // Arms up (wide angle), legs apart (wide stance)
        landmarks[11] = { x: 0.35, y: 0.3, visibility: 0.9 }; // Left shoulder
        landmarks[12] = { x: 0.65, y: 0.3, visibility: 0.9 }; // Right shoulder (shDist = 0.3)
        landmarks[13] = { x: 0.15, y: 0.15, visibility: 0.9 }; // Left elbow (up and out for angle > 150)
        landmarks[14] = { x: 0.85, y: 0.15, visibility: 0.9 }; // Right elbow (up and out)
        landmarks[23] = { x: 0.4, y: 0.5, visibility: 0.9 }; // Left hip
        landmarks[24] = { x: 0.6, y: 0.5, visibility: 0.9 }; // Right hip
        landmarks[25] = { x: 0.35, y: 0.7, visibility: 0.9 }; // Left knee
        landmarks[26] = { x: 0.65, y: 0.7, visibility: 0.9 }; // Right knee
        landmarks[27] = { x: 0.1, y: 0.9, visibility: 0.9 }; // Left ankle (apart) 
        landmarks[28] = { x: 0.9, y: 0.9, visibility: 0.9 }; // Right ankle (ankleDist = 0.8 > 0.3*1.5=0.45 ✓)
      } else if (phase === 'down') {
        // Arms down, legs together
        landmarks[11] = { x: 0.4, y: 0.3, visibility: 0.9 }; // Left shoulder
        landmarks[12] = { x: 0.6, y: 0.3, visibility: 0.9 }; // Right shoulder (shDist = 0.2)
        landmarks[13] = { x: 0.38, y: 0.5, visibility: 0.9 }; // Left elbow (down)
        landmarks[14] = { x: 0.62, y: 0.5, visibility: 0.9 }; // Right elbow (down)
        landmarks[23] = { x: 0.45, y: 0.5, visibility: 0.9 }; // Left hip
        landmarks[24] = { x: 0.55, y: 0.5, visibility: 0.9 }; // Right hip
        landmarks[25] = { x: 0.47, y: 0.7, visibility: 0.9 }; // Left knee
        landmarks[26] = { x: 0.53, y: 0.7, visibility: 0.9 }; // Right knee
        landmarks[27] = { x: 0.48, y: 0.9, visibility: 0.9 }; // Left ankle (together)
        landmarks[28] = { x: 0.52, y: 0.9, visibility: 0.9 }; // Right ankle (ankleDist = 0.04 < 0.2*1.0=0.2 ✓)
      }
    } else if (selectedExercise === 'high_plank' || selectedExercise === 'elbow_plank') {
      // Horizontal position
      landmarks[11] = { x: 0.2, y: 0.4, visibility: 0.9 }; // Shoulder
      landmarks[13] = { x: 0.15, y: 0.5, visibility: 0.9 }; // Elbow
      landmarks[15] = { x: 0.1, y: 0.55, visibility: 0.9 }; // Wrist
      landmarks[23] = { x: 0.5, y: 0.45, visibility: 0.9 }; // Hip
      landmarks[25] = { x: 0.7, y: 0.5, visibility: 0.9 }; // Knee
      landmarks[27] = { x: 0.9, y: 0.55, visibility: 0.9 }; // Ankle
    }

    return landmarks;
  };

  /**
   * Start/Stop the workout simulation
   */
  const toggleWorkout = useCallback(() => {
    if (isActive) {
      // Stop
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
      setIsActive(false);
      voiceFeedback.stop();
      setFeedback({ message: 'Workout paused' });
    } else {
      // Start
      setIsActive(true);
      trainerRef.current?.reset?.();
      lastFeedbackRef.current = '';

      let phase: 'up' | 'down' = 'up';
      let frameCount = 0;

      // Simulate pose detection at ~10fps
      simulationIntervalRef.current = setInterval(() => {
        if (!trainerRef.current) return;

        // Alternate phases every 15 frames (~1.5 seconds)
        frameCount++;
        if (frameCount % 15 === 0) {
          phase = phase === 'up' ? 'down' : 'up';
        }

        const landmarks = generateSimulatedLandmarks(phase);
        const analysisResult = trainerRef.current.analyze(landmarks);
        
        setResult(analysisResult);
        const fb = getFeedbackForCode(analysisResult.feedback_code, analysisResult.exercise);
        setFeedback(fb);

        // Speak feedback only if it changed (to avoid repeating same message)
        if (fb.message !== lastFeedbackRef.current) {
          lastFeedbackRef.current = fb.message;
          voiceFeedback.speak(fb.message, { gender: 'female' });
        }
      }, 100);
    }
  }, [isActive, selectedExercise]);

  /**
   * Reset the workout
   */
  const resetWorkout = useCallback(() => {
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
    setIsActive(false);
    voiceFeedback.stop();
    trainerRef.current?.reset?.();
    lastFeedbackRef.current = '';
    setResult(null);
    setFeedback({ message: `Ready for ${selectedExercise.replace('_', ' ')}` });
  }, [selectedExercise]);

  // Get display values
  const reps = (result as any)?.reps ?? 0;
  const timer = (result as any)?.timer ?? 0;
  const isTimerExercise = selectedExercise.includes('plank');
  const stage = (result as any)?.stage ?? '-';
  const isCorrect = (result as any)?.is_correct ?? true;

  // Render exercise selector modal
  const renderExerciseModal = () => (
    <Modal
      visible={showExerciseModal}
      animationType="slide"
      transparent
      onRequestClose={() => setShowExerciseModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>Select Exercise</Text>
          <FlatList
            data={EXERCISES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.exerciseItem,
                  item === selectedExercise && { backgroundColor: colors.primary + '30' },
                ]}
                onPress={() => {
                  setSelectedExercise(item);
                  setShowExerciseModal(false);
                }}
              >
                <Text style={[styles.exerciseItemText, { color: colors.text }]}>
                  {item.replace('_', ' ').toUpperCase()}
                </Text>
                {item === selectedExercise && (
                  <Ionicons name="checkmark" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowExerciseModal(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Permission not granted
  if (!hasPermission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionText, { color: colors.text }]}>
          Camera permission required
        </Text>
        <TouchableOpacity
          style={[styles.permissionButton, { backgroundColor: colors.primary }]}
          onPress={requestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // No camera device
  if (!device) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.permissionText, { color: colors.text }]}>
          No camera device found
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Camera Preview */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
      />

      {/* Overlay UI */}
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exerciseSelector}
            onPress={() => setShowExerciseModal(true)}
          >
            <Text style={styles.exerciseName}>
              {selectedExercise.replace('_', ' ').toUpperCase()}
            </Text>
            <Ionicons name="chevron-down" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetWorkout}>
            <Ionicons name="refresh" size={28} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Stats Display */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {isTimerExercise ? `${timer}s` : reps}
            </Text>
            <Text style={styles.statLabel}>
              {isTimerExercise ? 'TIME' : 'REPS'}
            </Text>
          </View>
          <View style={[styles.statBox, !isCorrect && styles.statBoxError]}>
            <Text style={styles.statValue}>{stage.toUpperCase()}</Text>
            <Text style={styles.statLabel}>STAGE</Text>
          </View>
        </View>

        {/* Feedback Display */}
        <View style={[
          styles.feedbackContainer,
          !isCorrect && styles.feedbackError
        ]}>
          <Text style={styles.feedbackText}>{feedback.message}</Text>
          {isActive && (
            <Text style={styles.audioHint}>🔊 Voice feedback enabled</Text>
          )}
        </View>

        {/* Start/Stop Button */}
        <TouchableOpacity
          style={[
            styles.actionButton,
            isActive ? styles.stopButton : styles.startButton,
          ]}
          onPress={toggleWorkout}
        >
          <Ionicons
            name={isActive ? 'pause' : 'play'}
            size={40}
            color="#fff"
          />
          <Text style={styles.actionButtonText}>
            {isActive ? 'PAUSE' : 'START'}
          </Text>
        </TouchableOpacity>

        {/* Debug Info */}
        {result && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Debug: {(result as any).debug_class || result.feedback_code}
            </Text>
          </View>
        )}

        {/* Simulation Notice */}
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            ⚠️ SIMULATION MODE - Landmarks are simulated for testing
          </Text>
        </View>
      </View>

      {renderExerciseModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  exerciseSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  exerciseName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 5,
  },
  resetButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  statBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 120,
  },
  statBoxError: {
    backgroundColor: 'rgba(255,50,50,0.7)',
  },
  statValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#aaa',
    fontSize: 14,
    marginTop: 5,
  },
  feedbackContainer: {
    backgroundColor: 'rgba(0,150,0,0.8)',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  feedbackError: {
    backgroundColor: 'rgba(200,50,50,0.8)',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  audioHint: {
    color: '#ddd',
    fontSize: 12,
    marginTop: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    borderRadius: 30,
    gap: 10,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  debugContainer: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 10,
  },
  debugText: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  noticeContainer: {
    backgroundColor: 'rgba(255,165,0,0.8)',
    padding: 10,
    borderRadius: 10,
  },
  noticeText: {
    color: '#000',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  exerciseItemText: {
    fontSize: 18,
  },
  closeButton: {
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default LiveWorkoutScreen;
