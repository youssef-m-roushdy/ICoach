/**
 * AI Fitness Engine - Feedback Mapping
 * Maps feedback codes to UI messages and audio files
 *
 * Based on Documentation/Document.xlsx
 */

export interface FeedbackInfo {
  message: string;
  audioFile: string;
}

/**
 * Complete mapping of feedback codes to UI messages and audio files
 * Use this to display text and play sounds based on exercise feedback
 */
export const FeedbackMapping: Record<string, FeedbackInfo> = {
  // ============================================
  // SQUAT
  // ============================================
  ERR_BODY_NOT_VISIBLE: {
    message: 'Step back to show full body',
    audioFile: 'step_back.mp3',
  },
  SETUP_STAND_STRAIGHT: {
    message: 'Stand straight & hold still',
    audioFile: 'stand_straight.mp3',
  },
  // SETUP_HOLD_{N} is handled dynamically - see getFeedbackForCode()
  SYSTEM_READY_GO: {
    message: 'GO!',
    audioFile: 'start.mp3',
  },
  CMD_GO_DOWN: {
    message: 'Go Down',
    audioFile: 'go_down.mp3',
  },
  FIX_LOWER_HIPS: {
    message: 'Lower your hips more',
    audioFile: 'lower_hips.mp3',
  },
  REP_SUCCESS: {
    message: 'Perfect!',
    audioFile: 'count_rep.mp3',
  },

  // ============================================
  // SUPERMAN
  // ============================================
  ERR_NOT_LYING_FLAT: {
    message: 'Lie on your stomach',
    audioFile: 'lie_stomach.mp3',
  },
  CMD_GO_UP: {
    message: 'Fly Up (Arms & Legs)',
    audioFile: 'fly_up.mp3',
  },
  HOLD_STABILIZE: {
    message: 'Hold...',
    audioFile: 'hold.mp3',
  },
  ERR_LIFT_LEGS: {
    message: 'Lift your legs too',
    audioFile: 'lift_legs.mp3',
  },
  ERR_LIFT_ARMS: {
    message: 'Lift your arms too',
    audioFile: 'lift_arms.mp3',
  },
  ERR_RESET_FULL: {
    message: 'Rest fully on the floor',
    audioFile: 'reset_down.mp3',
  },

  // ============================================
  // LEG RAISES
  // ============================================
  START_POSITION: {
    message: 'Lie on your back',
    audioFile: 'lie_back.mp3',
  },
  ERR_BENT_KNEES: {
    message: 'Straighten your legs',
    audioFile: 'straighten_legs.mp3',
  },
  ERR_LEGS_SYNC: {
    message: 'Keep feet together',
    audioFile: 'feet_together.mp3',
  },
  CMD_RAISE_LEGS: {
    message: 'Raise your legs',
    audioFile: 'raise_legs.mp3',
  },
  CMD_LOWER_SLOWLY: {
    message: 'Lower slowly',
    audioFile: 'lower_slow.mp3',
  },

  // ============================================
  // HIGH PLANK
  // ============================================
  SETUP_POSITION: {
    message: 'Get into plank position',
    audioFile: 'setup_plank.mp3',
  },
  ERR_HIPS_TOO_LOW: {
    message: 'Raise your hips',
    audioFile: 'hips_up.mp3',
  },
  ERR_HIPS_TOO_HIGH: {
    message: 'Lower your hips',
    audioFile: 'hips_down.mp3',
  },
  ERR_BENT_ELBOWS: {
    message: 'Straighten your arms',
    audioFile: 'straighten_arms.mp3',
  },
  ERR_KNEES_TOUCHING: {
    message: 'Knees off the floor',
    audioFile: 'knees_up.mp3',
  },
  HOLD_FIXED: {
    message: 'Hold steady...',
    audioFile: 'ticking.mp3',
  },

  // ============================================
  // ELBOW PLANK
  // ============================================
  ERR_ARMS_TOO_STRAIGHT: {
    message: 'Rest on your elbows',
    audioFile: 'elbows_down.mp3',
  },
  ERR_BACK_SAG: {
    message: 'Straighten your back',
    audioFile: 'fix_back.mp3',
  },

  // ============================================
  // CRUNCH
  // ============================================
  // Note: ERR_BENT_KNEES for crunch means "Bend your knees" (opposite of leg raises)
  // This is exercise-specific, handled in ExerciseSpecificFeedback
  ERR_HANDS_POSITION: {
    message: 'Keep hands behind head',
    audioFile: 'hands_back.mp3',
  },
  // CMD_GO_UP for crunch is handled in ExerciseSpecificFeedback (different message)

  // ============================================
  // JUMPING JACKS
  // ============================================
  FIX_POSTURE: {
    message: 'Adjust posture / Camera',
    audioFile: 'adjust_camera.mp3',
  },
  CMD_JUMP_OPEN: {
    message: 'Jump & Open!',
    audioFile: 'jump_open.mp3',
  },
  CMD_JUMP_CLOSE: {
    message: 'Jump & Close!',
    audioFile: 'jump_close.mp3',
  },
  ERR_LEGS_WIDTH: {
    message: 'Wider legs!',
    audioFile: 'wider_legs.mp3',
  },
  ERR_ARMS_LAZY: {
    message: 'Arms higher!',
    audioFile: 'arms_higher.mp3',
  },

  // ============================================
  // GENERIC / SHARED
  // ============================================
  STEP_BACK: {
    message: 'Step back to show full body',
    audioFile: 'step_back.mp3',
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
      audioFile: 'bend_knees.mp3',
    },
    CMD_GO_UP: {
      message: 'Crunch Up',
      audioFile: 'crunch_up.mp3',
    },
    REP_SUCCESS: {
      message: 'Excellent!',
      audioFile: 'count_rep.mp3',
    },
  },
  superman: {
    CMD_GO_UP: {
      message: 'Fly Up (Arms & Legs)',
      audioFile: 'fly_up.mp3',
    },
    REP_SUCCESS: {
      message: 'Good Job!',
      audioFile: 'count_rep.mp3',
    },
  },
  jumping_jacks: {
    SYSTEM_READY_GO: {
      message: 'Ready... Jump!',
      audioFile: 'start_jump.mp3',
    },
    REP_SUCCESS: {
      message: 'Great!',
      audioFile: 'count_rep.mp3',
    },
  },
  leg_raises: {
    REP_SUCCESS: {
      message: 'Good!',
      audioFile: 'count_rep.mp3',
    },
  },
};

