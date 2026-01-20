/**
 * Leg Raises Logic - Strict Version
 * * Fixes: Random counting using EMA smoothing.
 * * Update: Counts only on full repetition completion.
 * * Update: Returns numerical feedback (COUNT_1).
 */

import { Landmark, LegRaisesResult, ExerciseLogic } from '../types';
import { calculateAngle, toPoint, PoseLandmarks } from '../utils';

// ============================================================================
// 1. Helper Class: EMA (لتنعيم القراءات ومنع الرعشة)
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

export class LegRaisesLogic implements ExerciseLogic {
  private counter: number = 0;
  private stage: string = 'down'; // Starting position
  private feedbackCode: string = 'START_POSITION';
  private isCorrect: boolean = true;

  // Smoothing Tools
  private emaAvgHipAngle = new EMA(0.2); // تنعيم قوي لحركة الحوض
  private emaKneeAngle = new EMA(0.3);   // تنعيم للركبة

  // =========================================================
  // ⚙️ Constants (Strict Angles)
  // =========================================================
  // زاوية الركبة: 150 عشان نضمن إن الرجل مفرودة كويس (كانت 140)
  private readonly KNEE_MIN_ANGLE = 150; 
  // الفرق المسموح بين الرجلين (عشان يرفعهم مع بعض)
  private readonly LEGS_SYNC_DIFF = 30; 
  // زاوية الصعود: 110 (لازم ترفع رجلك لحد ما تبقى شبه عمودية، كانت 125)
  private readonly HIP_ANGLE_UP = 110; 
  // زاوية النزول: 160 (لازم تنزل رجلك قرب الأرض، كانت 150)
  private readonly HIP_ANGLE_DOWN = 160; 

  /**
   * Analyze landmarks and return leg raises exercise result
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

    // Calculations (Raw)
    const lHipAngleRaw = calculateAngle(lSh, lHip, lKnee);
    const rHipAngleRaw = calculateAngle(rSh, rHip, rKnee);
    const avgHipAngleRaw = (lHipAngleRaw + rHipAngleRaw) / 2;

    const lKneeAngleRaw = calculateAngle(lHip, lKnee, lAnk);
    const rKneeAngleRaw = calculateAngle(rHip, rKnee, rAnk);
    const minKneeAngleRaw = Math.min(lKneeAngleRaw, rKneeAngleRaw);

    // Calculations (Smoothed) -> ده اللي هيمنع العد العشوائي
    const avgHipAngle = this.emaAvgHipAngle.update(avgHipAngleRaw);
    const minKneeAngle = this.emaKneeAngle.update(minKneeAngleRaw);

    // --- Phase 1: Error Detection (Strict Check) ---
    let hasError = false;
    this.isCorrect = true;

    // 1. Knee check (must be extended)
    if (minKneeAngle < this.KNEE_MIN_ANGLE) {
      this.feedbackCode = 'ERR_BENT_KNEES'; // "STRAIGHTEN LEGS!"
      this.isCorrect = false;
      hasError = true;
    }
    // 2. Leg sync check (Feet together)
    else if (Math.abs(lHipAngleRaw - rHipAngleRaw) > this.LEGS_SYNC_DIFF) {
      this.feedbackCode = 'ERR_LEGS_SYNC'; // "FEET TOGETHER!"
      this.isCorrect = false;
      hasError = true;
    }

    // --- Phase 2: Counting Logic (State Machine) ---
    if (!hasError) {
      // 1. UP Phase Check (رفع الرجل)
      // كل ما الرقم يقل، الرجل بتطلع لفوق (180 مفرود -> 90 عمودي)
      if (avgHipAngle < this.HIP_ANGLE_UP) {
        this.stage = 'up';
        this.feedbackCode = 'CMD_LOWER_SLOWLY'; // "Lower Slowly"
      }
      
      // 2. DOWN Phase Check & Count (النزول والعد)
      // العد بيحصل لما ترجع لوضع البداية (Completion)
      else if (avgHipAngle > this.HIP_ANGLE_DOWN) {
        
        if (this.stage === 'up') {
          // كان فوق ونزل -> كمل العدة
          this.counter += 1;
          this.stage = 'down';
          
          // 🔊 Voice Count Feedback
          this.feedbackCode = `COUNT_${this.counter}`; 
        } else {
          // هو أصلاً تحت
          this.stage = 'down';
          this.feedbackCode = 'CMD_RAISE_LEGS'; // "UP!" (Ready logic)
        }
      }
      
      // 3. Middle Zone (بين البنين)
      else {
        if (this.stage === 'up') {
            this.feedbackCode = 'CMD_LOWER_SLOWLY';
        } else {
            this.feedbackCode = 'CMD_RAISE_LEGS'; // "Higher!"
        }
      }
    }
    // If error, preserve feedback code (e.g., Straighten Legs) and don't count

    return {
      exercise: 'leg_raises',
      reps: this.counter,
      stage: this.stage,
      feedback_code: this.feedbackCode,
      is_correct: this.isCorrect,
    };
  }

  reset(): void {
    this.counter = 0;
    this.stage = 'down';
    this.feedbackCode = 'START_POSITION';
    this.isCorrect = true;
    this.emaAvgHipAngle = new EMA(0.2);
    this.emaKneeAngle = new EMA(0.3);
  }
}