/**
 * AI Fitness Engine - Utility Functions
 * Math and geometry helpers for exercise analysis
 */

import { Landmark } from './types';

/**
 * Calculate the angle between three points (in degrees)
 * Uses 2D projection (X, Y) which is standard for most exercises
 */
export function calculateAngle(
  a: number[], // Changed from [number, number] to number[] to accept 3D points
  b: number[],
  c: number[]
): number {
  const radians =
    Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);

  let angle = Math.abs((radians * 180.0) / Math.PI);

  if (angle > 180.0) {
    angle = 360 - angle;
  }

  return angle;
}

/**
 * Calculate Euclidean distance between two points (2D)
 */
export function calculateDistance(
  a: number[],
  b: number[]
): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Extract [x, y, z] coordinates from a Landmark object
 * 🔥 Updated to include Z (useful for Front Raises depth check)
 */
export function toPoint(landmark: Landmark): number[] {
  // بنرجع Z كمان عشان لو حبينا نستخدمه في اللوجيك، ولو مش موجود بنحط 0
  return [landmark.x, landmark.y, landmark.z || 0];
}

/**
 * Exponential Moving Average (EMA) class for smoothing values
 * Helps reduce jitter in pose detection
 */
export class EMA {
  private alpha: number;
  private value: number | null = null;

  constructor(alpha: number = 0.3) {
    this.alpha = alpha;
  }

  update(x: number): number {
    if (this.value === null) {
      this.value = x;
    } else {
      this.value = this.alpha * x + (1 - this.alpha) * this.value;
    }
    return this.value;
  }

  getValue(): number | null {
    return this.value;
  }

  reset(): void {
    this.value = null;
  }
}

/**
 * MediaPipe Pose Landmark indices
 */
export const PoseLandmarks = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

/**
 * Get current timestamp in seconds
 */
export function getCurrentTime(): number {
  return Date.now() / 1000;
}