'use strict';

import type { QueryInterface } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'csv-parse/sync';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface: QueryInterface) {
  const csvPath = path.join(__dirname, '..', '..', 'data', 'workouts_data.csv');
  
  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse CSV using csv-parse library for proper handling
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_quotes: true,
    relax_column_count: true,
  });
  
  // Transform records to match database schema
  const workouts = records.map((record: any) => ({
    id: parseInt(record.id, 10),
    body_part: record['body part'] || record.body_part,
    target_area: record.target_area,
    name: record.name,
    equipment: record.equipment || null,
    level: record.level,
    description: record.description || null,
    gif_link: record.gif_link || null,
    local_image_path: record.local_image_path || null,
    created_at: new Date(),
    updated_at: new Date(),
  }));
  
  console.log(`Seeding ${workouts.length} workout exercises...`);
  
  // Bulk insert workouts
  await queryInterface.bulkInsert('workouts', workouts, {});
  
  console.log('✅ Workout exercises seeded successfully!');
}

export async function down(queryInterface: QueryInterface) {
  await queryInterface.bulkDelete('workouts', {}, {});
}
