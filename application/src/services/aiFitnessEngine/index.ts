/**
 * AI Fitness Engine - Main Entry Point
 * On-Device Exercise Analysis for React Native
 *
 * This is the TypeScript port of the Python AI Fitness Engine.
 * All processing happens on-device (no server required).
 *
 * Benefits:
 * ✅ Zero Latency - Real-time analysis
 * ✅ Works Offline - No internet needed
 * ✅ Zero Cost - No server bills
 * ✅ Privacy - User data stays on device
 *
 * Usage:
 * ```typescript
 * import { AIFitnessEngine } from '@/services/aiFitnessEngine';
 *
 * // Get a trainer for a specific exercise
 * const squatTrainer = AIFitnessEngine.getTrainer('squat');
 *
 * // In your pose detection callback:
 * const result = squatTrainer.analyze(landmarks);
 * console.log(`Reps: ${result.reps}, Feedback: ${result.feedback_code}`);
 *
 * // Reset for new session
 * squatTrainer.reset?.();
 * ```
 */

import {
  SquatLogic,
  HighPlankLogic,
  ElbowPlankLogic,
  CrunchLogic,
  LegRaisesLogic,
  SupermanLogic,
  JumpingJacksLogic,
} from './exercises';

import { ExerciseLogic, ExerciseName } from './types';

/**
 * AI Fitness Engine - Factory Class
 * The main entry point for developers to create exercise trainers.
 */
export class AIFitnessEngine {
  /**
   * Returns the logic instance for a specific exercise.
   *
   * @param exerciseName - The ID/Name of the exercise (e.g., 'squat', 'crunch')
   * @returns The logic class instance for that exercise
   * @throws Error if the exercise name is not supported
   *
   * @example
   * ```typescript
   * const trainer = AIFitnessEngine.getTrainer('squat');
   * const result = trainer.analyze(landmarks);
   * ```
   */
  static getTrainer(exerciseName: string): ExerciseLogic {
    // Normalize the input (lowercase and trim)
    const key = exerciseName.toLowerCase().trim() as ExerciseName;

    switch (key) {
      case 'squat':
        return new SquatLogic();

      case 'superman':
        return new SupermanLogic();

      case 'leg_raises':
        return new LegRaisesLogic();

      case 'high_plank':
        return new HighPlankLogic();

      case 'elbow_plank':
        return new ElbowPlankLogic();

      case 'crunch':
        return new CrunchLogic();

      case 'jumping_jacks':
        return new JumpingJacksLogic();

      // --- Space for future exercises (21 more planned) ---
      // case 'pushup':
      //   return new PushupLogic();

      default:
        throw new Error(
          `⚠️ Exercise '${exerciseName}' is not supported yet. ` +
            `Available exercises: squat, superman, leg_raises, high_plank, elbow_plank, crunch, jumping_jacks`
        );
    }
  }

  /**
   * Get list of all supported exercises
   *
   * @returns Array of supported exercise names
   */
  static getSupportedExercises(): ExerciseName[] {
    return [
      'squat',
      'superman',
      'leg_raises',
      'high_plank',
      'elbow_plank',
      'crunch',
      'jumping_jacks',
    ];
  }

  /**
   * Check if an exercise is supported
   *
   * @param exerciseName - The exercise name to check
   * @returns true if supported, false otherwise
   */
  static isExerciseSupported(exerciseName: string): boolean {
    const key = exerciseName.toLowerCase().trim();
    return this.getSupportedExercises().includes(key as ExerciseName);
  }
}

// Re-export types for convenience
export * from './types';
export * from './utils';
export * from './exercises';
export * from './feedbackMapping';
