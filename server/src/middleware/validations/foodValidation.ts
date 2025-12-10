import { body, query } from 'express-validator';
import { handleValidationErrors } from '../validation.js';

/**
 * Create Food Validation
 */
export const validateCreateFood = [
  body('id')
    .not()
    .exists()
    .withMessage('ID should not be provided when creating a food'),
  
  body('name')
    .notEmpty()
    .withMessage('Food name is required')
    .trim(),
  
  body('calories')
    .notEmpty()
    .withMessage('Calories is required')
    .isFloat({ min: 0 })
    .withMessage('Calories must be a positive number'),
  
  body('protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a positive number'),
  
  body('carbs')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbs must be a positive number'),
  
  body('fats')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fats must be a positive number'),
  
  body('fiber')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fiber must be a positive number'),
  
  body('sugar')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sugar must be a positive number'),
  
  body('serving_size')
    .optional()
    .trim(),
  
  body('category')
    .optional()
    .trim(),
  
  body('description')
    .optional()
    .trim(),
  
  body('image_url')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  handleValidationErrors,
];

/**
 * Update Food Validation
 */
export const validateUpdateFood = [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Food name cannot be empty')
    .trim(),
  
  body('calories')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Calories must be a positive number'),
  
  body('protein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Protein must be a positive number'),
  
  body('carbs')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Carbs must be a positive number'),
  
  body('fats')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fats must be a positive number'),
  
  body('fiber')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Fiber must be a positive number'),
  
  body('sugar')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Sugar must be a positive number'),
  
  body('serving_size')
    .optional()
    .trim(),
  
  body('category')
    .optional()
    .trim(),
  
  body('description')
    .optional()
    .trim(),
  
  body('image_url')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  
  handleValidationErrors,
];

/**
 * Food Query Validation
 */
export const validateFoodQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim(),
  
  query('minCalories')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum calories must be a positive number'),
  
  query('maxCalories')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum calories must be a positive number'),
  
  query('minProtein')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum protein must be a positive number'),
  
  query('category')
    .optional()
    .trim(),
  
  handleValidationErrors,
];
