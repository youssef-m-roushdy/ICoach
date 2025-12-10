import { Router } from 'express';
import { SavedWorkoutController } from '../../controllers/savedWorkoutController.js';
import { authenticate } from '../../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/saved-workouts:
 *   post:
 *     tags:
 *       - Saved Workouts
 *     summary: Save a workout
 *     description: Save a workout to user's saved list with optional custom notes and parameters
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workoutId
 *             properties:
 *               workoutId:
 *                 type: integer
 *                 description: ID of the workout to save
 *     responses:
 *       201:
 *         description: Workout saved successfully
 *       409:
 *         description: Workout already saved
 *       404:
 *         description: Workout not found
 */
router.post(
  '/',
  [
    body('workoutId').isInt({ min: 1 }).withMessage('Valid workout ID is required'),
    handleValidationErrors,
  ],
  SavedWorkoutController.saveWorkout
);

/**
 * @swagger
 * /api/v1/saved-workouts:
 *   get:
 *     tags:
 *       - Saved Workouts
 *     summary: Get all saved workouts
 *     description: Retrieve all saved workouts for the authenticated user with pagination and filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: bodyPart
 *         schema:
 *           type: string
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Saved workouts retrieved successfully
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('bodyPart').optional().isString().trim(),
    query('level').optional().isString().trim(),
    handleValidationErrors,
  ],
  SavedWorkoutController.getSavedWorkouts
);

/**
 * @swagger
 * /api/v1/saved-workouts/{id}:
 *   get:
 *     tags:
 *       - Saved Workouts
 *     summary: Get a saved workout by ID
 *     description: Retrieve a specific saved workout with full details
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saved workout retrieved successfully
 *       404:
 *         description: Saved workout not found
 */
router.get(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Valid saved workout ID is required'),
    handleValidationErrors,
  ],
  SavedWorkoutController.getSavedWorkoutById
);

/**
 * @swagger
 * /api/v1/saved-workouts/{id}:
 *   delete:
 *     tags:
 *       - Saved Workouts
 *     summary: Remove a saved workout
 *     description: Delete a workout from user's saved list
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Workout removed from saved list
 *       404:
 *         description: Saved workout not found
 */
router.delete(
  '/:id',
  [
    param('id').isInt({ min: 1 }).withMessage('Valid saved workout ID is required'),
    handleValidationErrors,
  ],
  SavedWorkoutController.deleteSavedWorkout
);

/**
 * @swagger
 * /api/v1/saved-workouts/check/{workoutId}:
 *   get:
 *     tags:
 *       - Saved Workouts
 *     summary: Check if workout is saved
 *     description: Check if a specific workout is saved by the user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workoutId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Check completed successfully
 */
router.get(
  '/check/:workoutId',
  [
    param('workoutId').isInt({ min: 1 }).withMessage('Valid workout ID is required'),
    handleValidationErrors,
  ],
  SavedWorkoutController.checkIfSaved
);

export default router;
