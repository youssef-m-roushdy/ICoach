
/**
 * High Plank Logic - TypeScript Implementation (Tuned: slightly less strict + stable)
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

  // ✅ NEW: stability window to avoid flicker
  private correctStableStart: number = 0;

  // -------------------- Tuned Constants (Less strict but not loose) --------------------

  // hip clearance in plank: was 0.30 (strict) -> 0.26 (slightly easier)
  private readonly HIP_CLEARANCE_RATIO = 0.26;

  // knee clearance: was 0.15 -> 0.12
  private readonly KNEE_CLEARANCE_RATIO = 0.12;

  // elbow extension: was 160 -> 155
  private readonly ELBOW_MIN_ANGLE = 155;

  // back (shoulder-hip-knee): was 160..200 -> 155..205
  private readonly BACK_ANGLE_MIN = 155;
  private readonly BACK_ANGLE_MAX = 205;

  // ✅ Hysteresis margins (to prevent rapid toggling)
  private readonly ANGLE_HYS = 4;        // degrees
  private readonly RATIO_HYS = 0.02;     // ratio margin

  // ✅ Stability time before starting timer
  private readonly CORRECT_STABLE_MS = 400;

  analyze(landmarks: Landmark[]): HighPlankResult {
    const currentTime = getCurrentTime(); // assumed seconds (float)

    // ---------- Extract points (Left) ----------
    const lSh = toPoint(landmarks[PoseLandmarks.LEFT_SHOULDER]);
    const lEl = toPoint(landmarks[PoseLandmarks.LEFT_ELBOW]);
    const lWr = toPoint(landmarks[PoseLandmarks.LEFT_WRIST]);
    const lHip = toPoint(landmarks[PoseLandmarks.LEFT_HIP]);
    const lKnee = toPoint(landmarks[PoseLandmarks.LEFT_KNEE]);
    const lAnk = toPoint(landmarks[PoseLandmarks.LEFT_ANKLE]);

    // ---------- Extract points (Right) ----------
    const rSh = toPoint(landmarks[PoseLandmarks.RIGHT_SHOULDER]);
    const rEl = toPoint(landmarks[PoseLandmarks.RIGHT_ELBOW]);
    const rWr = toPoint(landmarks[PoseLandmarks.RIGHT_WRIST]);
    const rHip = toPoint(landmarks[PoseLandmarks.RIGHT_HIP]);
    const rKnee = toPoint(landmarks[PoseLandmarks.RIGHT_KNEE]);
    const rAnk = toPoint(landmarks[PoseLandmarks.RIGHT_ANKLE]);

    // ---------- Geometric calculations (both sides, averaged) ----------
    const elbowAngleL = calculateAngle(lSh, lEl, lWr);
    const elbowAngleR = calculateAngle(rSh, rEl, rWr);
    const elbowAngle = (elbowAngleL + elbowAngleR) / 2;

    const hipAngleL = calculateAngle(lSh, lHip, lKnee);
    const hipAngleR = calculateAngle(rSh, rHip, rKnee);
    const hipAngle = (hipAngleL + hipAngleR) / 2;

    const torsoSizeL = calculateDistance(lSh, lHip);
    const torsoSizeR = calculateDistance(rSh, rHip);
    const torsoSize = (torsoSizeL + torsoSizeR) / 2;

    // Ground reference using average ankle Y
    const groundY = (lAnk[1] + rAnk[1]) / 2;

    const hipY = (lHip[1] + rHip[1]) / 2;
    const kneeY = (lKnee[1] + rKnee[1]) / 2;

    const hipClearance = groundY - hipY;
    const kneeClearance = groundY - kneeY;

    // ✅ Slightly more tolerant horizontal check:
    // previously: bodyWidthX > bodyHeightY (can be strict)
    // now: allow near-equal by using multiplier 0.85
    const shX = (lSh[0] + rSh[0]) / 2;
    const ankX = (lAnk[0] + rAnk[0]) / 2;
    const shY = (lSh[1] + rSh[1]) / 2;
    const ankY = (lAnk[1] + rAnk[1]) / 2;

    const bodyWidthX = Math.abs(shX - ankX);
    const bodyHeightY = Math.abs(shY - ankY);
    const isHorizontal = bodyWidthX > bodyHeightY * 0.85;

    // Reset
    let wantCorrect = false;
    this.feedbackCode = this.feedbackCode || 'SETUP_POSITION';

    // -------------------- Decision Logic (with hysteresis) --------------------
    // Hysteresis rule:
    // - if currently correct, use "looser" exit thresholds
    // - if currently incorrect, use "stricter" enter thresholds
    const elbowEnter = this.ELBOW_MIN_ANGLE;                 // to become correct
    const elbowExit = this.ELBOW_MIN_ANGLE - this.ANGLE_HYS; // to leave correct

    const hipClrEnter = this.HIP_CLEARANCE_RATIO * torsoSize;
    const hipClrExit  = (this.HIP_CLEARANCE_RATIO - this.RATIO_HYS) * torsoSize;

    const kneeClrEnter = this.KNEE_CLEARANCE_RATIO * torsoSize;
    const kneeClrExit  = (this.KNEE_CLEARANCE_RATIO - this.RATIO_HYS) * torsoSize;

    const backMinEnter = this.BACK_ANGLE_MIN;
    const backMinExit  = this.BACK_ANGLE_MIN - this.ANGLE_HYS;

    const backMaxEnter = this.BACK_ANGLE_MAX;
    const backMaxExit  = this.BACK_ANGLE_MAX + this.ANGLE_HYS;

    // 1) Setup position
    if (!isHorizontal) {
      this.feedbackCode = 'SETUP_POSITION';
      wantCorrect = false;
    }
    // 2) Elbows
    else {
      const elbowOk = this.isCorrect ? (elbowAngle >= elbowExit) : (elbowAngle >= elbowEnter);
      if (!elbowOk) {
        this.feedbackCode = 'ERR_BENT_ELBOWS';
        wantCorrect = false;
      } else {
        // 3) Hips too low
        const hipOk = this.isCorrect ? (hipClearance >= hipClrExit) : (hipClearance >= hipClrEnter);
        if (!hipOk) {
          this.feedbackCode = 'ERR_HIPS_TOO_LOW';
          wantCorrect = false;
        } else {
          // 4) Knees touching
          const kneeOk = this.isCorrect ? (kneeClearance >= kneeClrExit) : (kneeClearance >= kneeClrEnter);
          if (!kneeOk) {
            this.feedbackCode = 'ERR_KNEES_TOUCHING';
            wantCorrect = false;
          } else {
            // 5) Back angle (sag/pike)
            const backOkMin = this.isCorrect ? (hipAngle >= backMinExit) : (hipAngle >= backMinEnter);
            if (!backOkMin) {
              this.feedbackCode = 'ERR_HIPS_TOO_LOW'; // or ERR_BACK_SAG
              wantCorrect = false;
            } else {
              const backOkMax = this.isCorrect ? (hipAngle <= backMaxExit) : (hipAngle <= backMaxEnter);
              if (!backOkMax) {
                this.feedbackCode = 'ERR_HIPS_TOO_HIGH';
                wantCorrect = false;
              } else {
                // ✅ candidate for correct
                this.feedbackCode = 'HOLD_FIXED';
                wantCorrect = true;
              }
            }
          }
        }
      }
    }

    // -------------------- Stability Gate --------------------
    // We only consider it truly correct if it stays correct for CORRECT_STABLE_MS
    const nowMs = Date.now();

    if (wantCorrect) {
      if (this.correctStableStart === 0) this.correctStableStart = nowMs;

      const stableFor = nowMs - this.correctStableStart;
      this.isCorrect = stableFor >= this.CORRECT_STABLE_MS;
      if (!this.isCorrect) {
        // Still stabilizing
        this.feedbackCode = 'HOLD_STEADY';
      }
    } else {
      this.correctStableStart = 0;
      this.isCorrect = false;
    }

    // -------------------- Timer Logic --------------------
    if (this.isCorrect) {
      if (this.lastTime === 0) this.lastTime = currentTime;

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

  reset(): void {
    this.timerVal = 0;
    this.lastTime = 0;
    this.feedbackCode = 'SETUP_POSITION';
    this.isCorrect = false;
    this.correctStableStart = 0;
  }
}
