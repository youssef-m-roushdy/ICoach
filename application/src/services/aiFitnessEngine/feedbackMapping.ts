/**
 * AI Fitness Engine - Feedback Mapping
 * Maps feedback codes to voice/UI messages.
 * * Based STRICTLY on the provided Excel Documentation.
 * Columns used: Feedback Code (Python) -> UI Message (Text to Display)
 */

export interface FeedbackInfo {
  message: string; // الكلام اللي هيظهر على الشاشة (طويل وتفصيلي)
  voice?: string;  // الكلام اللي هيتقال صوتي (قصير ومختصر)
}

/**
 * 1. GENERAL / DEFAULT MAPPING
 * الرسائل الأساسية التي تنطبق على معظم التمارين
 */
export const FeedbackMapping: Record<string, FeedbackInfo> = {
  // --- SQUAT ---
  ERR_BODY_NOT_VISIBLE: { message: 'Step back to show full body' },
  SETUP_STAND_STRAIGHT: { message: 'Stand straight & hold still' },
  CMD_GO_DOWN: { message: 'Go Down' },
  FIX_LOWER_HIPS: { message: 'Lower your hips more' },

  // --- SUPERMAN ---
  ERR_NOT_LYING_FLAT: { message: 'Lie on your stomach' },
  HOLD_STABILIZE: { message: 'Hold...' },
  ERR_LIFT_LEGS: { message: 'Lift your legs too' },
  ERR_LIFT_ARMS: { message: 'Lift your arms too' },
  ERR_RESET_FULL: { message: 'Rest fully on the floor' },

  // --- LEG RAISES ---
  START_POSITION: { message: 'Lie on your back' },
  ERR_LEGS_SYNC: { message: 'Keep feet together' },
  CMD_RAISE_LEGS: { message: 'Raise your legs' },
  CMD_LOWER_SLOWLY: { message: 'Lower slowly' },

  // --- PLANK ---
  SETUP_POSITION: { message: 'Get into plank position' },
  ERR_HIPS_TOO_LOW: { message: 'Raise your hips' },
  ERR_HIPS_TOO_HIGH: { message: 'Lower your hips' },
  ERR_BENT_ELBOWS: { message: 'Straighten your arms' },
  ERR_KNEES_TOUCHING: { message: 'Knees off the floor' },
  HOLD_FIXED: { message: 'Hold steady...' },
  ERR_BACK_SAG: { message: 'Straighten your back' },
  ERR_ARMS_TOO_STRAIGHT: { message: 'Rest on your elbows' },

  // --- CRUNCH ---
  ERR_HANDS_POSITION: { message: 'Keep hands behind head' },

  // --- JUMPING JACKS (Defaults) ---
  FIX_POSTURE: { message: 'Adjust posture / Camera' },
  CMD_JUMP_OPEN: { message: 'Jump & Open!' },
  CMD_JUMP_CLOSE: { message: 'Jump & Close!' },
  ERR_LEGS_WIDTH: { message: 'Wider legs!' },
  ERR_ARMS_LAZY: { message: 'Arms higher!' },

  // --- GENERIC Defaults ---
  SYSTEM_READY_GO: { message: 'GO!' },
  REP_SUCCESS: { message: 'Perfect!' },
  ERR_BENT_KNEES: { message: 'Straighten your legs' },
  CMD_GO_UP: { message: 'Fly Up (Arms & Legs)' },
};

/**
 * 2. EXERCISE SPECIFIC OVERRIDES
 * الاستثناءات الخاصة بكل تمرين
 */
