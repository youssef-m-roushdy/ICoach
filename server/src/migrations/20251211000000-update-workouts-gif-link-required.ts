'use strict';

import type { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  // 1. Make gif_link NOT NULL (first set default for existing nulls)
  await queryInterface.sequelize.query(`
    UPDATE workouts 
    SET gif_link = 'https://via.placeholder.com/400x300.gif?text=No+GIF+Available' 
    WHERE gif_link IS NULL OR gif_link = '';
  `);
  
  // 2. Change gif_link to NOT NULL
  await queryInterface.changeColumn('workouts', 'gif_link', {
    type: Sequelize.STRING(500),
    allowNull: false,
    comment: 'URL to exercise demonstration GIF from cloud storage (required)',
  });

  // 3. Remove local_image_path column (no longer needed)
  await queryInterface.removeColumn('workouts', 'local_image_path');
}

export async function down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  // Revert: Add back local_image_path column
  await queryInterface.addColumn('workouts', 'local_image_path', {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: 'Local path to exercise image/GIF',
  });

  // Revert: Make gif_link nullable again
  await queryInterface.changeColumn('workouts', 'gif_link', {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: 'URL to exercise demonstration GIF',
  });
}