/**
 * Get feedback info for a given code, with exercise-specific overrides
 *
 * @param feedbackCode - The feedback code from exercise logic
 * @param exerciseName - The exercise name for specific overrides
 * @returns FeedbackInfo with message and audioFile
 *
 * @example
 * ```typescript
 * const result = trainer.analyze(landmarks);
 * const feedback = getFeedbackForCode(result.feedback_code, result.exercise);
 * console.log(feedback.message); // "Go Down"
 * playAudio(feedback.audioFile); // plays "go_down.mp3"
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
      message: `Hold Still... ${seconds}`,
      audioFile: 'beep.mp3',
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
      audioFile: 'beep.mp3',
    }
  );
}

/**
 * List of all audio files needed for the app
 * Use this to preload audio assets
 */
export const AudioFileList = [
  'step_back.mp3',
  'stand_straight.mp3',
  'beep.mp3',
  'start.mp3',
  'go_down.mp3',
  'lower_hips.mp3',
  'count_rep.mp3',
  'lie_stomach.mp3',
  'fly_up.mp3',
  'hold.mp3',
  'lift_legs.mp3',
  'lift_arms.mp3',
  'reset_down.mp3',
  'lie_back.mp3',
  'straighten_legs.mp3',
  'feet_together.mp3',
  'raise_legs.mp3',
  'lower_slow.mp3',
  'setup_plank.mp3',
  'hips_up.mp3',
  'hips_down.mp3',
  'straighten_arms.mp3',
  'knees_up.mp3',
  'ticking.mp3',
  'elbows_down.mp3',
  'fix_back.mp3',
  'bend_knees.mp3',
  'hands_back.mp3',
  'crunch_up.mp3',
  'adjust_camera.mp3',
  'start_jump.mp3',
  'jump_open.mp3',
  'jump_close.mp3',
  'wider_legs.mp3',
  'arms_higher.mp3',
];
