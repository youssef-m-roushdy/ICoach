import { Router } from 'express';
import { FoodController } from '../../controllers/foodController.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { uploadFoodImage, handleMulterError } from '../../middleware/upload.js';
import {
  validateCreateFood,
  validateUpdateFood,
  validateFoodQuery,
} from '../../middleware/validations/index.js';

const router = Router();

// Public routes - No authentication required for GET operations

/**
 * @swagger
 * /api/v1/foods:
 *   get:
 *     tags:
 *       - Foods
 *     summary: Get all foods
 *     description: |
 *       Retrieve a paginated list of all foods with optional filters.
 *       **Authentication required** - Users must be signed in to access food data.
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
 *         description: Number of foods per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search foods by name (partial match)
 *         example: "chicken"
 *       - in: query
 *         name: minCalories
 *         schema:
 *           type: number
 *         description: Minimum calories per 100g
 *         example: 100
 *       - in: query
 *         name: maxCalories
 *         schema:
 *           type: number
 *         description: Maximum calories per 100g
 *         example: 300
 *       - in: query
 *         name: minProtein
 *         schema:
 *           type: number
 *         description: Minimum protein in grams per 100g
 *         example: 15
 *     responses:
 *       200:
 *         description: Foods retrieved successfully
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
 *                   example: "Foods retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Food'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPreviousPage:
 *                       type: boolean
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/', authenticate, validateFoodQuery, asyncHandler(FoodController.getAllFoods));

/**
 * @swagger
 * /api/v1/foods/search:
 *   get:
 *     tags:
 *       - Foods
 *     summary: Search foods by name
 *     description: |
 *       Search for foods by name with partial matching.
 *       **Authentication required** - Users must be signed in to search foods.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query for food name
 *         example: "apple"
 *     responses:
 *       200:
 *         description: Search completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Food'
 *                 count:
 *                   type: integer
 *       400:
 *         description: Search query is required
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/search', authenticate, asyncHandler(FoodController.searchFoods));

/**
 * @swagger
 * /api/v1/foods/high-protein:
 *   get:
 *     tags:
 *       - Foods
 *     summary: Get high protein foods
 *     description: |
 *       Retrieve foods with high protein content.
 *       **Authentication required** - Users must be signed in to access food data.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: minProtein
 *         schema:
 *           type: number
 *           default: 20
 *         description: Minimum protein in grams per 100g
 *     responses:
 *       200:
 *         description: High protein foods retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Food'
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/high-protein', authenticate, asyncHandler(FoodController.getHighProteinFoods));

/**
 * @swagger
 * /api/v1/foods/low-calorie:
 *   get:
 *     tags:
 *       - Foods
 *     summary: Get low calorie foods
 *     description: |
 *       Retrieve foods with low calorie content.
 *       **Authentication required** - Users must be signed in to access food data.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: maxCalories
 *         schema:
 *           type: number
 *           default: 50
 *         description: Maximum calories per 100g
 *     responses:
 *       200:
 *         description: Low calorie foods retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Food'
 *                 count:
 *                   type: integer
 *       401:
 *         description: Unauthorized - Authentication required
 *       500:
 *         description: Internal server error
 */
router.get('/low-calorie', authenticate, asyncHandler(FoodController.getLowCalorieFoods));

