
import { Landmark, SquatResult } from '../types';

// ============================================================================
// 1) Helper Class: EMA (تنعيم القراءة)
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
}

// ============================================================================
// 2) Squat Logic Class (Strict + No Countdown + "Go deeper" + Speak rep number)
// ============================================================================
export class SquatLogic {
  // State Variables
  private counter: number = 0;
  private stage: 'up' | 'down' = 'up';
  private feedbackCode: string = 'STEP_BACK';

  // Setup State (بدون Countdown)
  private isSystemActive: boolean = false;
  private standStableStart: number | null = null;

  // Timing Locks (anti-random counting)
  private lastRepTime: number = 0;
  private lastStageChangeTime: number = 0;

  // ✅ NEW: لمنع تكرار "انزل أكتر" كل فريم
  private lastGoDeeperCueTime: number = 0;
  private readonly GO_DEEPER_COOLDOWN_MS = 1200; // يقولها كل 1.2 ثانية كحد أقصى

  // Smoothing
  private emaKneeAngle = new EMA(0.25);

  // -------------------- Constants --------------------
  private readonly STAND_STABLE_MS = 600;

  private readonly KNEE_ANGLE_STAND = 168;
  private readonly KNEE_ANGLE_DOWN = 95;
  private readonly DEPTH_TOLERANCE = 0.03;

  private readonly REP_COOLDOWN_MS = 900;
  private readonly MIN_STAGE_HOLD_MS = 250;

  private readonly HIP_WIDTH_MAX = 0.33;
  private readonly BODY_HEIGHT_MAX = 0.92;

  // Indices
  private readonly IDX = {
    NOSE: 0,

    L_HIP: 23,
    R_HIP: 24,

    L_KNEE: 25,
    R_KNEE: 26,

    L_ANKLE: 27,
    R_ANKLE: 28,
  };

