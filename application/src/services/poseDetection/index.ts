/**
 * Pose Detection Service
 * 
 * Integrates MediaPipe Pose Detection with React Native Vision Camera
 * for real-time exercise tracking.
 */

import { Landmark } from '../aiFitnessEngine/types';

// MediaPipe landmark indices (same as our PoseLandmarks)
export const POSE_LANDMARK_NAMES = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
  'right_eye_inner', 'right_eye', 'right_eye_outer',
  'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
  'left_index', 'right_index', 'left_thumb', 'right_thumb',
  'left_hip', 'right_hip', 'left_knee', 'right_knee',
  'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
  'left_foot_index', 'right_foot_index'
] as const;

/**
 * Convert MediaPipe pose results to our Landmark format
 */
export function convertMediaPipeLandmarks(
  mediapipeLandmarks: Array<{ x: number; y: number; z?: number; visibility?: number }>
): Landmark[] {
  return mediapipeLandmarks.map((lm) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z,
    visibility: lm.visibility ?? 0.9,
  }));
}

/**
 * Check if pose landmarks are valid/visible enough for analysis
 */
export function areLandmarksValid(landmarks: Landmark[], minVisibility: number = 0.5): boolean {
  // Check key landmarks for exercises
  const keyIndices = [11, 12, 23, 24, 25, 26, 27, 28]; // shoulders, hips, knees, ankles
  
  return keyIndices.every((idx) => {
    const lm = landmarks[idx];
    return lm && (lm.visibility ?? 0) >= minVisibility;
  });
}

/**
 * Create empty landmarks array (33 points for MediaPipe Pose)
 */
export function createEmptyLandmarks(): Landmark[] {
  return Array(33).fill(null).map(() => ({
    x: 0.5,
    y: 0.5,
    z: 0,
    visibility: 0,
  }));
}

export { Landmark };
