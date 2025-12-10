// SQL Models - Sequelize
import User from './User.js';
import Food from './Food.js';
import Workout from './Workout.js';

// Define associations here when you add more models
// Example:
// User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
// Post.belongsTo(User, { foreignKey: 'userId', as: 'author' });

// Export all SQL models
export {
  User,
  Food,
  Workout,
};

// Export types
export type { UserAttributes, UserCreationAttributes } from './User.js';
export type { FoodAttributes, FoodCreationAttributes } from './Food.js';
export type { WorkoutAttributes, WorkoutCreationAttributes } from './Workout.js';

// Default export with all models for convenience
const sqlModels = {
  User,
  Food,
  Workout,
};

export default sqlModels;