  // -------------------- Math Helpers --------------------
  private calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) -
      Math.atan2(a.y - b.y, a.x - b.x);

    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  }

  private getVis(lm: any): number {
    return typeof lm?.visibility === 'number' ? lm.visibility : 1;
  }

  // -------------------- Visibility Check --------------------
  private checkVisibility(landmarks: Landmark[]): boolean {
    const nose = landmarks[this.IDX.NOSE];
    const lAnk = landmarks[this.IDX.L_ANKLE];
    const rAnk = landmarks[this.IDX.R_ANKLE];

    const headVisible = nose.y > 0.02;

    const avgAnkleY = (lAnk.y + rAnk.y) / 2;
    const feetVisible = avgAnkleY < 0.98;

    const visOk =
      this.getVis(nose) > 0.5 &&
      this.getVis(lAnk) > 0.5 &&
      this.getVis(rAnk) > 0.5;

    return headVisible && feetVisible && visOk;
  }

  // -------------------- Too Close Check --------------------
  private isTooClose(landmarks: Landmark[]): boolean {
    const lHip = landmarks[this.IDX.L_HIP];
    const rHip = landmarks[this.IDX.R_HIP];

    const hipWidth = Math.abs(lHip.x - rHip.x);

    let minY = Infinity;
    let maxY = -Infinity;

    const points = [
      landmarks[this.IDX.NOSE],
      landmarks[this.IDX.L_HIP],
      landmarks[this.IDX.R_HIP],
      landmarks[this.IDX.L_KNEE],
      landmarks[this.IDX.R_KNEE],
      landmarks[this.IDX.L_ANKLE],
      landmarks[this.IDX.R_ANKLE],
    ];

    for (const p of points) {
      if (!p) continue;
      minY = Math.min(minY, p.y);
      maxY = Math.max(maxY, p.y);
    }

    const bodyHeight = maxY - minY;

    return hipWidth > this.HIP_WIDTH_MAX || bodyHeight > this.BODY_HEIGHT_MAX;
  }

  // -------------------- Main Analyze --------------------
  analyze(landmarks: Landmark[]): SquatResult {
    const now = Date.now();

    // ✅ Gate: visibility / too close
    const visible = this.checkVisibility(landmarks);
    const tooClose = visible ? this.isTooClose(landmarks) : false;

    if (!visible) {
      this.feedbackCode = 'ERR_BODY_NOT_VISIBLE';
      this.standStableStart = null;
      return this.buildResult();
    }

    if (tooClose) {
      this.feedbackCode = 'STEP_BACK';
      this.standStableStart = null;
      return this.buildResult();
    }

    // 1) Extract points
    const lHip = landmarks[this.IDX.L_HIP];
    const rHip = landmarks[this.IDX.R_HIP];

    const lKnee = landmarks[this.IDX.L_KNEE];
    const rKnee = landmarks[this.IDX.R_KNEE];

    const lAnk = landmarks[this.IDX.L_ANKLE];
    const rAnk = landmarks[this.IDX.R_ANKLE];

    // 2) Angles
    const rawLeft = this.calculateAngle(lHip, lKnee, lAnk);
    const rawRight = this.calculateAngle(rHip, rKnee, rAnk);
    const rawKneeAngle = (rawLeft + rawRight) / 2;

    const kneeAngle = this.emaKneeAngle.update(rawKneeAngle);

    // 3) Depth check
    const hipY = (lHip.y + rHip.y) / 2;
    const kneeY = (lKnee.y + rKnee.y) / 2;

    const isDeepEnough = hipY > (kneeY - this.DEPTH_TOLERANCE);
    const isDeepSquatOverride = kneeAngle < 80;

    // ==========================================
    // 🛑 Setup Mode (بدون Countdown)
    // ==========================================
    if (!this.isSystemActive) {
      if (kneeAngle >= this.KNEE_ANGLE_STAND) {
        if (this.standStableStart === null) this.standStableStart = now;

        const stableFor = now - this.standStableStart;

        if (stableFor >= this.STAND_STABLE_MS) {
          this.isSystemActive = true;
          this.feedbackCode = 'SYSTEM_READY_GO';
          this.lastStageChangeTime = now;
        } else {
          this.feedbackCode = 'SETUP_STAND_STILL';
        }
      } else {
        this.standStableStart = null;
        this.feedbackCode = 'SETUP_STAND_STRAIGHT';
      }

      return this.buildResult();
    }

    // ==========================================
    // 🟢 Active Mode
    // ==========================================
    const canChangeStage = (now - this.lastStageChangeTime) >= this.MIN_STAGE_HOLD_MS;

    // A) UP Phase
    if (kneeAngle > 160) {
      if (this.stage !== 'up' && canChangeStage) {
        this.stage = 'up';
        this.lastStageChangeTime = now;
      }
      this.feedbackCode = 'CMD_GO_DOWN';
      return this.buildResult();
    }

    // ✅ B) Incomplete (نزل بس لسه مش عميق)
    // هنا هنقول "انزل أكتر" (مع cooldown) بدل ما نسيبها ساكتة
    const isTryingToGoDown = kneeAngle < 140;

    if (isTryingToGoDown && !isDeepEnough && !isDeepSquatOverride) {
      if (this.stage === 'up') {
        // anti-spam
        if (now - this.lastGoDeeperCueTime >= this.GO_DEEPER_COOLDOWN_MS) {
          this.feedbackCode = 'CMD_GO_DEEPER'; // "انزل أكتر"
          this.lastGoDeeperCueTime = now;
        } else {
          // حافظ على نفس الرسالة المكتوبة أو خليها ثابتة
          this.feedbackCode = 'CMD_GO_DEEPER';
        }
      }
      return this.buildResult();
    }

    // C) DOWN Phase (Counting) - successful rep
    if (((kneeAngle < this.KNEE_ANGLE_DOWN) && isDeepEnough) || isDeepSquatOverride) {
      const repReady = (now - this.lastRepTime) >= this.REP_COOLDOWN_MS;

      if (this.stage === 'up' && repReady && canChangeStage) {
        this.stage = 'down';
        this.lastStageChangeTime = now;

        this.counter++;
        this.lastRepTime = now;

        // ✅ المطلوب: يقول رقم العدة بعد ما تنزل صح
        this.feedbackCode = `REP_NUMBER_${this.counter}`;
      }
      return this.buildResult();
    }

    // Default fallback
    return this.buildResult();
  }

  private buildResult(): SquatResult {
    return {
      exercise: 'squat',
      reps: this.counter,
      stage: this.stage,
      feedback_code: this.feedbackCode,
      is_correct: true,
      is_system_active: this.isSystemActive
    };
  }

  reset() {
    this.counter = 0;
    this.stage = 'up';
    this.isSystemActive = false;
    this.standStableStart = null;
    this.feedbackCode = 'STEP_BACK';
    this.lastRepTime = 0;
    this.lastStageChangeTime = 0;

    // ✅ NEW reset
    this.lastGoDeeperCueTime = 0;

    this.emaKneeAngle = new EMA(0.25);
  }
}
