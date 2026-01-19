/**
 * Front Raises Logic - Balanced Version (Smart & Smooth)
 * * Features:
 * - Sync Check: Requires BOTH arms to move (but forgiving).
 * - Smooth Counting: Doesn't reset reps on minor errors.
 * - Feedback Priority: Corrects form without stopping the workout.
 */

import { Landmark, FrontRaisesResult, ExerciseLogic } from '../types';
import { PoseLandmarks } from '../utils';

// ============================================================================
// 1. Helper Class: EMA (تنعيم الحركة)
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

export class FrontRaisesLogic implements ExerciseLogic {
  private counter: number = 0;
  private stage: string = 'down'; 
  private feedbackCode: string = 'CMD_RAISE_FRONT';

  // Smoothing Tools
  private emaLiftL = new EMA(0.3);
  private emaLiftR = new EMA(0.3);
  private emaXDiff = new EMA(0.3);

  // =========================================================
  // ⚙️ Constants (Balanced for Real Usage)
  // =========================================================
  
  // 1. Elbow Tolerance: 135 is realistic for "Straight"
  private readonly ELBOW_MIN_ANGLE = 135;

  // 2. Height Targets (Angles)
  // 75 is enough to count as a rep (camera perspective often reduces perceived angle)
  private readonly ANGLE_START_MAX = 30;  // وضع البداية
  private readonly ANGLE_PEAK_MIN = 75;   // نقطة احتساب الرفعة
  private readonly ANGLE_PEAK_MAX = 125;  // أقصى ارتفاع مسموح

  // 3. Tunnel Width (X-Deviation)
  // Increased to 0.25 to allow for broad shoulders / slight natural movement
  private readonly MAX_X_DEVIATION = 0.25; 

  /**
   * Helper: Calculate Angle
   */
  private calculateAngle(a: Landmark, b: Landmark, c: Landmark): number {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) angle = 360 - angle;
    return angle;
  }

  /**
   * Helper: Check Visibility
   */
  private checkVisibility(landmarks: Landmark[]): boolean {
    const indices = [
      PoseLandmarks.LEFT_SHOULDER, PoseLandmarks.RIGHT_SHOULDER,
      PoseLandmarks.LEFT_ELBOW, PoseLandmarks.RIGHT_ELBOW,
      PoseLandmarks.LEFT_WRIST, PoseLandmarks.RIGHT_WRIST
    ];
    return indices.every(idx => (landmarks[idx]?.visibility || 0) > 0.5);
  }

  analyze(landmarks: Landmark[]): FrontRaisesResult {
    // 1. Visibility Check
    if (!this.checkVisibility(landmarks)) {
       return this.createResult('ERR_BODY_NOT_VISIBLE');
    }

    // 2. Extract Points
    const lSh = landmarks[PoseLandmarks.LEFT_SHOULDER];
    const rSh = landmarks[PoseLandmarks.RIGHT_SHOULDER];
    const lElbow = landmarks[PoseLandmarks.LEFT_ELBOW];
    const rElbow = landmarks[PoseLandmarks.RIGHT_ELBOW];
    const lWr = landmarks[PoseLandmarks.LEFT_WRIST];
    const rWr = landmarks[PoseLandmarks.RIGHT_WRIST];
    const lHip = landmarks[PoseLandmarks.LEFT_HIP];
    const rHip = landmarks[PoseLandmarks.RIGHT_HIP];

    // 3. Calculations
    
    // A. Lift Angles
    const lLiftRaw = this.calculateAngle(lHip, lSh, lElbow);
    const rLiftRaw = this.calculateAngle(rHip, rSh, rElbow);
    const lLift = this.emaLiftL.update(lLiftRaw);
    const rLift = this.emaLiftR.update(rLiftRaw);
    const avgLift = (lLift + rLift) / 2;

    // B. Elbow Straightness
    const lStraight = this.calculateAngle(lSh, lElbow, lWr);
    const rStraight = this.calculateAngle(rSh, rElbow, rWr);
    const minStraight = Math.min(lStraight, rStraight);

    // C. X-Deviation (Lateral Spread)
    const lSpread = Math.abs(lWr.x - lSh.x);
    const rSpread = Math.abs(rWr.x - rSh.x);
    const maxSpread = this.emaXDiff.update(Math.max(lSpread, rSpread));


    // =========================================================
    // 🧠 LOGIC FLOW (Flexible but Correct)
    // =========================================================

    // Priority 1: ❌ Fatal Error - Bent Elbows (Cheating)
    // هنا بس ممكن نكون صارمين شوية، بس مش هنصفر العداد، هننبه بس
    if (minStraight < this.ELBOW_MIN_ANGLE) {
        this.feedbackCode = 'STRAIGHTEN_ARMS'; 
        // Note: I removed "this.stage = down". We warn, but don't kill the rep instantly.
    }

    // Priority 2: ❌ Going Too Wide
    else if (maxSpread > this.MAX_X_DEVIATION && avgLift > 45) {
        this.feedbackCode = 'ERR_SWINGING'; // "Don't swing / Keep straight"
    }

    // Priority 3: ❌ Too High (Shoulder Safety)
    else if (avgLift > this.ANGLE_PEAK_MAX) {
        this.feedbackCode = 'ERR_TOO_HIGH'; 
    }

    // Priority 4: ⚠️ Too Low (Guidance)
    // لو لسه في نص الطريق (بين 50 و 75)
    else if (avgLift > 50 && avgLift < this.ANGLE_PEAK_MIN) {
        this.feedbackCode = 'RAISE_YOUR_ARM'; // "Higher"
    }

    // Priority 5: ✅ UP Phase (Success Zone)
    else if (avgLift >= this.ANGLE_PEAK_MIN && avgLift <= this.ANGLE_PEAK_MAX) {
        if (this.stage === 'down') {
            this.stage = 'up';
            this.feedbackCode = 'GOOD_REP'; // "Hold"
        } else {
             // لو لسه ثابت فوق، شجعه
             this.feedbackCode = 'GOOD_REP'; 
        }
    }

    // Priority 6: ⬇️ DOWN Phase & Counting
    else if (avgLift <= this.ANGLE_START_MAX) {
        if (this.stage === 'up') {
            // العدة كملت
            this.counter++;
            this.stage = 'down';
            // 🔊 Voice Count (يقطع أي كلام تاني)
            this.feedbackCode = `COUNT_${this.counter}`;
        } else {
            // وضع الاستعداد
            this.feedbackCode = 'CMD_RAISE_FRONT'; 
        }
    }
    
    // Default: لو مفيش أي شرط تحقق (حالة انتقالية)
    else {
         // حافظ على آخر رسالة مفيدة أو وجهه
         if (this.stage === 'up') this.feedbackCode = 'GOOD_REP';
         else this.feedbackCode = 'CMD_RAISE_FRONT';
    }

    return this.createResult(this.feedbackCode);
  }

  // --- Helpers ---

  private createResult(feedback: string): FrontRaisesResult {
    return {
      exercise: 'front_raises',
      reps: this.counter,
      stage: this.stage,
      feedback_code: feedback,
      is_correct: true,
    };
  }

  reset(): void {
    this.counter = 0;
    this.stage = 'down';
    this.feedbackCode = 'CMD_RAISE_FRONT';
    this.emaLiftL = new EMA(0.3);
    this.emaLiftR = new EMA(0.3);
    this.emaXDiff = new EMA(0.3);
  }
}