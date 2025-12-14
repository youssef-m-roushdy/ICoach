// Main models index - exports SQL models only
// MongoDB is used for logging and AI data only
import * as sqlModels from './sql/index.js';

// Export SQL models (main user data)
export const SQL = sqlModels;

// Export User model for convenience
export const { User, Food, Workout } = sqlModels;

// Export types
export type { UserAttributes, UserCreationAttributes, UserWithCalculatedFields, FoodAttributes, FoodCreationAttributes, WorkoutAttributes } from './sql/index.js';