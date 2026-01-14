/**
 * AI Fitness Engine - Voice Feedback Service
 * Text-to-Speech service using expo-speech for voice feedback
 * Supports male/female voice selection
 */

import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { getFeedbackForCode } from './feedbackMapping';

export type VoiceGender = 'male' | 'female';

export interface VoiceInfo {
  identifier: string;
  name: string;
  quality: string;
  language: string;
}

export interface VoiceFeedbackOptions {
  gender?: VoiceGender;
  rate?: number; // 0.1 - 2.0, default 1.0
  pitch?: number; // 0.5 - 2.0, default 1.0
  language?: string; // e.g., 'en-US', 'ar-SA'
}

class VoiceFeedbackService {
  private maleVoiceId: string | null = null;
  private femaleVoiceId: string | null = null;
  private availableVoices: Speech.Voice[] = [];
  private isInitialized = false;
  private defaultGender: VoiceGender = 'female';
  private defaultRate = 0.9;
  private defaultPitch = 1.0;
  private defaultLanguage = 'en-US';

  /**
   * Initialize the voice feedback service
   * Must be called before using speak methods
   */
  async initialize(): Promise<void> {
    try {
      this.availableVoices = await Speech.getAvailableVoicesAsync();

      // Find appropriate male and female voices
      this.findVoicesByGender();

      this.isInitialized = true;
      console.log('[VoiceFeedback] Initialized successfully');
      console.log(`[VoiceFeedback] Male voice: ${this.maleVoiceId || 'default'}`);
      console.log(`[VoiceFeedback] Female voice: ${this.femaleVoiceId || 'default'}`);
    } catch (error) {
      console.error('[VoiceFeedback] Failed to initialize:', error);
      this.isInitialized = true; // Still allow usage with default system voice
    }
  }

  /**
   * Find male and female voices based on platform
   */
  private findVoicesByGender(): void {
    if (Platform.OS === 'ios') {
      // iOS common voices
      const femaleNames = ['Samantha', 'Karen', 'Moira', 'Tessa', 'Fiona'];
      const maleNames = ['Daniel', 'Alex', 'Fred', 'Tom', 'Oliver'];

      this.femaleVoiceId =
        this.availableVoices.find((v) =>
          femaleNames.some((name) => v.identifier.includes(name) || v.name?.includes(name))
        )?.identifier || null;

      this.maleVoiceId =
        this.availableVoices.find((v) =>
          maleNames.some((name) => v.identifier.includes(name) || v.name?.includes(name))
        )?.identifier || null;
    } else {
      // Android - voices vary by device, try common patterns
      const englishVoices = this.availableVoices.filter(
        (v) => v.language?.startsWith('en') || v.identifier?.includes('en')
      );

      // Try to find female voice
      this.femaleVoiceId =
        englishVoices.find(
          (v) =>
            v.name?.toLowerCase().includes('female') ||
            v.identifier?.toLowerCase().includes('female') ||
            v.name?.toLowerCase().includes('woman')
        )?.identifier || null;

      // Try to find male voice
      this.maleVoiceId =
        englishVoices.find(
          (v) =>
            (v.name?.toLowerCase().includes('male') &&
              !v.name?.toLowerCase().includes('female')) ||
            (v.identifier?.toLowerCase().includes('male') &&
              !v.identifier?.toLowerCase().includes('female')) ||
            v.name?.toLowerCase().includes('man')
        )?.identifier || null;

      // If not found by name, use first two English voices
      if (!this.femaleVoiceId && englishVoices.length > 0) {
        this.femaleVoiceId = englishVoices[0].identifier;
      }
      if (!this.maleVoiceId && englishVoices.length > 1) {
        this.maleVoiceId = englishVoices[1].identifier;
      }
    }
  }

  /**
   * Get the appropriate voice ID for a gender
   */
  private getVoiceId(gender: VoiceGender): string | undefined {
    return gender === 'male' ? this.maleVoiceId || undefined : this.femaleVoiceId || undefined;
  }

