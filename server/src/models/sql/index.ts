// SQL Models - Sequelize
import User from './User.js';
import Food from './Food.js';
import Workout from './Workout.js';
import SavedWorkout from './SavedWorkout.js';

// Define associations
User.hasMany(SavedWorkout, { foreignKey: 'userId', as: 'savedWorkouts' });
SavedWorkout.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Workout.hasMany(SavedWorkout, { foreignKey: 'workoutId', as: 'savedBy' });
SavedWorkout.belongsTo(Workout, { foreignKey: 'workoutId', as: 'workout' });

// Export all SQL models
export {
  User,
  Food,
  Workout,
  SavedWorkout,
};

// Export types
export type { UserAttributes, UserCreationAttributes } from './User.js';
export type { FoodAttributes, FoodCreationAttributes } from './Food.js';
export type { WorkoutAttributes, WorkoutCreationAttributes } from './Workout.js';
export type { SavedWorkoutAttributes, SavedWorkoutCreationAttributes } from './SavedWorkout.js';

// Default export with all models for convenience
const sqlModels = {
  User,
  Food,
  Workout,
  SavedWorkout,
};

export default sqlModels;