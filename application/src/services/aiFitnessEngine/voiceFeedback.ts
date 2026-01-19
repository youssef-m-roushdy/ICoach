
/**
 * AI Fitness Engine - Voice Feedback Service (Calm, No-Overlap, Count Priority)
 * - NO overlap: uses queue + onDone callbacks
 * - Small gap between utterances
 * - Counts (COUNT_ / REP_NUMBER_) interrupt anything and speak immediately
 * - Counts ALWAYS in ENGLISH
 * - Throttling for corrections to avoid being annoying
 */

import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import { getFeedbackForCode } from './feedbackMapping';

export type VoiceGender = 'male' | 'female';

export interface VoiceFeedbackOptions {
  gender?: VoiceGender;
  rate?: number;
  pitch?: number;
  language?: string; // ex: 'en-US'
  force?: boolean;  // bypass throttling + may interrupt
}

type QueueItem = {
  message: string;
  options: VoiceFeedbackOptions;
  resolve: () => void;
  reject: (e: any) => void;
};

class VoiceFeedbackService {
  private maleVoiceId: string | null = null;
  private femaleVoiceId: string | null = null;
  private availableVoices: Speech.Voice[] = [];
  private isInitialized = false;

  // ✅ Calm defaults
  private defaultGender: VoiceGender = 'female';
  private defaultRate = 0.92;
  private defaultPitch = 1.0;

  // ✅ IMPORTANT: make default language ENGLISH
  private defaultLanguage = 'en-US';

  // ✅ Queue / pacing
  private queue: QueueItem[] = [];
  private isSpeaking = false;
  private lastUtteranceEndMs = 0;

  // مسافة صغيرة بين أي جملتين (للـ instructions فقط)
  private GAP_BETWEEN_UTTERANCES_MS = 650;

  // ✅ Smart throttling (anti-spam)
  private lastMessage: string = '';
  private lastMessageTime: number = 0;
  private lastCorrectionTime: number = 0;

  private MIN_DELAY_BETWEEN_SAME_MSG = 7000;
  private MIN_DELAY_BETWEEN_CORRECTIONS = 2500;

  // ✅ Numbers ENGLISH only
  private numberWordsEn: string[] = [
    'zero','one','two','three','four','five','six','seven','eight','nine','ten',
    'eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'
  ];

  async initialize(): Promise<void> {
    try {
      this.availableVoices = await Speech.getAvailableVoicesAsync();
      this.findBestVoices();
      this.isInitialized = true;
    } catch (error) {
      console.error('[VoiceFeedback] Init Failed:', error);
      this.isInitialized = true;
    }
  }

  /**
   * ✅ Always pick EN voices (since counts must be English)
   * If no EN voices exist, fallback to any available voice.
   */
  private findBestVoices(): void {
    const enVoices = this.availableVoices.filter(v => v.language?.startsWith('en'));
    const pool = enVoices.length ? enVoices : this.availableVoices;

    if (Platform.OS === 'ios') {
      this.femaleVoiceId =
        pool.find(v => (v.name || '').toLowerCase().includes('samantha'))?.identifier ||
        pool[0]?.identifier ||
        null;

      this.maleVoiceId =
        pool.find(v => (v.name || '').toLowerCase().includes('daniel'))?.identifier ||
        null;
    } else {
      this.femaleVoiceId =
        pool.find(v => (v.name || '').toLowerCase().includes('female'))?.identifier ||
        pool[0]?.identifier ||
        null;

      this.maleVoiceId =
        pool.find(v => (v.name || '').toLowerCase().includes('male'))?.identifier ||
        null;
    }
  }

  // ✅ number to words in ENGLISH only
  private numberToWords(n: number): string {
    if (n <= 20) return this.numberWordsEn[n] || String(n);

    if (n < 100) {
      const tens = Math.floor(n / 10);
      const ones = n % 10;
      const tensWords = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
      return tensWords[tens] + (ones ? ' ' + this.numberWordsEn[ones] : '');
    }

    return String(n);
  }

