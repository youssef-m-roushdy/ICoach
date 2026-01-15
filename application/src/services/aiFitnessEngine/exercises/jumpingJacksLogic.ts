/**
 * Jumping Jacks Logic - TypeScript Implementation with ONNX Model
 * On-Device Exercise Analysis
 *
 * Original Python: AI_Fitness_Engine/Logic_Scripts/jumping_jacks_logic.py
 *
 * This version uses the ONNX Runtime for arm position classification.
 * Falls back to geometry-based detection if ONNX is unavailable.
 */

import { Landmark, JumpingJacksResult, ExerciseLogic } from '../types';
import { calculateAngle, toPoint, EMA, PoseLandmarks } from '../utils';

// ONNX Runtime - loaded dynamically
let InferenceSession: any = null;
let Tensor: any = null;
let onnxAvailable = false;

// Try to load ONNX Runtime
try {
  const ort = require('onnxruntime-react-native');
  InferenceSession = ort.InferenceSession;
  Tensor = ort.Tensor;
  onnxAvailable = true;
} catch (e) {
  console.log('ONNX Runtime not available, using geometry-based detection');
}

// Encoder classes from ML_Models/jj_encoder_info.json
const ENCODER_CLASSES = ['in', 'lazy', 'out'];

export class JumpingJacksLogic implements ExerciseLogic {
  private counter: number = 0;
  private stage: string = 'down';
  private feedbackCode: string = 'START_POSITION';
  private isCorrect: boolean = true;

  // ONNX Model state
  private model: any = null;
  private modelLoaded: boolean = false;
  private modelLoading: boolean = false;
  private lastArmClass: string | null = null;
  private lastProb: number = 0;

  // Smoothing tools (EMA)
  private emaAnkleDist: EMA;
  private emaShoulderDist: EMA;
  private emaArmAngle: EMA;
  private emaProb: EMA;

  // Constants
  private readonly OPEN_FACTOR = 1.4; // Legs open when ankle distance > shoulder * factor
  private readonly CLOSE_FACTOR = 0.7; // Legs closed when ankle distance < shoulder * factor
  private readonly ARM_UP_ANGLE = 150; // Shoulder angle threshold for arms up
  private readonly ARM_DOWN_ANGLE = 50; // Shoulder angle threshold for arms down
  private readonly PROB_THRESHOLD = 0.85; // Confidence threshold for model predictions

  constructor() {
    // Initialize EMA smoothers
    this.emaAnkleDist = new EMA(0.3);
    this.emaShoulderDist = new EMA(0.3);
    this.emaArmAngle = new EMA(0.4);
    this.emaProb = new EMA(0.4);

    // Start loading ONNX model asynchronously
    this.loadModel();
  }

  /**
   * Load the ONNX model asynchronously
   */
  async loadModel(): Promise<void> {
    if (!onnxAvailable || this.modelLoading || this.modelLoaded) {
      return;
    }

    this.modelLoading = true;

    try {
      // Note: In production, you'll need to configure metro to bundle .onnx files
      // or load from a remote URL / local file system
      // For now, we'll try to load from the ML_Models directory
      
      // Option 1: Load from bundled asset (requires metro config)
      // const modelAsset = require('../../../ML_Models/jumping_jacks.onnx');
      // this.model = await InferenceSession.create(modelAsset);
      
      // Option 2: Load from file path (React Native file system)
      // const RNFS = require('react-native-fs');
      // const modelPath = `${RNFS.MainBundlePath}/ML_Models/jumping_jacks.onnx`;
      // this.model = await InferenceSession.create(modelPath);
      
      console.log('✅ ONNX model loading configured (enable in production)');
      // For now, we use geometry fallback until model path is configured
      this.modelLoaded = false;
    } catch (error) {
      console.warn('⚠️ ONNX model load failed, using geometry fallback:', error);
      this.model = null;
    } finally {
      this.modelLoading = false;
    }
  }

