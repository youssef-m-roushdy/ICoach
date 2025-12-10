import {
  DataTypes,
  Model,
  type Optional,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
  type ForeignKey,
  type NonAttribute,
} from 'sequelize';
import { sequelize } from '../../config/database.js';

// SavedWorkout attributes interface
export interface SavedWorkoutAttributes {
  id: number;
  userId: number;
  workoutId: number;
  createdAt: Date;
  updatedAt: Date;
}

// Optional attributes for creation
export interface SavedWorkoutCreationAttributes
  extends Optional<
    SavedWorkoutAttributes,
    | 'id'
    | 'createdAt'
    | 'updatedAt'
  > {}

// SavedWorkout model class
class SavedWorkout extends Model<
  InferAttributes<SavedWorkout>,
  InferCreationAttributes<SavedWorkout>
> {
  // Attributes
  declare id: CreationOptional<number>;
  declare userId: ForeignKey<number>;
  declare workoutId: ForeignKey<number>;

  // Timestamps
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Associations
  declare user?: NonAttribute<any>;
  declare workout?: NonAttribute<any>;

  // Helper method to get saved workout with workout details
  async getWithDetails(): Promise<any> {
    const Workout = (await import('./Workout.js')).default;
    return await SavedWorkout.findByPk(this.id, {
      include: [
        {
          model: Workout,
          as: 'workout',
        },
      ],
    });
  }
}

SavedWorkout.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    workoutId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'workout_id',
      references: {
        model: 'workouts',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'saved_workouts',
    modelName: 'SavedWorkout',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'workout_id'],
        name: 'unique_user_workout',
      },
      {
        fields: ['user_id'],
      },
      {
        fields: ['workout_id'],
      },
    ],
  }
);

export default SavedWorkout;