  /**
   * Speak a message with the specified options
   *
   * @param message - The text to speak
   * @param options - Voice options (gender, rate, pitch, language)
   *
   * @example
   * ```typescript
   * await voiceFeedback.speak('Lower your hips more', { gender: 'female' });
   * ```
   */
  async speak(message: string, options: VoiceFeedbackOptions = {}): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const { gender = this.defaultGender, rate = this.defaultRate, pitch = this.defaultPitch, language = this.defaultLanguage } =
      options;

    const voiceId = this.getVoiceId(gender);

    // Stop any currently speaking voice
    await this.stop();

    return new Promise((resolve, reject) => {
      Speech.speak(message, {
        voice: voiceId,
        rate,
        pitch,
        language,
        onDone: () => resolve(),
        onError: (error) => {
          console.error('[VoiceFeedback] Speech error:', error);
          reject(error);
        },
        onStopped: () => resolve(),
      });
    });
  }

  /**
   * Speak feedback for a specific feedback code
   * Uses the feedbackMapping to get the message
   *
   * @param feedbackCode - The feedback code from exercise logic
   * @param exerciseName - The exercise name for specific overrides
   * @param options - Voice options (gender, rate, pitch)
   *
   * @example
   * ```typescript
   * const result = trainer.analyze(landmarks);
   * await voiceFeedback.speakFeedback(result.feedback_code, result.exercise, { gender: 'male' });
   * ```
   */
  async speakFeedback(
    feedbackCode: string,
    exerciseName?: string,
    options: VoiceFeedbackOptions = {}
  ): Promise<void> {
    const feedback = getFeedbackForCode(feedbackCode, exerciseName);
    await this.speak(feedback.message, options);
  }

  /**
   * Stop any currently speaking voice
   */
  async stop(): Promise<void> {
    return Speech.stop();
  }

  /**
   * Check if currently speaking
   */
  async isSpeaking(): Promise<boolean> {
    return Speech.isSpeakingAsync();
  }

  /**
   * Set the default voice gender for all speak calls
   */
  setDefaultGender(gender: VoiceGender): void {
    this.defaultGender = gender;
  }

  /**
   * Set the default speech rate (0.1 - 2.0)
   */
  setDefaultRate(rate: number): void {
    this.defaultRate = Math.max(0.1, Math.min(2.0, rate));
  }

  /**
   * Set the default pitch (0.5 - 2.0)
   */
  setDefaultPitch(pitch: number): void {
    this.defaultPitch = Math.max(0.5, Math.min(2.0, pitch));
  }

  /**
   * Set the default language (e.g., 'en-US', 'ar-SA')
   */
  setDefaultLanguage(language: string): void {
    this.defaultLanguage = language;
  }

  /**
   * Get all available voices
   */
  getAvailableVoices(): Speech.Voice[] {
    return this.availableVoices;
  }

  /**
   * Get voices filtered by language
   */
  getVoicesByLanguage(languageCode: string): Speech.Voice[] {
    return this.availableVoices.filter(
      (v) => v.language?.startsWith(languageCode) || v.identifier?.includes(languageCode)
    );
  }

  /**
   * Set a specific voice by identifier
   * Useful when user wants to choose a specific voice from the list
   */
  setVoice(voiceId: string, gender: VoiceGender): void {
    if (gender === 'male') {
      this.maleVoiceId = voiceId;
    } else {
      this.femaleVoiceId = voiceId;
    }
  }

  /**
   * Get current voice configuration
   */
  getVoiceConfig(): {
    maleVoiceId: string | null;
    femaleVoiceId: string | null;
    defaultGender: VoiceGender;
    defaultRate: number;
    defaultPitch: number;
    defaultLanguage: string;
  } {
    return {
      maleVoiceId: this.maleVoiceId,
      femaleVoiceId: this.femaleVoiceId,
      defaultGender: this.defaultGender,
      defaultRate: this.defaultRate,
      defaultPitch: this.defaultPitch,
      defaultLanguage: this.defaultLanguage,
    };
  }
}

// Export singleton instance
export const voiceFeedback = new VoiceFeedbackService();

// Also export the class for testing or multiple instances
export { VoiceFeedbackService };
