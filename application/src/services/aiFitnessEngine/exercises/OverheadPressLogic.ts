
/**
 * Standing Overhead Press Logic - Anti-Cheat + No Random Counting (Both Arms Required)
 * - Counts only on FULL cycle: valid TOP -> valid BOTTOM
 * - Uses BOTH arms (left + right) with sync checks
 * - Anti-cheat: arched back, low elbows, unsynced arms
 * - Prevents random reps: EMA smoothing + stability windows + cooldown + stage hold + invalidation
 */

import { Landmark, OverheadPressResult, ExerciseLogic } from '../types';
import { PoseLandmarks } from '../utils';

// ============================================================================
// 1) EMA helper (smoothing)
// ============================================================================
class EMA {
  private alpha: number;
  private value: number | null = null;
  constructor(alpha: number = 0.3) { this.alpha = alpha; }

  update(x: number): number {
    if (this.value === null) this.value = x;
    else this.value = this.alpha * x + (1 - this.alpha) * this.value;
    return this.value;
  }

  reset() { this.value = null; }
}

export class OverheadPressLogic implements ExerciseLogic {
  private reps = 0;
  private stage: 'down' | 'up' = 'down';   // start at bottom
  private feedbackCode: string = 'SETUP_POSITION';
  private isCorrect = false;

  // timing guards
  private lastRepTime = 0;
  private lastStageChangeTime = 0;

  // stability timers
  private topStableStart = 0;
  private bottomStableStart = 0;

  // rep invalidation
  private repInvalidated = false;
  private repInvalidReason: string | null = null;

  // smoothing
  private emaElbowL = new EMA(0.28);
  private emaElbowR = new EMA(0.28);
  private emaLiftL = new EMA(0.30);
  private emaLiftR = new EMA(0.30);
  private emaBackLean = new EMA(0.25);

  // =========================================================
  // ⚙️ Tuned constants (balanced: not too strict, not loose)
  // =========================================================

  // Elbow angles: shoulder-elbow-wrist
  // Bottom: elbows bent (near shoulders), Top: arms near straight
  private readonly ELBOW_TOP_MIN = 155;      // was 160 (easier but still lockout)
  private readonly ELBOW_BOTTOM_MAX = 95;    // was 75 (easier to detect bottom)

  // Wrist lift relative to shoulder: lift = (shoulderY - wristY)
  // y increases downwards => larger lift means wrist higher above shoulder
  private readonly TOP_LIFT_MIN = 0.20;      // wrist clearly above shoulder at top
  private readonly BOTTOM_LIFT_MAX = 0.06;   // wrist near shoulder at bottom

  // Back lean (anti-arching): avg |shoulder.x - hip.x|
  private readonly MAX_BACK_LEAN = 0.18;     // was 0.15 (less strict, still safe)
  private readonly MAX_BACK_LEAN_EXIT = 0.16; // hysteresis (when already error, must recover more)

  // Elbows too low: elbow below shoulder by margin (y bigger => lower)
  private readonly ELBOW_LOW_MARGIN = 0.14;  // was 0.15 (slightly easier)

  // Sync checks (both arms must be close)
  private readonly ELBOW_SYNC_TOL = 18;      // degrees difference
  private readonly LIFT_SYNC_TOL = 0.08;     // wrist height difference

  // Timing (anti-random)
  private readonly TOP_STABLE_MS = 160;
  private readonly BOTTOM_STABLE_MS = 160;
  private readonly REP_COOLDOWN_MS = 850;
  private readonly MIN_STAGE_HOLD_MS = 160;

  // Visibility threshold (slightly easier)
  private readonly VIS_MIN = 0.45;

