/**
 * Crunch Logic - TypeScript Implementation
 * On-Device Exercise Analysis
 *
 * Original Python: AI_Fitness_Engine/Logic_Scripts/crunch_logic.py
 */

import { Landmark, CrunchResult, ExerciseLogic } from '../types';
import { calculateAngle, calculateDistance, toPoint, PoseLandmarks } from '../utils';

export class CrunchLogic implements ExerciseLogic {
  private counter: number = 0;
  private stage: string | null = 'down';
  private feedbackCode: string = 'START_POSITION';
  private isCorrect: boolean = true;

  // Constants (Tuning Parameters)
  private readonly STRICT_KNEE_LIMIT = 145; // Max knee extension angle
  private readonly FEET_SPLIT_RATIO = 0.4; // Leg spread ratio vs torso length
  private readonly HAND_OFFSET_TOLERANCE = 0.1; // Hand position tolerance
  private readonly TORSO_DOWN_ANGLE = 105; // Down position angle
  private readonly TORSO_UP_ANGLE = 55; // Up position angle

  /**
   * Analyze landmarks and return crunch exercise result
   *
   * @param landmarks - Array of MediaPipe pose landmarks
   * @returns CrunchResult with reps, feedback, and form correctness
   */
  analyze(landmarks: Landmark[]): CrunchResult {
    // Extract points
    const lSh = toPoint(landmarks[PoseLandmarks.LEFT_SHOULDER]);
    const rSh = toPoint(landmarks[PoseLandmarks.RIGHT_SHOULDER]);

    const lHip = toPoint(landmarks[PoseLandmarks.LEFT_HIP]);
    const rHip = toPoint(landmarks[PoseLandmarks.RIGHT_HIP]);

    const lKnee = toPoint(landmarks[PoseLandmarks.LEFT_KNEE]);
    const rKnee = toPoint(landmarks[PoseLandmarks.RIGHT_KNEE]);

    const lAnk = toPoint(landmarks[PoseLandmarks.LEFT_ANKLE]);
    const rAnk = toPoint(landmarks[PoseLandmarks.RIGHT_ANKLE]);

    const lWr = toPoint(landmarks[PoseLandmarks.LEFT_WRIST]);
    const rWr = toPoint(landmarks[PoseLandmarks.RIGHT_WRIST]);

    // --- Calculations ---
    const lKneeAngle = calculateAngle(lHip, lKnee, lAnk);
    const rKneeAngle = calculateAngle(rHip, rKnee, rAnk);

    // Use left side as reference for torso angle (or could use average)
    const torsoAngle = calculateAngle(lSh, lHip, lKnee);

    // 1. Hand cheating detection (hand above shoulder while going down)
    const lHandCheat = lWr[1] > lSh[1] + this.HAND_OFFSET_TOLERANCE;
    const rHandCheat = rWr[1] > rSh[1] + this.HAND_OFFSET_TOLERANCE;
    const isHandsCheating = lHandCheat || rHandCheat;

    // 2. Leg split detection
    const torsoLength = calculateDistance(lSh, lHip);
    const ankleDistance = calculateDistance(lAnk, rAnk);
    const feetAreSplit = ankleDistance > torsoLength * this.FEET_SPLIT_RATIO;

    // 3. Knee extension detection
    const kneesAreStraight =
      lKneeAngle > this.STRICT_KNEE_LIMIT || rKneeAngle > this.STRICT_KNEE_LIMIT;

    // --- Logic and Conditions ---
    this.isCorrect = true; // Assume correct first

    // Priority 1: Knee extension (critical error)
    if (kneesAreStraight) {
      this.feedbackCode = 'ERR_BENT_KNEES'; // "Bend Knees!"
      this.isCorrect = false;
      this.stage = null; // Reset stage as penalty
    }
    // Priority 2: Leg split
    else if (feetAreSplit) {
      this.feedbackCode = 'ERR_LEGS_SYNC'; // "Feet Together!"
      this.isCorrect = false;
      this.stage = null;
    }
    // Priority 3: Hands position
    else if (isHandsCheating) {
      this.feedbackCode = 'ERR_HANDS_POSITION'; // "No Hands!"
      this.isCorrect = false;
    }
    // Form is correct -> count reps
    else {
      if (torsoAngle > this.TORSO_DOWN_ANGLE) {
        // Down position
        this.stage = 'down';
        this.feedbackCode = 'CMD_GO_UP';
      } else if (torsoAngle < this.TORSO_UP_ANGLE && this.stage === 'down') {
        // Up position
        this.stage = 'up';
        this.counter += 1;
        this.feedbackCode = 'REP_SUCCESS';
      } else if (this.stage === 'up' && torsoAngle > 60) {
        this.feedbackCode = 'CMD_GO_DOWN';
      }
    }

    return {
      exercise: 'crunch',
      reps: this.counter,
      stage: this.stage,
      feedback_code: this.feedbackCode,
      is_correct: this.isCorrect,
    };
  }

  /**
   * Reset the logic state for a new session
   */
  reset(): void {
    this.counter = 0;
    this.stage = 'down';
    this.feedbackCode = 'START_POSITION';
    this.isCorrect = true;
  }
}