  // -----------------------------
  // Queue engine (no overlap)
  // -----------------------------
  private async speakNow(message: string, options: VoiceFeedbackOptions): Promise<void> {
    if (!message) return;
    if (!this.isInitialized) await this.initialize();

    const {
      gender = this.defaultGender,
      rate = this.defaultRate,
      pitch = this.defaultPitch,
      language = this.defaultLanguage,
    } = options;

    const voiceId = gender === 'male' ? this.maleVoiceId : this.femaleVoiceId;

    // ensure small gap between utterances (for normal advice)
    const now = Date.now();
    const waitMs = Math.max(0, this.GAP_BETWEEN_UTTERANCES_MS - (now - this.lastUtteranceEndMs));
    if (waitMs > 0) {
      await new Promise(res => setTimeout(res, waitMs));
    }

    return new Promise<void>((resolve, reject) => {
      try {
        this.isSpeaking = true;

        Speech.speak(message, {
          voice: voiceId || undefined,
          rate,
          pitch,
          language,
          onDone: () => {
            this.isSpeaking = false;
            this.lastUtteranceEndMs = Date.now();
            resolve();
          },
          onStopped: () => {
            this.isSpeaking = false;
            this.lastUtteranceEndMs = Date.now();
            resolve();
          },
          onError: (e) => {
            this.isSpeaking = false;
            this.lastUtteranceEndMs = Date.now();
            reject(e);
          },
        });
      } catch (e) {
        this.isSpeaking = false;
        reject(e);
      }
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isSpeaking) return;
    const item = this.queue.shift();
    if (!item) return;

    try {
      await this.speakNow(item.message, item.options);
      item.resolve();
    } catch (e) {
      item.reject(e);
    } finally {
      this.processQueue();
    }
  }

  private enqueue(message: string, options: VoiceFeedbackOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ message, options, resolve, reject });
      this.processQueue();
    });
  }

  private clearQueue() {
    this.queue = [];
  }

  // -----------------------------
  // Public methods
  // -----------------------------
  async stop(): Promise<void> {
    this.clearQueue();
    await Speech.stop();
    this.isSpeaking = false;
  }

  /**
   * Normal speak -> queued + throttled
   */
  async speak(message: string, options: VoiceFeedbackOptions = {}): Promise<void> {
    if (!message) return;
    if (!this.isInitialized) await this.initialize();

    const now = Date.now();
    const force = !!options.force;

    // Throttle duplicates (unless forced)
    if (!force) {
      if (message === this.lastMessage && now - this.lastMessageTime < this.MIN_DELAY_BETWEEN_SAME_MSG) {
        return;
      }
      if (now - this.lastCorrectionTime < this.MIN_DELAY_BETWEEN_CORRECTIONS) {
        return;
      }
      this.lastCorrectionTime = now;
    }

    this.lastMessage = message;
    this.lastMessageTime = now;

    return this.enqueue(message, {
      ...options,
      language: options.language || this.defaultLanguage,
    });
  }

  /**
   * Speak feedback code:
   * ✅ Counts interrupt immediately, speak ENGLISH, ALWAYS.
   */
  async speakFeedback(
    feedbackCode: string,
    exerciseName?: string,
    options: VoiceFeedbackOptions = {}
  ): Promise<void> {
    if (!feedbackCode) return;
    if (!this.isInitialized) await this.initialize();

    // -----------------------------------
    // 1) Highest priority: REP COUNT (ALWAYS interrupt + EN)
    // -----------------------------------
    const isCount =
      feedbackCode.startsWith('COUNT_') ||
      feedbackCode.startsWith('REP_NUMBER_');

    if (isCount) {
      const parts = feedbackCode.split('_');
      const countNumber = parseInt(parts[parts.length - 1], 10);
      const msg = this.numberToWords(isNaN(countNumber) ? 0 : countNumber);

      // ✅ interrupt anything + clear queue + speak NOW (no gap)
      this.clearQueue();
      await Speech.stop();
      this.isSpeaking = false;

      // reset throttling so counts never blocked
      this.lastMessage = '';
      this.lastMessageTime = 0;

      // counts must be immediate
      const oldGap = this.GAP_BETWEEN_UTTERANCES_MS;
      this.GAP_BETWEEN_UTTERANCES_MS = 0;
      try {
        await this.speakNow(msg, {
          ...options,
          force: true,
          language: 'en-US', // ✅ FORCE English for counts
        });
      } finally {
        this.GAP_BETWEEN_UTTERANCES_MS = oldGap;
      }
      return;
    }

    // -----------------------------------
    // 2) Other feedback: calm, queued, throttled
    // -----------------------------------
    const feedback = getFeedbackForCode(feedbackCode, exerciseName);
    const message = feedback.voice || feedback.message || '';
    if (!message) return;

    const isCritical =
      feedbackCode.includes('SYSTEM_READY') ||
      feedbackCode.includes('SYSTEM_GO') ||
      feedbackCode === 'ERR_BODY_NOT_VISIBLE';

    if (isCritical) {
      // critical can interrupt
      this.clearQueue();
      await Speech.stop();
      this.isSpeaking = false;

      await this.speakNow(message, {
        ...options,
        force: true,
        language: options.language || this.defaultLanguage,
      });
      return;
    }

    await this.speak(message, {
      ...options,
      force: false,
      language: options.language || this.defaultLanguage,
    });
  }
}

export const voiceFeedback = new VoiceFeedbackService();