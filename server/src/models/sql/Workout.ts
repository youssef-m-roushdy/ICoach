import {
  DataTypes,
  Model,
  type Optional,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../../config/database.js';

// Workout attributes interface
export interface WorkoutAttributes {
  id: number;
  body_part: string;
  target_area: string;
  name: string;
  equipment?: string;
  level: string;
  description?: string;
  gif_link?: string;
  local_image_path?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Optional attributes for creation
export interface WorkoutCreationAttributes
  extends Optional<
    WorkoutAttributes,
    | 'id'
    | 'equipment'
    | 'description'
    | 'gif_link'
    | 'local_image_path'
    | 'createdAt'
    | 'updatedAt'
  > {}

// Workout model class
class Workout extends Model<
  InferAttributes<Workout>,
  InferCreationAttributes<Workout>
> {
  // Attributes
  declare id: CreationOptional<number>;
  declare body_part: string;
  declare target_area: string;
  declare name: string;
  declare equipment: string | null;
  declare level: string;
  declare description: string | null;
  declare gif_link: string | null;
  declare local_image_path: string | null;

  // Timestamps
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Workout.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    body_part: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    target_area: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    equipment: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    level: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gif_link: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    local_image_path: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    tableName: 'workouts',
    underscored: true,
    timestamps: true,
  }
);

export default Workout;
