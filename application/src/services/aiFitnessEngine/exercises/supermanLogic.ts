/**
 * Superman Logic - TypeScript Implementation
 * On-Device Exercise Analysis
 *
 * Original Python: AI_Fitness_Engine/Logic_Scripts/superman_logic.py
 */

import { Landmark, SupermanResult, ExerciseLogic } from '../types';
import { toPoint, getCurrentTime, PoseLandmarks } from '../utils';

export class SupermanLogic implements ExerciseLogic {
  private counter: number = 0;
  private stage: string = 'down';
  private feedbackCode: string = 'ERR_NOT_LYING_FLAT'; // "LIE ON STOMACH"
  private isCorrect: boolean = true;

  // Safety and stability variables
  private hasStarted: boolean = false;
  private holdTimerStart: number = 0; // For calculating hold duration

  // Constants
  private readonly HOLD_DURATION = 0.3; // Required hold duration at top (seconds)
  private readonly LIFT_THRESHOLD = 0.04; // Lift margin (to ensure real lift)

  /**
   * Analyze landmarks and return superman exercise result
   *
   * @param landmarks - Array of MediaPipe pose landmarks
   * @returns SupermanResult with reps, feedback, and hold timer
   */
  analyze(landmarks: Landmark[]): SupermanResult {
    const currentTime = getCurrentTime();

    // Extract points
    const lSh = toPoint(landmarks[PoseLandmarks.LEFT_SHOULDER]);
    const lWr = toPoint(landmarks[PoseLandmarks.LEFT_WRIST]);
    const lHip = toPoint(landmarks[PoseLandmarks.LEFT_HIP]);
    const lAnk = toPoint(landmarks[PoseLandmarks.LEFT_ANKLE]);

    // 1. Check lying position (for start only)
    // Difference in X (body width) must be greater than difference in Y (body height)
    const torsoDx = Math.abs(lSh[0] - lHip[0]);
    const torsoDy = Math.abs(lSh[1] - lHip[1]);
    const isLyingFlat = torsoDx > torsoDy;

    // Conditions: hands and feet above hip (Y value smaller = higher)
    const handsUp = lWr[1] < lSh[1] - this.LIFT_THRESHOLD;
    const legsUp = lAnk[1] < lHip[1] - this.LIFT_THRESHOLD;

    // ==========================================
    // 🛑 1. Start Verification
    // ==========================================
    if (!isLyingFlat) {
      this.feedbackCode = 'ERR_NOT_LYING_FLAT';
      this.hasStarted = false;
      this.holdTimerStart = 0;
    } else if (!this.hasStarted) {
      this.feedbackCode = 'SYSTEM_READY_GO'; // "READY"
      this.hasStarted = true;
    }
    // ==========================================
    // 🚀 2. Strict Logic with Hold
    // ==========================================
    else {
      // --- Case 1: Attempting to go up (Checking Up) ---
      if (handsUp && legsUp) {
        // 1. Have we started holding?
        if (this.holdTimerStart === 0) {
          this.holdTimerStart = currentTime;
        }

        // 2. Calculate hold duration
        const holdDuration = currentTime - this.holdTimerStart;

        // 3. If held long enough -> count rep
        if (holdDuration > this.HOLD_DURATION) {
          if (this.stage === 'down') {
            this.stage = 'up';
            this.counter += 1;
            this.feedbackCode = 'REP_SUCCESS'; // "GOOD!"
          } else {
            // Already held and rep counted
            this.feedbackCode = 'HOLD_STABILIZE'; // "HOLD..."
          }
        } else {
          // Still holding
          this.feedbackCode = 'HOLD_STABILIZE';
        }
      }
      // --- Case 2: Going down (Reset) ---
      // Strict condition: both must lower to prepare for next rep
      else if (!handsUp && !legsUp) {
        this.stage = 'down';
        this.feedbackCode = 'CMD_GO_UP'; // "UP" / "FLY UP"
        this.holdTimerStart = 0;
      }
      // --- Case 3: Errors (Mixed) ---
      else {
        this.holdTimerStart = 0; // Break hold -> reset timer

        // If lifting only one part while down
        if (this.stage === 'down') {
          if (handsUp && !legsUp) {
            this.feedbackCode = 'ERR_LIFT_LEGS'; // "LIFT LEGS TOO!"
          } else if (!handsUp && legsUp) {
            this.feedbackCode = 'ERR_LIFT_ARMS'; // "LIFT ARMS TOO!"
          }
        }
        // If lowered only one part while up (tired perhaps)
        else {
          this.feedbackCode = 'ERR_RESET_FULL'; // "RESET POSITION"
        }
      }
    }

    return {
      exercise: 'superman',
      reps: this.counter,
      stage: this.stage,
      feedback_code: this.feedbackCode,
      hold_timer: this.holdTimerStart, // For progress bar on mobile
    };
  }

  /**
   * Reset the logic state for a new session
   */
  reset(): void {
    this.counter = 0;
    this.stage = 'down';
    this.feedbackCode = 'ERR_NOT_LYING_FLAT';
    this.isCorrect = true;
    this.hasStarted = false;
    this.holdTimerStart = 0;
  }
}