  // =========================================================
  // Geometry
  // =========================================================
  private calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) -
      Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  }

  private checkVisibility(landmarks: Landmark[], indices: number[]): boolean {
    return indices.every(idx => (landmarks[idx]?.visibility || 0) > this.VIS_MIN);
  }

  private invalidateRep(reason: string) {
    this.repInvalidated = true;
    this.repInvalidReason = reason;
  }

  private resetTransient() {
    this.topStableStart = 0;
    this.bottomStableStart = 0;
    this.repInvalidated = false;
    this.repInvalidReason = null;
  }

  analyze(landmarks: Landmark[]): OverheadPressResult {
    const nowMs = Date.now();

    // ✅ must see both arms + hips (standing)
    const indices = [
      PoseLandmarks.LEFT_SHOULDER, PoseLandmarks.RIGHT_SHOULDER,
      PoseLandmarks.LEFT_ELBOW, PoseLandmarks.RIGHT_ELBOW,
      PoseLandmarks.LEFT_WRIST, PoseLandmarks.RIGHT_WRIST,
      PoseLandmarks.LEFT_HIP, PoseLandmarks.RIGHT_HIP,
    ];

    if (!this.checkVisibility(landmarks, indices)) {
      // don't spam counts if tracking lost
      this.isCorrect = false;
      this.resetTransient();
      this.feedbackCode = 'ERR_CAMERA_VIEW';
      return this.createResult(this.feedbackCode);
    }

    // Points
    const lSh = landmarks[PoseLandmarks.LEFT_SHOULDER];
    const rSh = landmarks[PoseLandmarks.RIGHT_SHOULDER];
    const lEl = landmarks[PoseLandmarks.LEFT_ELBOW];
    const rEl = landmarks[PoseLandmarks.RIGHT_ELBOW];
    const lWr = landmarks[PoseLandmarks.LEFT_WRIST];
    const rWr = landmarks[PoseLandmarks.RIGHT_WRIST];
    const lHip = landmarks[PoseLandmarks.LEFT_HIP];
    const rHip = landmarks[PoseLandmarks.RIGHT_HIP];

    // Angles (smooth)
    const elbowAngleL = this.emaElbowL.update(this.calculateAngle(lSh, lEl, lWr));
    const elbowAngleR = this.emaElbowR.update(this.calculateAngle(rSh, rEl, rWr));
    const elbowMin = Math.min(elbowAngleL, elbowAngleR);
    const elbowDiff = Math.abs(elbowAngleL - elbowAngleR);

    // Lift (smooth): shoulderY - wristY
    const liftL = this.emaLiftL.update(lSh.y - lWr.y);
    const liftR = this.emaLiftR.update(rSh.y - rWr.y);
    const liftDiff = Math.abs(liftL - liftR);

    // Back lean (smooth): avg |shoulder.x - hip.x|
    const backLeanRaw = (Math.abs(lSh.x - lHip.x) + Math.abs(rSh.x - rHip.x)) / 2;
    const backLean = this.emaBackLean.update(backLeanRaw);

    // Guards
    const canChangeStage = (nowMs - this.lastStageChangeTime) >= this.MIN_STAGE_HOLD_MS;
    const repReady = (nowMs - this.lastRepTime) >= this.REP_COOLDOWN_MS;

    // Conditions for top/bottom (BOTH arms)
    const bothAtTop =
      elbowMin >= this.ELBOW_TOP_MIN &&
      liftL >= this.TOP_LIFT_MIN &&
      liftR >= this.TOP_LIFT_MIN;

    const bothAtBottom =
      elbowMin <= this.ELBOW_BOTTOM_MAX &&
      liftL <= this.BOTTOM_LIFT_MAX &&
      liftR <= this.BOTTOM_LIFT_MAX;

    // Sync requirement (mainly near top to avoid annoyance)
    const nearTop = (liftL >= this.TOP_LIFT_MIN * 0.75) || (liftR >= this.TOP_LIFT_MIN * 0.75);
    const syncOk = (!nearTop) || (elbowDiff <= this.ELBOW_SYNC_TOL && liftDiff <= this.LIFT_SYNC_TOL);

    // Anti-cheat: elbows too low (resting)
    const elbowsLow = (lEl.y > lSh.y + this.ELBOW_LOW_MARGIN) || (rEl.y > rSh.y + this.ELBOW_LOW_MARGIN);

    // Anti-cheat: arched back (with hysteresis)
    const backLeanLimit = (this.feedbackCode === 'ERR_ARCHED_BACK') ? this.MAX_BACK_LEAN_EXIT : this.MAX_BACK_LEAN;
    const isArchedBack = backLean > backLeanLimit;

    // Default
    this.isCorrect = false;

    // =========================================================
    // Priority: safety / cheat checks
    // =========================================================

    if (isArchedBack) {
      // if in rep, invalidate it (prevents counting while leaning)
      if (this.stage === 'up') this.invalidateRep('REP_INVALID_ARCHED_BACK');
      this.resetTopBottomStability();
      this.feedbackCode = 'ERR_ARCHED_BACK';
      return this.createResult(this.feedbackCode);
    }

    if (elbowsLow) {
      if (this.stage === 'up') this.invalidateRep('REP_INVALID_LOW_ARMS');
      this.resetTopBottomStability();
      this.feedbackCode = 'ERR_LOW_ARMS';
      return this.createResult(this.feedbackCode);
    }

    if (!syncOk) {
      if (this.stage === 'up') this.invalidateRep('REP_INVALID_UNSYNC');
      this.resetTopBottomStability();
      this.feedbackCode = 'ERR_ARMS_UNSYNC';
      return this.createResult(this.feedbackCode);
    }

    // =========================================================
    // Movement logic (stable top -> stable bottom counts)
    // =========================================================

    // 1) TOP detection (go UP)
    if (bothAtTop) {
      this.isCorrect = true;
      if (this.topStableStart === 0) this.topStableStart = nowMs;

      const stableFor = nowMs - this.topStableStart;
      if (stableFor >= this.TOP_STABLE_MS) {
        if (this.stage === 'down' && canChangeStage) {
          this.stage = 'up';
          this.lastStageChangeTime = nowMs;

          // starting a clean rep attempt
          this.repInvalidated = false;
          this.repInvalidReason = null;

          this.feedbackCode = 'PERFECT_LOCKOUT';
        } else {
          this.feedbackCode = 'PERFECT_LOCKOUT';
        }
      } else {
        this.feedbackCode = 'HOLD_STEADY';
      }

      // while at top, reset bottom stability
      this.bottomStableStart = 0;
      return this.createResult(this.feedbackCode);
    } else {
      this.topStableStart = 0;
    }

    // 2) BOTTOM detection (go DOWN + count)
    if (bothAtBottom) {
      this.isCorrect = true;
      if (this.bottomStableStart === 0) this.bottomStableStart = nowMs;

      const stableFor = nowMs - this.bottomStableStart;
      if (stableFor >= this.BOTTOM_STABLE_MS) {
        if (this.stage === 'up' && repReady && canChangeStage) {
          // finish rep cycle
          this.stage = 'down';
          this.lastStageChangeTime = nowMs;
          this.lastRepTime = nowMs;

          // if invalidated => don't count
          if (this.repInvalidated) {
            this.feedbackCode = this.repInvalidReason || 'REP_INVALID';
            this.repInvalidated = false;
            this.repInvalidReason = null;
            return this.createResult(this.feedbackCode);
          }

          this.reps++;
          // ✅ use REP_NUMBER_ so your voice service ALWAYS interrupts and says the number
          this.feedbackCode = `REP_NUMBER_${this.reps}`;
          return this.createResult(this.feedbackCode);
        }

        // resting at bottom
        this.feedbackCode = 'PUSH_UP';
      } else {
        this.feedbackCode = 'HOLD_STEADY';
      }

      // while at bottom, reset top stability
      this.topStableStart = 0;
      return this.createResult(this.feedbackCode);
    } else {
      this.bottomStableStart = 0;
    }

    // 3) Middle zone guidance
    this.isCorrect = true;
    this.feedbackCode = (this.stage === 'up') ? 'LOWER_SLOWLY' : 'PUSH_UP';
    return this.createResult(this.feedbackCode);
  }

  private resetTopBottomStability() {
    this.topStableStart = 0;
    this.bottomStableStart = 0;
  }

  private createResult(feedback: string): OverheadPressResult {
    return {
      exercise: 'standing_overhead_press',
      reps: this.reps,
      stage: this.stage,
      feedback_code: feedback,
      is_correct: this.isCorrect,
    };
  }

  reset(): void {
    this.reps = 0;
    this.stage = 'down';
    this.feedbackCode = 'SETUP_POSITION';
    this.isCorrect = false;

    this.lastRepTime = 0;
    this.lastStageChangeTime = 0;
    this.topStableStart = 0;
    this.bottomStableStart = 0;

    this.repInvalidated = false;
    this.repInvalidReason = null;

    this.emaElbowL.reset();
    this.emaElbowR.reset();
    this.emaLiftL.reset();
    this.emaLiftR.reset();
    this.emaBackLean.reset();
  }
}