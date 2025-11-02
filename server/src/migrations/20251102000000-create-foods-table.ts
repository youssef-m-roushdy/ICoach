'use strict';

import type { QueryInterface, DataTypes } from 'sequelize';
import { Sequelize as SequelizeInstance } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export async function up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    // Create foods table
    await queryInterface.createTable('foods', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      calories: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Calories per 100g in kcal',
      },
      protein: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Protein per 100g in grams',
      },
      carbohydrate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Carbohydrate per 100g in grams',
      },
      fat: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Fat per 100g in grams',
      },
      sugar: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'Sugar per 100g in grams',
      },
      pic: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL or path to food image',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: SequelizeInstance.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: SequelizeInstance.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Create indexes for better performance
    await queryInterface.addIndex('foods', ['name'], {
      unique: true,
      name: 'foods_name_unique_idx',
    });

    await queryInterface.addIndex('foods', ['calories'], {
      name: 'foods_calories_idx',
    });

    await queryInterface.addIndex('foods', ['protein'], {
      name: 'foods_protein_idx',
    });
}

export async function down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    // Drop indexes first
    await queryInterface.removeIndex('foods', 'foods_protein_idx');
    await queryInterface.removeIndex('foods', 'foods_calories_idx');
    await queryInterface.removeIndex('foods', 'foods_name_unique_idx');

    // Drop the foods table
    await queryInterface.dropTable('foods');
}
