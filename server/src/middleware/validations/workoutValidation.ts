import { body, query } from 'express-validator';
import { handleValidationErrors } from '../validation.js';

/**
 * Create Workout Validation
 */
export const validateCreateWorkout = [
  body('id')
    .not()
    .exists()
    .withMessage('ID should not be provided when creating a workout'),
  
  body('body_part')
    .notEmpty()
    .withMessage('Body part is required')
    .trim(),
  
  body('target_area')
    .notEmpty()
    .withMessage('Target area is required')
    .trim(),
  
  body('name')
    .notEmpty()
    .withMessage('Workout name is required')
    .trim(),
  
  body('equipment')
    .notEmpty()
    .withMessage('Equipment is required')
    .trim(),
  
  body('level')
    .notEmpty()
    .withMessage('Level is required')
    .trim(),
  
  body('description')
    .optional()
    .trim(),
  
  body('gif_link')
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage('GIF link must be a valid URL'),
  
  body('local_image_path')
    .optional()
    .trim(),
  
  handleValidationErrors,
];

/**
 * Update Workout Validation
 */
export const validateUpdateWorkout = [
  body('body_part')
    .optional()
    .notEmpty()
    .withMessage('Body part cannot be empty')
    .trim(),
  
  body('target_area')
    .optional()
    .notEmpty()
    .withMessage('Target area cannot be empty')
    .trim(),
  
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Workout name cannot be empty')
    .trim(),
  
  body('equipment')
    .optional()
    .notEmpty()
    .withMessage('Equipment cannot be empty')
    .trim(),
  
  body('level')
    .optional()
    .notEmpty()
    .withMessage('Level cannot be empty')
    .trim(),
  
  body('description')
    .optional()
    .trim(),
  
  body('gif_link')
    .optional()
    .isURL()
    .withMessage('GIF link must be a valid URL'),
  
  body('local_image_path')
    .optional()
    .trim(),
  
  handleValidationErrors,
];

/**
 * Workout Query Validation
 */
export const validateWorkoutQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('body_part')
    .optional()
    .trim(),
  
  query('target_area')
    .optional()
    .trim(),
  
  query('equipment')
    .optional()
    .trim(),
  
  query('level')
    .optional()
    .trim(),
  
  query('search')
    .optional()
    .trim(),
  
  handleValidationErrors,
];