/**
 * @swagger
 * /api/v1/foods/{id}:
 *   get:
 *     tags:
 *       - Foods
 *     summary: Get food by ID
 *     description: |
 *       Retrieve a specific food item by its ID.
 *       **Authentication required** - Users must be signed in to access food data.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Food ID
 *     responses:
 *       200:
 *         description: Food retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: Invalid food ID
 *       401:
 *         description: Unauthorized - Authentication required
 *       404:
 *         description: Food not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', authenticate, asyncHandler(FoodController.getFoodById));

// Protected routes - Authentication required for CREATE, UPDATE, DELETE operations

/**
 * @swagger
 * /api/v1/foods:
 *   post:
 *     tags:
 *       - Foods
 *     summary: Create new food with optional image (Admin only)
 *     description: |
 *       Create a new food item in the database with optional image upload.
 *       **Admin authentication required** - Only admin users can create foods.
 *       Image is optional and will be uploaded to Cloudinary if provided.
 *       Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - calories
 *               - protein
 *               - carbohydrate
 *               - fat
 *             properties:
 *               name:
 *                 type: string
 *                 description: Food name (unique)
 *                 example: "grilled_chicken_breast"
 *               calories:
 *                 type: number
 *                 description: Calories per 100g in kcal
 *                 example: 165
 *               protein:
 *                 type: number
 *                 description: Protein per 100g in grams
 *                 example: 31
 *               carbohydrate:
 *                 type: number
 *                 description: Carbohydrate per 100g in grams
 *                 example: 0
 *               fat:
 *                 type: number
 *                 description: Fat per 100g in grams
 *                 example: 3.6
 *               sugar:
 *                 type: number
 *                 description: Sugar per 100g in grams (optional, defaults to 0)
 *                 example: 0
 *               foodImage:
 *                 type: string
 *                 format: binary
 *                 description: Food image file (optional)
 *     responses:
 *       201:
 *         description: Food created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin role required
 *       409:
 *         description: Food with this name already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticate, authorize('admin'), uploadFoodImage, handleMulterError, validateCreateFood, asyncHandler(FoodController.createFood));

/**
 * @swagger
 * /api/v1/foods/{id}:
 *   put:
 *     tags:
 *       - Foods
 *     summary: Update food with optional image replacement (Admin only)
 *     description: |
 *       Update an existing food item with optional image upload/replacement.
 *       **Admin authentication required** - Only admin users can update foods.
 *       If a new image is uploaded, the old image will be automatically deleted from Cloudinary.
 *       Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Food ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Food name
 *                 example: "updated_chicken_breast"
 *               calories:
 *                 type: number
 *                 description: Calories per 100g
 *                 example: 170
 *               protein:
 *                 type: number
 *                 description: Protein per 100g
 *                 example: 32
 *               carbohydrate:
 *                 type: number
 *                 description: Carbohydrate per 100g
 *                 example: 0
 *               fat:
 *                 type: number
 *                 description: Fat per 100g
 *                 example: 4.0
 *               sugar:
 *                 type: number
 *                 description: Sugar per 100g
 *                 example: 0
 *               foodImage:
 *                 type: string
 *                 format: binary
 *                 description: New food image file (optional, replaces existing image)
 *     responses:
 *       200:
 *         description: Food updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Food'
 *       400:
 *         description: Invalid food ID or validation error
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Food not found
 *       409:
 *         description: Food with this name already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticate, authorize('admin'), uploadFoodImage, handleMulterError, validateUpdateFood, asyncHandler(FoodController.updateFood));

/**
 * @swagger
 * /api/v1/foods/{id}:
 *   delete:
 *     tags:
 *       - Foods
 *     summary: Delete food with automatic image cleanup (Admin only)
 *     description: |
 *       Delete a food item from the database.
 *       The food's image will be automatically deleted from Cloudinary if it exists.
 *       **Admin authentication required** - Only admin users can delete foods.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Food ID
 *     responses:
 *       200:
 *         description: Food deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid food ID
 *       401:
 *         description: Unauthorized - Authentication required
 *       403:
 *         description: Forbidden - Admin role required
 *       404:
 *         description: Food not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(FoodController.deleteFood));

/**
 * @swagger
 * components:
 *   schemas:
 *     Food:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Food ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Food name
 *           example: "chicken_breast"
 *         calories:
 *           type: number
 *           description: Calories per 100g in kcal
 *           example: 165
 *         protein:
 *           type: number
 *           description: Protein per 100g in grams
 *           example: 31
 *         carbohydrate:
 *           type: number
 *           description: Carbohydrate per 100g in grams
 *           example: 0
 *         fat:
 *           type: number
 *           description: Fat per 100g in grams
 *           example: 3.6
 *         sugar:
 *           type: number
 *           description: Sugar per 100g in grams
 *           example: 0
 *         pic:
 *           type: string
 *           nullable: true
 *           description: URL or path to food image
 *           example: "https://example.com/images/chicken.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

export default router;
