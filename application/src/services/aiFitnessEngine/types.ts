/**
 * AI Fitness Engine - Type Definitions
 * On-Device Exercise Analysis Engine
 */

// MediaPipe Pose Landmark structure
export interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

// Base result interface for all exercises
export interface BaseExerciseResult {
  exercise: string;
  feedback_code: string;
  is_correct?: boolean;
}

// Result for rep-based exercises (squat, crunch, leg raises, etc.)
export interface RepExerciseResult extends BaseExerciseResult {
  reps: number;
  stage: string | null;
}

// Result for timer-based exercises (planks)
export interface TimerExerciseResult extends BaseExerciseResult {
  timer: number;
  is_correct: boolean;
}

// --- Specific Exercise Results ---

export interface SquatResult extends RepExerciseResult {
  exercise: 'squat';
  is_system_active: boolean;
}

export interface SupermanResult extends RepExerciseResult {
  exercise: 'superman';
  hold_timer: number;
}

export interface JumpingJacksResult extends RepExerciseResult {
  exercise: 'jumping_jacks';
  debug_class?: string;
}

export interface HighPlankResult extends TimerExerciseResult {
  exercise: 'high_plank';
}

export interface ElbowPlankResult extends TimerExerciseResult {
  exercise: 'elbow_plank';
}

export interface CrunchResult extends RepExerciseResult {
  exercise: 'crunch';
  is_correct: boolean;
}

export interface LegRaisesResult extends RepExerciseResult {
  exercise: 'leg_raises';
  is_correct: boolean;
}

// 🔥 New Exercises Results 🔥
export interface LateralRaisesResult extends RepExerciseResult {
  exercise: 'lateral_raises';
}

export interface FrontRaisesResult extends RepExerciseResult {
  exercise: 'front_raises';
}

export interface OverheadPressResult extends RepExerciseResult {
  exercise: 'standing_overhead_press';
}

// Union type for all possible results
export type ExerciseResult =
  | SquatResult
  | SupermanResult
  | JumpingJacksResult
  | HighPlankResult
  | ElbowPlankResult
  | CrunchResult
  | LegRaisesResult
  // New Additions
  | LateralRaisesResult
  | FrontRaisesResult
  | OverheadPressResult;

// Exercise logic interface
export interface ExerciseLogic {
  analyze(landmarks: Landmark[]): ExerciseResult;
  reset?(): void;
}

// Supported exercise names
export type ExerciseName =
  | 'squat'
  | 'superman'
  | 'leg_raises'
  | 'high_plank'
  | 'elbow_plank'
  | 'crunch'
  | 'jumping_jacks'
  | 'lateral_raises'
  | 'front_raises'
  | 'standing_overhead_press';

// Feedback codes (for UI mapping)
export const FeedbackCodes = {
  // Setup/System
  STEP_BACK: 'STEP_BACK',
  SETUP_POSITION: 'SETUP_POSITION',
  SETUP_STAND_STRAIGHT: 'SETUP_STAND_STRAIGHT',
  SETUP_HOLD: 'SETUP_HOLD',
  SYSTEM_READY_GO: 'SYSTEM_READY_GO',
  START_POSITION: 'START_POSITION',
  ERR_CAMERA_VIEW: 'ERR_CAMERA_VIEW',

  // Commands - General & Legs
  CMD_GO_DOWN: 'CMD_GO_DOWN',
  CMD_GO_UP: 'CMD_GO_UP',
  CMD_RAISE_LEGS: 'CMD_RAISE_LEGS',
  CMD_LOWER_SLOWLY: 'CMD_LOWER_SLOWLY',
  CMD_JUMP_OPEN: 'CMD_JUMP_OPEN',
  CMD_JUMP_CLOSE: 'CMD_JUMP_CLOSE',

  // Commands - Arms (New)
  CMD_RAISE_ARMS: 'CMD_RAISE_ARMS',   // Lateral Raises
  CMD_RAISE_FRONT: 'CMD_RAISE_FRONT', // Front Raises
  PUSH_UP: 'PUSH_UP',                 // Overhead Press
  LOWER_SLOWLY: 'LOWER_SLOWLY',       // Overhead Press

  // Success
  REP_SUCCESS: 'REP_SUCCESS',
  HOLD_FIXED: 'HOLD_FIXED',
  HOLD_STABILIZE: 'HOLD_STABILIZE',
  PERFECT: 'PERFECT',       // Lateral Raises
  GOOD_REP: 'GOOD_REP',     // Front Raises / Overhead Press

  // Errors - Body Visibility
  ERR_BODY_NOT_VISIBLE: 'ERR_BODY_NOT_VISIBLE',

  // Errors - Form General
  ERR_BENT_KNEES: 'ERR_BENT_KNEES',
  ERR_BENT_ELBOWS: 'ERR_BENT_ELBOWS',
  ERR_ARMS_TOO_STRAIGHT: 'ERR_ARMS_TOO_STRAIGHT',
  ERR_ARMS_LAZY: 'ERR_ARMS_LAZY',
  ERR_HANDS_POSITION: 'ERR_HANDS_POSITION',

  // Errors - Arm Exercises (New)
  STRAIGHTEN_ARMS: 'STRAIGHTEN_ARMS', // Lateral Raises
  ERR_TOO_HIGH: 'ERR_TOO_HIGH',       // Lateral Raises
  ERR_SWINGING: 'ERR_SWINGING',       // Front Raises
  RAISE_YOUR_ARM: 'RAISE_YOUR_ARM',   // Front Raises
  ERR_ARCHED_BACK: 'ERR_ARCHED_BACK', // Overhead Press
  ERR_LOW_ARMS: 'ERR_LOW_ARMS',       // Overhead Press

  // Errors - Position
  ERR_HIPS_TOO_LOW: 'ERR_HIPS_TOO_LOW',
  ERR_HIPS_TOO_HIGH: 'ERR_HIPS_TOO_HIGH',
  ERR_KNEES_TOUCHING: 'ERR_KNEES_TOUCHING',
  ERR_LEGS_SYNC: 'ERR_LEGS_SYNC',
  ERR_LEGS_WIDTH: 'ERR_LEGS_WIDTH',
  ERR_BACK_SAG: 'ERR_BACK_SAG',

  // Errors - Superman specific
  ERR_NOT_LYING_FLAT: 'ERR_NOT_LYING_FLAT',
  ERR_LIFT_LEGS: 'ERR_LIFT_LEGS',
  ERR_LIFT_ARMS: 'ERR_LIFT_ARMS',
  ERR_RESET_FULL: 'ERR_RESET_FULL',

  // Errors - Squat specific
  FIX_LOWER_HIPS: 'FIX_LOWER_HIPS',

  // General
  FIX_POSTURE: 'FIX_POSTURE',
} as const;

export type FeedbackCode = (typeof FeedbackCodes)[keyof typeof FeedbackCodes];