
/**
 * Elbow Plank Logic - TypeScript Implementation (Slightly less strict + Anti-Cheat + Stable)
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

  // ✅ Stability window to avoid flicker and make counting easier
  private correctStableStart: number = 0;

  // -------------------- Tuned Constants (less strict, not loose) --------------------

  // was 0.15 -> 0.12 (slightly easier)
  private readonly HIP_CLEARANCE_RATIO = 0.12;

  // was 0.05 -> 0.04 (slightly easier)
  private readonly KNEE_CLEARANCE_RATIO = 0.04;

  // elbow plank: elbows should be bent
  // was max 140 -> 150 (slightly easier)
  private readonly ELBOW_MAX_ANGLE = 150;

  // ✅ Anti-cheat: prevent "too bent / collapsed" cases (or landmark noise)
  private readonly ELBOW_MIN_ANGLE = 70;

  // back straightness
  // was min 155 -> 150 (slightly easier)
  private readonly BACK_ANGLE_MIN = 150;

  // ✅ Anti-cheat: detect pike (hips too high)
  private readonly BACK_ANGLE_MAX = 205;

  // ✅ Hysteresis to reduce toggling
  private readonly ANGLE_HYS = 4;      // degrees
  private readonly RATIO_HYS = 0.02;   // ratio margin

  // ✅ Stability before starting timer (easier than 400ms)
  private readonly CORRECT_STABLE_MS = 300;

  analyze(landmarks: Landmark[]): ElbowPlankResult {
    const currentTime = getCurrentTime(); // assumed seconds (float)
    const nowMs = Date.now();

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

    // ---------- Angles (averaged) ----------
    const elbowAngleL = calculateAngle(lSh, lEl, lWr);
    const elbowAngleR = calculateAngle(rSh, rEl, rWr);
    const elbowAngle = (elbowAngleL + elbowAngleR) / 2;

    const hipAngleL = calculateAngle(lSh, lHip, lKnee); // shoulder-hip-knee
    const hipAngleR = calculateAngle(rSh, rHip, rKnee);
    const hipAngle = (hipAngleL + hipAngleR) / 2;

    // ---------- Size & clearance ----------
    const torsoSizeL = calculateDistance(lSh, lHip);
    const torsoSizeR = calculateDistance(rSh, rHip);
    const torsoSize = (torsoSizeL + torsoSizeR) / 2;

    // ground reference using avg ankle Y
    const groundY = (lAnk[1] + rAnk[1]) / 2;

    const hipY = (lHip[1] + rHip[1]) / 2;
    const kneeY = (lKnee[1] + rKnee[1]) / 2;

    const hipClearance = groundY - hipY;
    const kneeClearance = groundY - kneeY;

    // ---------- Horizontal check (more tolerant) ----------
    const shX = (lSh[0] + rSh[0]) / 2;
    const ankX = (lAnk[0] + rAnk[0]) / 2;
    const shY = (lSh[1] + rSh[1]) / 2;
    const ankY = (lAnk[1] + rAnk[1]) / 2;

    const bodyWidthX = Math.abs(shX - ankX);
    const bodyHeightY = Math.abs(shY - ankY);

    // was: width > height ; now: width > height*0.85 (easier)
    const isHorizontal = bodyWidthX > bodyHeightY * 0.85;

    // -------------------- Decision (with hysteresis) --------------------
    let wantCorrect = false;

    // Enter vs Exit thresholds (hysteresis)
    const hipEnter = this.HIP_CLEARANCE_RATIO * torsoSize;
    const hipExit  = (this.HIP_CLEARANCE_RATIO - this.RATIO_HYS) * torsoSize;

    const kneeEnter = this.KNEE_CLEARANCE_RATIO * torsoSize;
    const kneeExit  = (this.KNEE_CLEARANCE_RATIO - this.RATIO_HYS) * torsoSize;

    const elbowMaxEnter = this.ELBOW_MAX_ANGLE;
    const elbowMaxExit  = this.ELBOW_MAX_ANGLE + this.ANGLE_HYS;

    const elbowMinEnter = this.ELBOW_MIN_ANGLE;
    const elbowMinExit  = this.ELBOW_MIN_ANGLE - this.ANGLE_HYS;

    const backMinEnter = this.BACK_ANGLE_MIN;
    const backMinExit  = this.BACK_ANGLE_MIN - this.ANGLE_HYS;

    const backMaxEnter = this.BACK_ANGLE_MAX;
    const backMaxExit  = this.BACK_ANGLE_MAX + this.ANGLE_HYS;

    // 1) Must be horizontal
    if (!isHorizontal) {
      this.feedbackCode = 'SETUP_POSITION';
      wantCorrect = false;
    } else {
      // 2) Hips must be off ground
      const hipOk = this.isCorrect ? (hipClearance >= hipExit) : (hipClearance >= hipEnter);
      if (!hipOk) {
        this.feedbackCode = 'ERR_HIPS_TOO_LOW';
        wantCorrect = false;
      } else {
        // 3) Knees must be off ground (prevent kneeling cheat)
        const kneeOk = this.isCorrect ? (kneeClearance >= kneeExit) : (kneeClearance >= kneeEnter);
        if (!kneeOk) {
          this.feedbackCode = 'ERR_KNEES_TOUCHING';
          wantCorrect = false;
        } else {
          // 4) Elbow must be bent (not too straight = high plank cheat)
          const elbowNotTooStraight = this.isCorrect ? (elbowAngle <= elbowMaxExit) : (elbowAngle <= elbowMaxEnter);
          if (!elbowNotTooStraight) {
            this.feedbackCode = 'ERR_ARMS_TOO_STRAIGHT';
            wantCorrect = false;
          } else {
            // 4b) Anti-cheat: elbow not extremely folded/collapsed (or noisy)
            const elbowNotTooBent = this.isCorrect ? (elbowAngle >= elbowMinExit) : (elbowAngle >= elbowMinEnter);
            if (!elbowNotTooBent) {
              this.feedbackCode = 'ERR_BAD_ELBOW_POSITION'; // add mapping: "ثبت كوعك تحت كتفك"
              wantCorrect = false;
            } else {
              // 5) Back straightness (sagging)
              const backOkMin = this.isCorrect ? (hipAngle >= backMinExit) : (hipAngle >= backMinEnter);
              if (!backOkMin) {
                this.feedbackCode = 'ERR_BACK_SAG';
                wantCorrect = false;
              } else {
                // 6) Anti-cheat: hips too high (pike)
                const backOkMax = this.isCorrect ? (hipAngle <= backMaxExit) : (hipAngle <= backMaxEnter);
                if (!backOkMax) {
                  this.feedbackCode = 'ERR_HIPS_TOO_HIGH'; // add mapping: "وطي الحوض شوية"
                  wantCorrect = false;
                } else {
                  // ✅ Candidate correct
                  this.feedbackCode = 'HOLD_FIXED';
                  wantCorrect = true;
                }
              }
            }
          }
        }
      }
    }

    // -------------------- Stability Gate --------------------
    if (wantCorrect) {
      if (this.correctStableStart === 0) this.correctStableStart = nowMs;

      const stableFor = nowMs - this.correctStableStart;
      this.isCorrect = stableFor >= this.CORRECT_STABLE_MS;

      if (!this.isCorrect) {
        // still stabilizing - helps it "start counting easier" without flicker
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
      exercise: 'elbow_plank',
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
``
