/**
 * AI Fitness Engine - Feedback Mapping
 * Maps feedback codes to voice messages (Text-to-Speech)
 *
 * No audio files needed - uses expo-speech to convert text to voice
 * Based on Documentation/Document.xlsx
 */

/**
 * Feedback info containing only the message to be spoken
 */
export interface FeedbackInfo {
  message: string;
}

/**
 * Complete mapping of feedback codes to voice messages
 * These messages will be spoken using Text-to-Speech (expo-speech)
 */
export const FeedbackMapping: Record<string, FeedbackInfo> = {
  // ============================================
  // SQUAT
  // ============================================
  ERR_BODY_NOT_VISIBLE: {
    message: 'Step back to show full body',
  },
  SETUP_STAND_STRAIGHT: {
    message: 'Stand straight and hold still',
  },
  SYSTEM_READY_GO: {
    message: 'Go!',
  },
  CMD_GO_DOWN: {
    message: 'Go Down',
  },
  FIX_LOWER_HIPS: {
    message: 'Lower your hips more',
  },
  REP_SUCCESS: {
    message: 'Perfect!',
  },

  // ============================================
  // SUPERMAN
  // ============================================
  ERR_NOT_LYING_FLAT: {
    message: 'Lie on your stomach',
  },
  CMD_GO_UP: {
    message: 'Fly Up, Arms and Legs',
  },
  HOLD_STABILIZE: {
    message: 'Hold',
  },
  ERR_LIFT_LEGS: {
    message: 'Lift your legs too',
  },
  ERR_LIFT_ARMS: {
    message: 'Lift your arms too',
  },
  ERR_RESET_FULL: {
    message: 'Rest fully on the floor',
  },

  // ============================================
  // LEG RAISES
  // ============================================
  START_POSITION: {
    message: 'Lie on your back',
  },
  ERR_BENT_KNEES: {
    message: 'Straighten your legs',
  },
  ERR_LEGS_SYNC: {
    message: 'Keep feet together',
  },
  CMD_RAISE_LEGS: {
    message: 'Raise your legs',
  },
  CMD_LOWER_SLOWLY: {
    message: 'Lower slowly',
  },

  // ============================================
  // HIGH PLANK
  // ============================================
  SETUP_POSITION: {
    message: 'Get into plank position',
  },
  ERR_HIPS_TOO_LOW: {
    message: 'Raise your hips',
  },
  ERR_HIPS_TOO_HIGH: {
    message: 'Lower your hips',
  },
  ERR_BENT_ELBOWS: {
    message: 'Straighten your arms',
  },
  ERR_KNEES_TOUCHING: {
    message: 'Knees off the floor',
  },
  HOLD_FIXED: {
    message: 'Hold steady',
  },

  // ============================================
  // ELBOW PLANK
  // ============================================
  ERR_ARMS_TOO_STRAIGHT: {
    message: 'Rest on your elbows',
  },
  ERR_BACK_SAG: {
    message: 'Straighten your back',
  },

  // ============================================
  // CRUNCH
  // ============================================
  ERR_HANDS_POSITION: {
    message: 'Keep hands behind head',
  },

  // ============================================
  // JUMPING JACKS
  // ============================================
  FIX_POSTURE: {
    message: 'Adjust posture or Camera',
  },
  CMD_JUMP_OPEN: {
    message: 'Jump and Open!',
  },
  CMD_JUMP_CLOSE: {
    message: 'Jump and Close!',
  },
  ERR_LEGS_WIDTH: {
    message: 'Wider legs!',
  },
  ERR_ARMS_LAZY: {
    message: 'Arms higher!',
  },

  // ============================================
  // GENERIC / SHARED
  // ============================================
  STEP_BACK: {
    message: 'Step back to show full body',
  },
};

/**
 * Exercise-specific overrides for feedback codes that have different meanings
 * per exercise (e.g., ERR_BENT_KNEES means opposite things for leg raises vs crunch)
 */
export const ExerciseSpecificFeedback: Record<string, Record<string, FeedbackInfo>> = {
  crunch: {
    ERR_BENT_KNEES: {
      message: 'Bend your knees',
    },
    CMD_GO_UP: {
      message: 'Crunch Up',
    },
    REP_SUCCESS: {
      message: 'Excellent!',
    },
  },
  superman: {
    CMD_GO_UP: {
      message: 'Fly Up, Arms and Legs',
    },
    REP_SUCCESS: {
      message: 'Good Job!',
    },
  },
  jumping_jacks: {
    SYSTEM_READY_GO: {
      message: 'Ready, Jump!',
    },
    REP_SUCCESS: {
      message: 'Great!',
    },
  },
  leg_raises: {
    REP_SUCCESS: {
      message: 'Good!',
    },
  },
};

/**
 * Get feedback info for a given code, with exercise-specific overrides
 *
 * @param feedbackCode - The feedback code from exercise logic
 * @param exerciseName - The exercise name for specific overrides
 * @returns FeedbackInfo with message to be spoken via TTS
 *
 * @example
 * ```typescript
 * import { voiceFeedback } from './voiceFeedback';
 * 
 * const result = trainer.analyze(landmarks);
 * const feedback = getFeedbackForCode(result.feedback_code, result.exercise);
 * 
 * // Display message on screen
 * console.log(feedback.message); // "Go Down"
 * 
 * // Speak the message using TTS
 * voiceFeedback.speak(feedback.message, { gender: 'female' });
 * ```
 */
export function getFeedbackForCode(
  feedbackCode: string,
  exerciseName?: string
): FeedbackInfo {
  // Handle dynamic SETUP_HOLD_{N} codes
  if (feedbackCode.startsWith('SETUP_HOLD_')) {
    const seconds = feedbackCode.replace('SETUP_HOLD_', '');
    return {
      message: `Hold Still, ${seconds}`,
    };
  }

  // Check for exercise-specific override first
  if (exerciseName) {
    const exerciseOverrides = ExerciseSpecificFeedback[exerciseName.toLowerCase()];
    if (exerciseOverrides && exerciseOverrides[feedbackCode]) {
      return exerciseOverrides[feedbackCode];
    }
  }

  // Return generic mapping or fallback
  return (
    FeedbackMapping[feedbackCode] || {
      message: feedbackCode.replace(/_/g, ' '),
    }
  );
}

/**
 * Get all unique feedback messages
 * Useful for testing TTS with all messages
 */
export function getAllFeedbackMessages(): string[] {
  const messages = new Set<string>();

  // Add all generic messages
  Object.values(FeedbackMapping).forEach((info) => {
    messages.add(info.message);
  });

  // Add all exercise-specific messages
  Object.values(ExerciseSpecificFeedback).forEach((overrides) => {
    Object.values(overrides).forEach((info) => {
      messages.add(info.message);
    });
  });

  return Array.from(messages);
}
