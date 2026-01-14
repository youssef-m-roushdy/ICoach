/**
 * Elbow Plank Logic - TypeScript Implementation
 * On-Device Exercise Analysis
 *
 * Original Python: AI_Fitness_Engine/Logic_Scripts/elbow_plank_logic.py
 */

import { Landmark, ElbowPlankResult, ExerciseLogic } from '../types';
import {
  calculateAngle,
  calculateDistance,
  toPoint,
  getCurrentTime,
  PoseLandmarks,
} from '../utils';

export class ElbowPlankLogic implements ExerciseLogic {
  private timerVal: number = 0;
  private lastTime: number = 0;
  private feedbackCode: string = 'SETUP_POSITION';
  private isCorrect: boolean = false;

  // Constants
  private readonly HIP_CLEARANCE_RATIO = 0.15; // Hip clearance ratio
  private readonly KNEE_CLEARANCE_RATIO = 0.05; // Knee clearance ratio
  private readonly ELBOW_MAX_ANGLE = 140; // Elbow must be bent
  private readonly BACK_ANGLE_MIN = 155; // Back straightness (less = sagging)

  /**
   * Analyze landmarks and return elbow plank exercise result
   *
   * @param landmarks - Array of MediaPipe pose landmarks
   * @returns ElbowPlankResult with timer, feedback, and form correctness
   */
  analyze(landmarks: Landmark[]): ElbowPlankResult {
    const currentTime = getCurrentTime();

    // Extract points
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

    // Horizontal check
    const bodyWidthX = Math.abs(lSh[0] - lAnk[0]);
    const bodyHeightY = Math.abs(lSh[1] - lAnk[1]);
    const isHorizontal = bodyWidthX > bodyHeightY;

    this.isCorrect = false;

    // --- Conditions (Priority Order) ---

    // 1. Horizontal position
    if (!isHorizontal) {
      this.feedbackCode = 'SETUP_POSITION'; // "GET INTO POSITION"
    }
    // 2. Hip clearance (off the ground)
    else if (hipClearance < this.HIP_CLEARANCE_RATIO * torsoSize) {
      this.feedbackCode = 'ERR_HIPS_TOO_LOW'; // "LIFT HIPS HIGHER!"
    }
    // 3. Knee clearance (off the ground)
    else if (kneeClearance < this.KNEE_CLEARANCE_RATIO * torsoSize) {
      this.feedbackCode = 'ERR_KNEES_TOUCHING'; // "LEGS OFF FLOOR!"
    }
    // 4. Elbow angle (must be bent in elbow plank)
    else if (elbowAngle > this.ELBOW_MAX_ANGLE) {
      this.feedbackCode = 'ERR_ARMS_TOO_STRAIGHT'; // "BEND ELBOWS"
    }
    // 5. Back straightness (sagging)
    else if (hipAngle < this.BACK_ANGLE_MIN) {
      this.feedbackCode = 'ERR_BACK_SAG'; // "STRAIGHTEN BACK"
    }
    // Position is correct
    else {
      this.isCorrect = true;
      this.feedbackCode = 'HOLD_FIXED'; // "HOLD..."
    }

    // --- Timer Logic ---
    if (this.isCorrect) {
      if (this.lastTime === 0) {
        this.lastTime = currentTime;
      }

      // Add one second every real second
      if (currentTime - this.lastTime >= 1.0) {
        this.timerVal += 1;
        this.lastTime = currentTime;
      }
    } else {
      this.lastTime = 0;
    }

    return {
      exercise: 'elbow_plank',
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
