'use strict';

import type { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  await queryInterface.createTable('workouts', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    body_part: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Body part targeted (e.g., chest, back, legs)',
    },
    target_area: {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Specific target area (e.g., Upper Chest, Lower Back)',
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Exercise name',
    },
    equipment: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Equipment required (e.g., Barbell, Dumbbell, Bodyweight)',
    },
    level: {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment: 'Difficulty level (Beginner, Intermediate, Advanced)',
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Exercise description and instructions',
    },
    gif_link: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'URL to exercise demonstration GIF',
    },
    local_image_path: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Local path to exercise image/GIF',
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  // Add indexes for better query performance
  await queryInterface.addIndex('workouts', ['body_part']);
  await queryInterface.addIndex('workouts', ['target_area']);
  await queryInterface.addIndex('workouts', ['level']);
  await queryInterface.addIndex('workouts', ['equipment']);
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.dropTable('workouts');
}
