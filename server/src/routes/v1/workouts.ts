import { Router } from 'express';
import {
  getWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
  getWorkoutFilters,
} from '../../controllers/workoutController.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import {
  validateCreateWorkout,
  validateUpdateWorkout,
  validateWorkoutQuery,
} from '../../middleware/validations/index.js';

const router = Router();

/**
 * @swagger
 * /api/v1/workouts:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get all workouts with filtering and pagination
 *     description: |
 *       Retrieve a paginated list of workout exercises with optional filters for body part, target area, equipment, and difficulty level.
 *       **Authentication required** - Users must be signed in to access workout data.
 *       Results are ordered by workout ID in ascending order.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of workouts per page (max 100)
 *       - in: query
 *         name: body_part
 *         schema:
 *           type: string
 *         description: Filter by body part (e.g., chest, back, legs, shoulders, arms)
 *         example: "chest"
 *       - in: query
 *         name: target_area
 *         schema:
 *           type: string
 *         description: Filter by specific target area (e.g., upper chest, lower back)
 *         example: "upper chest"
 *       - in: query
 *         name: equipment
 *         schema:
 *           type: string
 *         description: Filter by equipment type (e.g., barbell, dumbbell, bodyweight, machine)
 *         example: "barbell"
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *         description: Filter by difficulty level (beginner, intermediate, advanced)
 *         example: "intermediate"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search workouts by name or description (partial match)
 *         example: "press"
 *     responses:
 *       200:
 *         description: Workouts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       body_part:
 *                         type: string
 *                         example: "chest"
 *                       target_area:
 *                         type: string
 *                         example: "upper chest"
 *                       name:
 *                         type: string
 *                         example: "Incline Barbell Press"
 *                       equipment:
 *                         type: string
 *                         example: "barbell"
 *                       level:
 *                         type: string
 *                         example: "intermediate"
 *                       description:
 *                         type: string
 *                         example: "An upper chest exercise using an incline bench"
 *                       gif_link:
 *                         type: string
 *                         example: \"https://your-bucket.s3.amazonaws.com/workouts/exercise.gif\"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 268
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 14
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Authentication required"
 */
router.get('/', authenticate, validateWorkoutQuery, getWorkouts);

/**
 * @swagger
 * /api/v1/workouts/filters:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get available filter options
 *     description: |
 *       Retrieve all unique values for workout filters to populate dropdown menus or filter options.
 *       Returns lists of all available body parts, target areas, equipment types, and difficulty levels.
 *       **Authentication required** - Users must be signed in to access this data.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Filter options retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     bodyParts:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["chest", "back", "legs", "shoulders", "arms"]
 *                     targetAreas:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["upper chest", "lower chest", "lats", "quads"]
 *                     equipment:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["barbell", "dumbbell", "bodyweight", "machine"]
 *                     levels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["beginner", "intermediate", "advanced"]
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.get('/filters', authenticate, getWorkoutFilters);

/**
 * @swagger
 * /api/v1/workouts/{id}:
 *   get:
 *     tags:
 *       - Workouts
 *     summary: Get a workout by ID
 *     description: |
 *       Retrieve detailed information about a specific workout exercise by its ID.
 *       **Authentication required** - Users must be signed in to access workout data.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique workout ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Workout retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     body_part:
 *                       type: string
 *                       example: "chest"
 *                     target_area:
 *                       type: string
 *                       example: "upper chest"
 *                     name:
 *                       type: string
 *                       example: "Incline Barbell Press"
 *                     equipment:
 *                       type: string
 *                       example: "barbell"
 *                     level:
 *                       type: string
 *                       example: "intermediate"
 *                     description:
 *                       type: string
 *                       example: "An upper chest exercise using an incline bench"
 *                     gif_link:
 *                       type: string
 *                       example: "https://your-bucket.s3.amazonaws.com/workouts/exercise.gif"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Workout not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Workout not found"
 */
router.get('/:id', authenticate, getWorkoutById);