  /**
   * Run ONNX model inference for arm position classification
   * Input: [left_shoulder_angle, right_shoulder_angle, left_hip_angle, right_hip_angle]
   * Output: ['in', 'lazy', 'out'] with probability
   */
  private async predictArmPosition(
    angles: [number, number, number, number]
  ): Promise<[string | null, number]> {
    if (!this.model || !this.modelLoaded) {
      return [null, 0];
    }

    try {
      // Create input tensor [1, 4]
      const inputTensor = new Tensor('float32', Float32Array.from(angles), [1, 4]);

      // Run inference
      const feeds = { input: inputTensor };
      const results = await this.model.run(feeds);

      // Parse output
      const outputKey = Object.keys(results)[0];
      const outputData = results[outputKey].data;
      const predIdx = Number(outputData[0]);

      // Get probability if available
      let prob = 0.95;
      if (results.probabilities) {
        const probs = results.probabilities.data;
        prob = probs[predIdx];
      }

      const className = ENCODER_CLASSES[predIdx] || 'unknown';
      return [className, prob];
    } catch (error) {
      console.warn('ONNX inference error:', error);
      return [null, 0];
    }
  }

  /**
   * Geometry-based arm position detection (fallback when ONNX unavailable)
   * Maps to same classes as ONNX model: 'in', 'lazy', 'out'
   */
  private detectArmPositionGeometry(avgShoulderAngle: number): [string, number] {
    if (avgShoulderAngle > this.ARM_UP_ANGLE) {
      return ['out', 0.9]; // Arms up/out
    } else if (avgShoulderAngle < this.ARM_DOWN_ANGLE) {
      return ['in', 0.9]; // Arms down/in
    } else {
      return ['lazy', 0.7]; // Arms in middle (lazy form)
    }
  }

