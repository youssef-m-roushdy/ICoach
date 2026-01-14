/**
 * Leg Raises Logic - TypeScript Implementation
 * On-Device Exercise Analysis
 *
 * Original Python: AI_Fitness_Engine/Logic_Scripts/leg_raises_logic.py
 */

import { Landmark, LegRaisesResult, ExerciseLogic } from '../types';
import { calculateAngle, toPoint, PoseLandmarks } from '../utils';

export class LegRaisesLogic implements ExerciseLogic {
  private counter: number = 0;
  private stage: string = 'down'; // Starting position
  private feedbackCode: string = 'START_POSITION';
  private isCorrect: boolean = true;

  // Constants (Angles)
  private readonly KNEE_MIN_ANGLE = 140; // Below this = bent knee (error)
  private readonly LEGS_SYNC_DIFF = 35; // Max allowed difference between legs
  private readonly HIP_ANGLE_UP = 125; // Angle for counting rep (going up)
  private readonly HIP_ANGLE_DOWN = 150; // Angle for down position (returning to ground)

  /**
   * Analyze landmarks and return leg raises exercise result
   *
   * @param landmarks - Array of MediaPipe pose landmarks
   * @returns LegRaisesResult with reps, feedback, and form correctness
   */
  analyze(landmarks: Landmark[]): LegRaisesResult {
    // Extract points
    const lSh = toPoint(landmarks[PoseLandmarks.LEFT_SHOULDER]);
    const rSh = toPoint(landmarks[PoseLandmarks.RIGHT_SHOULDER]);

    const lHip = toPoint(landmarks[PoseLandmarks.LEFT_HIP]);
    const rHip = toPoint(landmarks[PoseLandmarks.RIGHT_HIP]);

    const lKnee = toPoint(landmarks[PoseLandmarks.LEFT_KNEE]);
    const rKnee = toPoint(landmarks[PoseLandmarks.RIGHT_KNEE]);

    const lAnk = toPoint(landmarks[PoseLandmarks.LEFT_ANKLE]);
    const rAnk = toPoint(landmarks[PoseLandmarks.RIGHT_ANKLE]);

    // Calculations
    const lHipAngle = calculateAngle(lSh, lHip, lKnee);
    const rHipAngle = calculateAngle(rSh, rHip, rKnee);
    const avgHipAngle = (lHipAngle + rHipAngle) / 2;

    const lKneeAngle = calculateAngle(lHip, lKnee, lAnk);
    const rKneeAngle = calculateAngle(rHip, rKnee, rAnk);

    // --- Phase 1: Error Detection (Strict Check) ---
    // Priority: if there's an error, the counter won't work at all

    let hasError = false;
    this.isCorrect = true;

    // 1. Knee check (must be extended)
    if (lKneeAngle < this.KNEE_MIN_ANGLE || rKneeAngle < this.KNEE_MIN_ANGLE) {
      this.feedbackCode = 'ERR_BENT_KNEES'; // "STRAIGHTEN LEGS!"
      this.isCorrect = false;
      hasError = true;
    }
    // 2. Leg sync check
    else if (Math.abs(lHipAngle - rHipAngle) > this.LEGS_SYNC_DIFF) {
      this.feedbackCode = 'ERR_LEGS_SYNC'; // "LEGS TOGETHER!"
      this.isCorrect = false;
      hasError = true;
    }

    // --- Phase 2: Counting Logic (only if no errors) ---
    if (!hasError) {
      this.isCorrect = true;

      // 1. Up phase
      if (avgHipAngle < this.HIP_ANGLE_UP) {
        // Legs raised
        if (this.stage === 'down') {
          this.stage = 'up';
          this.counter += 1;
          this.feedbackCode = 'REP_SUCCESS'; // "GOOD!"
        } else if (this.stage === 'up') {
          this.feedbackCode = 'CMD_LOWER_SLOWLY'; // "LOWER"
        }
      }
      // 2. Down phase
      else if (avgHipAngle > this.HIP_ANGLE_DOWN) {
        // Legs on ground
        if (this.stage === 'up') {
          // Lowered legs after valid rep
          this.feedbackCode = 'CMD_RAISE_LEGS'; // "UP"
        } else {
          // Just started or resting on ground
          this.feedbackCode = 'START_POSITION';
        }
        this.stage = 'down';
      }
      // Middle zone (between up and down)
      else {
        if (this.stage === 'down') {
          this.feedbackCode = 'CMD_RAISE_LEGS'; // "HIGHER"
        } else if (this.stage === 'up') {
          this.feedbackCode = 'CMD_LOWER_SLOWLY';
        }
      }
    }
    // If there's an error, keep error message and prevent counting
    // (stage doesn't change during error to prevent half-rep counting)

    return {
      exercise: 'leg_raises',
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
