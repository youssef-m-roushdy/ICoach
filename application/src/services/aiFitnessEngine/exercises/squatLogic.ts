/**
 * Squat Logic - TypeScript Implementation
 * On-Device Exercise Analysis
 *
 * Original Python: AI_Fitness_Engine/Logic_Scripts/squat_logic.py
 */

import { Landmark, SquatResult, ExerciseLogic } from '../types';
import { calculateAngle, toPoint, getCurrentTime, PoseLandmarks } from '../utils';

export class SquatLogic implements ExerciseLogic {
  private counter: number = 0;
  private stage: string = 'up';
  private feedbackCode: string = 'STEP_BACK';
  private isCorrect: boolean = true;

  // Setup System Variables
  private isSystemActive: boolean = false;
  private setupTimerStart: number = 0;

  // Constants
  private readonly HOLD_DURATION = 5.0; // Required hold duration (5 seconds)
  private readonly KNEE_ANGLE_STAND = 165; // Standing angle (legs extended)
  private readonly KNEE_ANGLE_DOWN = 100; // Down position angle (relatively easy)

  // Depth tolerance: hip can be slightly above knee level (Parallel)
  private readonly DEPTH_TOLERANCE = 0.05;

  /**
   * Check if the full body is visible in the camera frame
   */
  private checkVisibility(landmarks: Landmark[]): boolean {
    const noseY = landmarks[PoseLandmarks.NOSE].y;
    const lAnkY = landmarks[PoseLandmarks.LEFT_ANKLE].y;
    const rAnkY = landmarks[PoseLandmarks.RIGHT_ANKLE].y;

    // Head must be visible (below top edge)
    const headVisible = noseY > 0.02;

    // Feet must be visible (above bottom edge)
    const avgAnkleY = (lAnkY + rAnkY) / 2;
    const feetVisible = avgAnkleY < 0.98;

    return headVisible && feetVisible;
  }

  /**
   * Analyze landmarks and return squat exercise result
   *
   * @param landmarks - Array of MediaPipe pose landmarks
   * @returns SquatResult with reps, feedback, and system state
   */
  analyze(landmarks: Landmark[]): SquatResult {
    const currentTime = getCurrentTime();

    // Extract key points
    const lHip = toPoint(landmarks[PoseLandmarks.LEFT_HIP]);
    const lKnee = toPoint(landmarks[PoseLandmarks.LEFT_KNEE]);
    const lAnk = toPoint(landmarks[PoseLandmarks.LEFT_ANKLE]);

    // Calculate knee angle
    const kneeAngle = calculateAngle(lHip, lKnee, lAnk);

    // Calculate depth: is the hip at or below knee level?
    // (Y increases downward, so hip > knee means hip is below knee)
    const hipY = landmarks[PoseLandmarks.LEFT_HIP].y;
    const kneeY = landmarks[PoseLandmarks.LEFT_KNEE].y;
    const isDeepEnough = hipY > kneeY - this.DEPTH_TOLERANCE;

    // ==========================================
    // 🛑 1. Setup Phase (System Check)
    // ==========================================
    if (!this.isSystemActive) {
      // 1. Visibility check
      if (!this.checkVisibility(landmarks)) {
        this.feedbackCode = 'ERR_BODY_NOT_VISIBLE'; // "STEP BACK"
        this.setupTimerStart = 0;
      }
      // 2. Stability check (standing straight)
      else if (kneeAngle > this.KNEE_ANGLE_STAND) {
        if (this.setupTimerStart === 0) {
          this.setupTimerStart = currentTime;
        }

        // Calculate remaining time
        const holdTime = currentTime - this.setupTimerStart;
        const remaining = this.HOLD_DURATION - Math.floor(holdTime);

        if (remaining > 0) {
          // Send remaining time as part of feedback code for mobile to display
          this.feedbackCode = `SETUP_HOLD_${remaining}`;
        } else {
          // Hold complete -> activate system
          this.isSystemActive = true;
          this.feedbackCode = 'SYSTEM_READY_GO'; // "GO DOWN"
        }
      } else {
        // Moving or not standing correctly
        this.setupTimerStart = 0;
        this.feedbackCode = 'SETUP_STAND_STRAIGHT';
      }
    }
    // ==========================================
    // 🟢 2. Exercise Phase (Active Mode)
    // ==========================================
    else {
      // 1. Standing position (UP)
      if (kneeAngle > 160) {
        this.stage = 'up';
        this.feedbackCode = 'CMD_GO_DOWN';
      }
      // 2. Down position (DOWN)
      else if (kneeAngle < this.KNEE_ANGLE_DOWN && isDeepEnough) {
        if (this.stage === 'up') {
          this.stage = 'down';
          this.counter += 1;
          this.feedbackCode = 'REP_SUCCESS'; // "PERFECT"
        }
      }
      // 3. Going down but not deep enough yet
      else if (kneeAngle < 140 && !isDeepEnough) {
        if (this.stage === 'up') {
          this.feedbackCode = 'FIX_LOWER_HIPS'; // "LOWER..."
        }
      }
    }

    return {
      exercise: 'squat',
      reps: this.counter,
      stage: this.stage,
      feedback_code: this.feedbackCode,
      is_system_active: this.isSystemActive,
    };
  }

  /**
   * Reset the logic state for a new session
   */
  reset(): void {
    this.counter = 0;
    this.stage = 'up';
    this.feedbackCode = 'STEP_BACK';
    this.isCorrect = true;
    this.isSystemActive = false;
    this.setupTimerStart = 0;
  }
}