/**
 * @swagger
 * /api/v1/workouts:
 *   post:
 *     tags:
 *       - Workouts
 *     summary: Create a new workout (Admin only)
 *     description: |
 *       Create a new workout exercise in the database.
 *       **Authentication required** - Users must be signed in.
 *       **Admin access only** - Only users with admin role can create workouts.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - body_part
 *               - target_area
 *               - name
 *               - equipment
 *               - level
 *               - gif_link
 *             properties:
 *               body_part:
 *                 type: string
 *                 description: Main body part targeted by the exercise
 *                 example: "chest"
 *               target_area:
 *                 type: string
 *                 description: Specific muscle area targeted
 *                 example: "upper chest"
 *               name:
 *                 type: string
 *                 description: Name of the workout exercise
 *                 example: "Incline Barbell Press"
 *               equipment:
 *                 type: string
 *                 description: Required equipment for the exercise
 *                 example: "barbell"
 *               level:
 *                 type: string
 *                 description: Difficulty level (beginner, intermediate, advanced)
 *                 example: "intermediate"
 *               description:
 *                 type: string
 *                 description: Detailed description of the exercise
 *                 example: "An upper chest exercise performed on an incline bench"
 *               gif_link:
 *                 type: string
 *                 format: uri
 *                 description: Cloud storage URL to exercise demonstration GIF (AWS S3, Cloudinary, Azure, etc.)
 *                 example: "https://your-bucket.s3.amazonaws.com/workouts/exercise.gif"
 *     responses:
 *       201:
 *         description: Workout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Workout created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 269
 *                     body_part:
 *                       type: string
 *                       example: "chest"
 *                     target_area:
 *                       type: string
 *                       example: "upper chest"
 *                     name:
 *                       type: string
 *                       example: "Incline Barbell Press"
 *                     equipment:
 *                       type: string
 *                       example: "barbell"
 *                     level:
 *                       type: string
 *                       example: "intermediate"
 *                     description:
 *                       type: string
 *                       example: "An upper chest exercise"
 *                     gif_link:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Validation failed"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *       401:
 *         description: Unauthorized - Authentication required
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  validateCreateWorkout,
  createWorkout
);

/**
 * @swagger
 * /api/v1/workouts/{id}:
 *   put:
 *     tags:
 *       - Workouts
 *     summary: Update a workout (Admin only)
 *     description: |
 *       Update an existing workout exercise. All fields are optional - only send fields that need to be updated.
 *       **Authentication required** - Users must be signed in.
 *       **Admin access only** - Only users with admin role can update workouts.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique workout ID to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body_part:
 *                 type: string
 *                 description: Main body part targeted by the exercise
 *                 example: "chest"
 *               target_area:
 *                 type: string
 *                 description: Specific muscle area targeted
 *                 example: "upper chest"
 *               name:
 *                 type: string
 *                 description: Name of the workout exercise
 *                 example: "Incline Barbell Press"
 *               equipment:
 *                 type: string
 *                 description: Required equipment for the exercise
 *                 example: "barbell"
 *               level:
 *                 type: string
 *                 description: Difficulty level (beginner, intermediate, advanced)
 *                 example: "advanced"
 *               description:
 *                 type: string
 *                 description: Detailed description of the exercise
 *                 example: "Updated exercise description"
 *               gif_link:
 *                 type: string
 *                 format: uri
 *                 description: Cloud storage URL to exercise demonstration GIF (AWS S3, Cloudinary, Azure, etc.)
 *                 example: "https://your-bucket.s3.amazonaws.com/workouts/exercise.gif"
 *     responses:
 *       200:
 *         description: Workout updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Workout updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     body_part:
 *                       type: string
 *                     target_area:
 *                       type: string
 *                     name:
 *                       type: string
 *                     equipment:
 *                       type: string
 *                     level:
 *                       type: string
 *                     description:
 *                       type: string
 *                     gif_link:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error - Invalid input data
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Workout not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Workout not found"
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  validateUpdateWorkout,
  updateWorkout
);

/**
 * @swagger
 * /api/v1/workouts/{id}:
 *   delete:
 *     tags:
 *       - Workouts
 *     summary: Delete a workout (Admin only)
 *     description: |
 *       Permanently delete a workout exercise from the database.
 *       **Authentication required** - Users must be signed in.
 *       **Admin access only** - Only users with admin role can delete workouts. This action cannot be undone.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique workout ID to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Workout deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Workout deleted successfully"
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Workout not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Workout not found"
 */
router.delete('/:id', authenticate, authorize('admin'), deleteWorkout);

export default router;
