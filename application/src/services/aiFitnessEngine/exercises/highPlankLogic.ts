/**
 * High Plank Logic - TypeScript Implementation
 * On-Device Exercise Analysis
 *
 * Original Python: AI_Fitness_Engine/Logic_Scripts/high_plank_logic.py
 */

import { Landmark, HighPlankResult, ExerciseLogic } from '../types';
import {
  calculateAngle,
  calculateDistance,
  toPoint,
  getCurrentTime,
  PoseLandmarks,
} from '../utils';

export class HighPlankLogic implements ExerciseLogic {
  private timerVal: number = 0;
  private lastTime: number = 0;
  private feedbackCode: string = 'SETUP_POSITION';
  private isCorrect: boolean = false;

  // Constants (Fine Tuning)
  // 1. Hip clearance: In High Plank, hip should be elevated (~30% of torso length)
  private readonly HIP_CLEARANCE_RATIO = 0.3;

  // 2. Knee clearance: knees must be off the floor
  private readonly KNEE_CLEARANCE_RATIO = 0.15;

  // 3. Elbow angle: must be extended (greater than 160 degrees)
  private readonly ELBOW_MIN_ANGLE = 160;

  // 4. Back angles
  private readonly BACK_ANGLE_MIN = 160; // Less = sagging
  private readonly BACK_ANGLE_MAX = 200; // More = pike position

  /**
   * Analyze landmarks and return high plank exercise result
   *
   * @param landmarks - Array of MediaPipe pose landmarks
   * @returns HighPlankResult with timer, feedback, and form correctness
   */
  analyze(landmarks: Landmark[]): HighPlankResult {
    const currentTime = getCurrentTime();

    // Extract points (left side)
    const lSh = toPoint(landmarks[PoseLandmarks.LEFT_SHOULDER]);
    const lEl = toPoint(landmarks[PoseLandmarks.LEFT_ELBOW]);
    const lWr = toPoint(landmarks[PoseLandmarks.LEFT_WRIST]);
    const lHip = toPoint(landmarks[PoseLandmarks.LEFT_HIP]);
    const lKnee = toPoint(landmarks[PoseLandmarks.LEFT_KNEE]);
    const lAnk = toPoint(landmarks[PoseLandmarks.LEFT_ANKLE]);

    // Geometric calculations
    const elbowAngle = calculateAngle(lSh, lEl, lWr);
    const hipAngle = calculateAngle(lSh, lHip, lKnee);

    const torsoSize = calculateDistance(lSh, lHip);
    const groundY = lAnk[1];

    const hipClearance = groundY - lHip[1];
    const kneeClearance = groundY - lKnee[1];

    // Check horizontal position (to avoid counting while standing)
    const bodyWidthX = Math.abs(lSh[0] - lAnk[0]);
    const bodyHeightY = Math.abs(lSh[1] - lAnk[1]);
    const isHorizontal = bodyWidthX > bodyHeightY;

    this.isCorrect = false;

    // --- Conditions and Logic (Priority Order) ---

    // 1. Check horizontal position
    if (!isHorizontal) {
      this.feedbackCode = 'SETUP_POSITION';
    }
    // 2. Elbow angle (most important for High Plank)
    else if (elbowAngle < this.ELBOW_MIN_ANGLE) {
      this.feedbackCode = 'ERR_BENT_ELBOWS'; // "STRAIGHTEN ARMS!"
    }
    // 3. Hip clearance (if too low, close to ground)
    else if (hipClearance < this.HIP_CLEARANCE_RATIO * torsoSize) {
      this.feedbackCode = 'ERR_HIPS_TOO_LOW'; // "LIFT HIPS HIGHER!"
    }
    // 4. Knee (touching ground)
    else if (kneeClearance < this.KNEE_CLEARANCE_RATIO * torsoSize) {
      this.feedbackCode = 'ERR_KNEES_TOUCHING'; // "KNEES OFF FLOOR!"
    }
    // 5. Back straightness (sagging or piking)
    else if (hipAngle < this.BACK_ANGLE_MIN) {
      this.feedbackCode = 'ERR_HIPS_TOO_LOW'; // Could also be ERR_BACK_SAG
    } else if (hipAngle > this.BACK_ANGLE_MAX) {
      this.feedbackCode = 'ERR_HIPS_TOO_HIGH'; // "LOWER HIPS"
    }
    // Position is correct
    else {
      this.isCorrect = true;
      this.feedbackCode = 'HOLD_FIXED';
    }

    // --- Timer Logic ---
    if (this.isCorrect) {
      if (this.lastTime === 0) {
        this.lastTime = currentTime;
      }

      if (currentTime - this.lastTime >= 1.0) {
        this.timerVal += 1;
        this.lastTime = currentTime;
      }
    } else {
      this.lastTime = 0;
    }

    return {
      exercise: 'high_plank',
      timer: this.timerVal,
      feedback_code: this.feedbackCode,
      is_correct: this.isCorrect,
    };
  }

  /**
   * Reset the logic state for a new session
   */
  reset(): void {
    this.timerVal = 0;
    this.lastTime = 0;
    this.feedbackCode = 'SETUP_POSITION';
    this.isCorrect = false;
  }
}