export const ExerciseSpecificFeedback: Record<string, Record<string, FeedbackInfo>> = {
  squat: {
    // Squat uses defaults mostly
  },
  superman: {
    SYSTEM_READY_GO: { message: 'Ready... Start' },
    REP_SUCCESS: { message: 'Good Job!' },
    CMD_GO_UP: { message: 'Fly Up (Arms & Legs)' },
  },
  leg_raises: {
    REP_SUCCESS: { message: 'Good!' },
  },
  crunch: {
    ERR_BENT_KNEES: { message: 'Bend your knees' }, 
    ERR_LEGS_SYNC: { message: 'Feet together' },
    CMD_GO_UP: { message: 'Crunch Up' },
    REP_SUCCESS: { message: 'Excellent!' },
  },
  
  jumping_jacks: {
    SYSTEM_READY_GO: { message: 'Ready... Jump!' },
    REP_SUCCESS: { message: 'Great!' },
    // Custom logic feedback
    ERR_ARMS_LAZY: { message: 'Arms higher!' },
    CMD_JUMP_OPEN: { message: 'Wider legs!' },
    ERR_LEGS_WIDTH: { message: 'Wider legs!' }
  },
  
  high_plank: {
    // Plank specific logic if needed
  },
  elbow_plank: {
    // Elbow plank specific logic if needed
  },

  // ========================================================
  // 🔥 NEW EXERCISES ADDED (With Short Voice Feedback) 🔥
  // ========================================================

  // 1. Lateral Raises
  lateral_raises: {
    ERR_BODY_NOT_VISIBLE: { message: 'Step back for arm clearance', voice: 'Step back' },
    CMD_RAISE_ARMS: { message: 'Raise arms sideways', voice: 'Arms up' },
    STRAIGHTEN_ARMS: { message: 'Straighten your arms', voice: 'Straighten arms' },
    ERR_TOO_HIGH: { message: "Don't go above shoulders", voice: 'Too high' },
    PERFECT: { message: 'Perfect Level', voice: 'Hold' },
    REP_SUCCESS: { message: 'Excellent Rep!', voice: 'Good' },
  },

  // 2. Front Raises
  front_raises: {
    ERR_BODY_NOT_VISIBLE: { message: 'Adjust position, show arms', voice: 'Show arms' },
    CMD_RAISE_FRONT: { message: 'Raise arms in front', voice: 'Raise front' },
    RAISE_YOUR_ARM: { message: 'Raise higher to chest level', voice: 'Higher' },
    ERR_SWINGING: { message: 'Keep your torso still', voice: "Don't swing" },
    GOOD_REP: { message: 'Good Control', voice: 'Nice' },
    REP_SUCCESS: { message: 'Nice Work!', voice: 'Good' },
  },

  // 3. Standing Overhead Press
  standing_overhead_press: {
    SETUP_POSITION: { message: 'Stand tall, weights at shoulders', voice: 'Stand tall' },
    ERR_CAMERA_VIEW: { message: 'Arms must be visible overhead', voice: 'Fix camera' },
    ERR_ARCHED_BACK: { message: "Keep core tight, don't lean back", voice: "Don't lean" },
    ERR_LOW_ARMS: { message: "Don't drop elbows too low", voice: 'Elbows up' },
    PUSH_UP: { message: 'Press overhead', voice: 'Press up' },
    LOWER_SLOWLY: { message: 'Lower firmly to shoulders', voice: 'Lower' },
    GOOD_REP: { message: 'Great lift!', voice: 'Great' },
  }
};

/**
 * Helper function to resolve the correct message
 */
export function getFeedbackForCode(
  feedbackCode: string,
  exerciseName?: string
): FeedbackInfo {
  // 1. Handle Dynamic Codes (SETUP_HOLD_{N})
  if (feedbackCode.startsWith('SETUP_HOLD_')) {
    const seconds = feedbackCode.replace('SETUP_HOLD_', '');
    return {
      message: `Hold Still... ${seconds}`,
      voice: `Hold ${seconds}`
    };
  }

  // 2. Check Exercise Specific Overrides First
  if (exerciseName) {
    const normalizedName = exerciseName.toLowerCase().replace(/ /g, '_');
    const exerciseOverrides = ExerciseSpecificFeedback[normalizedName];
    
    if (exerciseOverrides && exerciseOverrides[feedbackCode]) {
      return exerciseOverrides[feedbackCode];
    }
  }

  // 3. Fallback to General Mapping
  return (
    FeedbackMapping[feedbackCode] || {
      message: feedbackCode.replace(/_/g, ' '),
    }
  );
}

// For testing purposes
export function getAllFeedbackMessages(): string[] {
  const messages = new Set<string>();
  Object.values(FeedbackMapping).forEach((info) => messages.add(info.message));
  Object.values(ExerciseSpecificFeedback).forEach((overrides) => {
    Object.values(overrides).forEach((info) => messages.add(info.message));
  });
  return Array.from(messages);
}