  /**
   * Analyze landmarks and return jumping jacks exercise result
   *
   * @param landmarks - Array of MediaPipe pose landmarks
   * @returns JumpingJacksResult with reps, feedback, and debug info
   */
  analyze(landmarks: Landmark[]): JumpingJacksResult {
    // 1. Extract points
    const lSh = toPoint(landmarks[PoseLandmarks.LEFT_SHOULDER]);
    const rSh = toPoint(landmarks[PoseLandmarks.RIGHT_SHOULDER]);
    const lElb = toPoint(landmarks[PoseLandmarks.LEFT_ELBOW]);
    const rElb = toPoint(landmarks[PoseLandmarks.RIGHT_ELBOW]);
    const lHip = toPoint(landmarks[PoseLandmarks.LEFT_HIP]);
    const rHip = toPoint(landmarks[PoseLandmarks.RIGHT_HIP]);
    const lKnee = toPoint(landmarks[PoseLandmarks.LEFT_KNEE]);
    const rKnee = toPoint(landmarks[PoseLandmarks.RIGHT_KNEE]);
    const lAnk = toPoint(landmarks[PoseLandmarks.LEFT_ANKLE]);
    const rAnk = toPoint(landmarks[PoseLandmarks.RIGHT_ANKLE]);

    // 2. Calculate angles (for model input)
    const angLSh = calculateAngle(lElb, lSh, lHip);
    const angRSh = calculateAngle(rElb, rSh, rHip);
    const angLHip = calculateAngle(lSh, lHip, lKnee);
    const angRHip = calculateAngle(rSh, rHip, rKnee);
    const avgShoulderAngle = (angLSh + angRSh) / 2;

    // Smooth the arm angle
    const smoothedArmAngle = this.emaArmAngle.update(avgShoulderAngle);

    // 3. Get arm classification (ONNX model or geometry fallback)
    let armClass: string | null = null;
    let prob = 0;

    if (this.modelLoaded && this.model) {
      // Use ONNX model (async - use cached result for real-time)
      this.predictArmPosition([angLSh, angRSh, angLHip, angRHip]).then(
        ([cls, p]) => {
          if (cls) {
            this.lastArmClass = cls;
            this.lastProb = p;
          }
        }
      );
      // Use last prediction or geometry while waiting
      armClass = this.lastArmClass;
      prob = this.lastProb;
      if (!armClass) {
        [armClass, prob] = this.detectArmPositionGeometry(smoothedArmAngle);
      }
    } else {
      // Fallback to pure geometry
      [armClass, prob] = this.detectArmPositionGeometry(smoothedArmAngle);
    }

    // Smooth probability - only update if prob > 0 to match Python behavior
    const probSmooth = prob > 0 ? this.emaProb.update(prob) : 0.0;

    // 4. Geometry calculations (leg position)
    const ankleDistRaw = Math.abs(lAnk[0] - rAnk[0]);
    const shDistRaw = Math.abs(lSh[0] - rSh[0]);

    // Smooth the distances
    const ankleDist = this.emaAnkleDist.update(ankleDistRaw);
    const shDist = this.emaShoulderDist.update(shDistRaw);

    // Determine leg status (Open / Middle / Closed)
    let legStatus: 'open' | 'middle' | 'closed' = 'middle';
    if (ankleDist > shDist * this.OPEN_FACTOR) {
      legStatus = 'open';
    } else if (ankleDist < shDist * this.CLOSE_FACTOR) {
      legStatus = 'closed';
    }

    // 5. Guidance Logic (using model classes: 'in', 'lazy', 'out')
    this.feedbackCode = 'FIX_POSTURE';

    // Check if we should use ONNX model predictions or geometry fallback
    const useModelPredictions = this.modelLoaded && this.model !== null;

    // High confidence threshold - only use model predictions when confident AND model is loaded
    if (useModelPredictions && armClass && probSmooth > this.PROB_THRESHOLD) {
      // --- Success case (rep counted) ---
      // Arms IN or LAZY + Legs CLOSED + Was in "up" stage
      if ((armClass === 'in' || armClass === 'lazy') && legStatus === 'closed') {
        if (this.stage === 'up') {
          this.counter += 1;
          this.stage = 'down';
          this.feedbackCode = 'REP_SUCCESS'; // "EXCELLENT"
        } else {
          this.feedbackCode = 'SYSTEM_READY_GO'; // "READY / JUMP UP"
        }
      }
      // --- Up phase ---
      // Arms OUT + Legs OPEN
      else if (armClass === 'out') {
        if (legStatus === 'open') {
          this.stage = 'up';
          this.feedbackCode = 'CMD_JUMP_CLOSE'; // "GREAT! NOW DOWN"
        } else if (legStatus === 'middle') {
          this.feedbackCode = 'ERR_LEGS_WIDTH'; // "WIDER LEGS"
        } else {
          this.feedbackCode = 'CMD_JUMP_OPEN'; // "OPEN LEGS"
        }
      }
      // --- Error cases ---
      else if (armClass === 'in' || armClass === 'lazy') {
        if (legStatus === 'open') {
          // Legs open but arms not up
          this.feedbackCode = 'ERR_ARMS_LAZY'; // "ARMS UP HIGHER"
        } else if (legStatus === 'closed') {
          this.feedbackCode = 'SYSTEM_READY_GO';
        }
      }
    }
    // Fallback when model is not loaded - use pure geometry (matches Python: elif self.model is None)
    // This uses simple threshold checks just like Python
    else if (!useModelPredictions) {
      // Python: if ankle_dist > (sh_dist * 1.5) and ang_l_sh > 150:
      if (ankleDist > shDist * 1.5 && angLSh > 150) {
        this.stage = 'up';
        this.feedbackCode = 'CMD_JUMP_CLOSE'; // "GREAT! NOW CLOSE"
      }
      // Python: elif ankle_dist < (sh_dist * 1.0) and self.stage == "up":
      else if (ankleDist < shDist * 1.0 && this.stage === 'up') {
        this.counter += 1;
        this.stage = 'down';
        this.feedbackCode = 'REP_SUCCESS';
      }
      // Added: feedback when standing ready
      else if (this.stage === 'down') {
        this.feedbackCode = 'SYSTEM_READY_GO'; // "JUMP!"
      }
    }

    return {
      exercise: 'jumping_jacks',
      reps: this.counter,
      stage: this.stage,
      feedback_code: this.feedbackCode,
      debug_class: `${armClass}:${probSmooth.toFixed(2)},leg:${legStatus}`,
    };
  }

  /**
   * Reset the logic state for a new session
   */
  reset(): void {
    this.counter = 0;
    this.stage = 'down';
    this.feedbackCode = 'START_POSITION';
    this.isCorrect = true;
    this.lastArmClass = null;
    this.lastProb = 0;
    this.emaAnkleDist = new EMA(0.3);
    this.emaShoulderDist = new EMA(0.3);
    this.emaArmAngle = new EMA(0.4);
    this.emaProb = new EMA(0.4);
  }

  /**
   * Check if ONNX model is loaded and ready
   */
  isModelReady(): boolean {
    return this.modelLoaded && this.model !== null;
  }
}
