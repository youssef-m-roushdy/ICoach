import {
  DataTypes,
  Model,
  Op,
  type Optional,
  type CreationOptional,
  type InferAttributes,
  type InferCreationAttributes,
} from 'sequelize';
import { sequelize } from '../../config/database.js';

// Food attributes interface
interface FoodAttributes {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbohydrate: number;
  fat: number;
  sugar: number;
  pic?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Optional attributes for creation
interface FoodCreationAttributes
  extends Optional<
    FoodAttributes,
    | 'id'
    | 'sugar'
    | 'pic'
    | 'createdAt'
    | 'updatedAt'
  > {}

// Food model class
class Food extends Model<
  InferAttributes<Food>,
  InferCreationAttributes<Food>
> {
  // Attributes
  declare id: CreationOptional<number>;
  declare name: string;
  declare calories: number;
  declare protein: number;
  declare carbohydrate: number;
  declare fat: number;
  declare sugar: CreationOptional<number>;
  declare pic: string | null;
  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;

  // Instance methods
  
  // Calculate macronutrient percentages
  getMacroPercentages(): { protein: number; carbs: number; fat: number } {
    const proteinCalories = this.protein * 4; // 4 kcal per gram
    const carbCalories = this.carbohydrate * 4; // 4 kcal per gram
    const fatCalories = this.fat * 9; // 9 kcal per gram
    const totalCalories = proteinCalories + carbCalories + fatCalories;

    if (totalCalories === 0) {
      return { protein: 0, carbs: 0, fat: 0 };
    }

    return {
      protein: Math.round((proteinCalories / totalCalories) * 100),
      carbs: Math.round((carbCalories / totalCalories) * 100),
      fat: Math.round((fatCalories / totalCalories) * 100),
    };
  }

  // Calculate nutrition for a specific serving size (in grams)
  getServingNutrition(servingGrams: number): {
    calories: number;
    protein: number;
    carbohydrate: number;
    fat: number;
    sugar: number;
  } {
    const multiplier = servingGrams / 100;
    return {
      calories: Math.round(this.calories * multiplier * 100) / 100,
      protein: Math.round(this.protein * multiplier * 100) / 100,
      carbohydrate: Math.round(this.carbohydrate * multiplier * 100) / 100,
      fat: Math.round(this.fat * multiplier * 100) / 100,
      sugar: Math.round(this.sugar * multiplier * 100) / 100,
    };
  }

  // Get nutrition density score (calories per gram of protein)
  getProteinEfficiency(): number {
    if (this.protein === 0) return Infinity;
    return Math.round((this.calories / this.protein) * 100) / 100;
  }

  // Check if food is high in protein (>20g per 100g)
  isHighProtein(): boolean {
    return this.protein >= 20;
  }

  // Check if food is low calorie (<50 kcal per 100g)
  isLowCalorie(): boolean {
    return this.calories < 50;
  }

  // Get formatted nutrition summary
  getNutritionSummary(): string {
    const macros = this.getMacroPercentages();
    return `${this.name}: ${this.calories} kcal | P:${this.protein}g (${macros.protein}%) | C:${this.carbohydrate}g (${macros.carbs}%) | F:${this.fat}g (${macros.fat}%)`;
  }

  // Static methods
  
  // Find foods by name (partial match)
  static async findByName(searchTerm: string): Promise<Food[]> {
    return this.findAll({
      where: {
        name: {
          [Op.like]: `%${searchTerm}%`
        }
      },
      order: [['name', 'ASC']]
    });
  }

  // Find high protein foods
  static async findHighProteinFoods(minProtein: number = 20): Promise<Food[]> {
    return this.findAll({
      where: {
        protein: {
          [Op.gte]: minProtein
        }
      },
      order: [['protein', 'DESC']]
    });
  }

  // Find low calorie foods
  static async findLowCalorieFoods(maxCalories: number = 50): Promise<Food[]> {
    return this.findAll({
      where: {
        calories: {
          [Op.lte]: maxCalories
        }
      },
      order: [['calories', 'ASC']]
    });
  }

  // Find foods within a calorie range
  static async findByCalorieRange(minCal: number, maxCal: number): Promise<Food[]> {
    return this.findAll({
      where: {
        calories: {
          [Op.between]: [minCal, maxCal]
        }
      },
      order: [['calories', 'ASC']]
    });
  }
}

// Initialize the model
Food.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: 'Food name is required',
        },
        len: {
          args: [1, 255],
          msg: 'Food name must be between 1 and 255 characters',
        },
      },
      set(value: string) {
        this.setDataValue('name', value.trim().toLowerCase());
      },
    },
    calories: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Calories must be at least 0',
        },
        max: {
          args: [10000],
          msg: 'Calories must be less than 10000',
        },
      },
    },
    protein: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Protein must be at least 0',
        },
        max: {
          args: [1000],
          msg: 'Protein must be less than 1000',
        },
      },
    },
    carbohydrate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Carbohydrate must be at least 0',
        },
        max: {
          args: [1000],
          msg: 'Carbohydrate must be less than 1000',
        },
      },
    },
    fat: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: {
          args: [0],
          msg: 'Fat must be at least 0',
        },
        max: {
          args: [1000],
          msg: 'Fat must be less than 1000',
        },
      },
    },
    sugar: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
      validate: {
        min: {
          args: [0],
          msg: 'Sugar must be at least 0',
        },
        max: {
          args: [1000],
          msg: 'Sugar must be less than 1000',
        },
      },
    },
    pic: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'Picture URL must be less than 500 characters',
        },
      },
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'foods',
    modelName: 'Food',
    timestamps: true,
    paranoid: false,
    indexes: [
      {
        unique: true,
        fields: ['name'],
      },
      {
        fields: ['calories'],
      },
      {
        fields: ['protein'],
      },
    ],
  }
);

export default Food;
export type { FoodAttributes, FoodCreationAttributes };
