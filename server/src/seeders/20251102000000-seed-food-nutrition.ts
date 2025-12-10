'use strict';

import { QueryInterface, DataTypes, QueryTypes } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { ImageService } from '../services/imageService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('sequelize-cli').Migration} */
export async function up (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  try {
    // Read the food nutrition data JSON file (in data directory)
    const jsonFilePath = path.join(__dirname, '..', '..', 'data', 'food_nutrition_data.json');
    const foodData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

    // Check if foods table already has data
    const existingFoods = await queryInterface.sequelize.query(
      'SELECT COUNT(*) as count FROM foods',
      {
        type: QueryTypes.SELECT
      }
    );

    const count = (existingFoods[0] as any).count;
    
    if (count > 0) {
      console.log(`ℹ️  Foods table already has ${count} records, skipping seeding.`);
      console.log(`💡 To re-seed with images, first run: npm run db:seed:undo`);
      return;
    }

    console.log(`🚀 Starting to seed ${foodData.length} food items with images...`);
    console.log(`📤 Checking Cloudinary for existing images...\n`);

    // Transform the JSON data and upload images to Cloudinary
    const foodRecords = [];
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < foodData.length; i++) {
      const food = foodData[i];
      let imageUrl = null;

      try {
        // Check if image exists and get URL
        if (food.pic) {
          const publicId = `icoach/foods/${food.name}`;
          
          // First, check if image already exists in Cloudinary
          const existingUrl = await ImageService.getExistingImageUrl(publicId);
          
          if (existingUrl) {
            // Image already exists, use the existing URL
            imageUrl = existingUrl;
            skippedCount++;
            console.log(`⏭️  [${i + 1}/${foodData.length}] Skipped (exists): ${food.name}`);
          } else {
            // Image doesn't exist, upload it
            const imagePath = path.join(__dirname, '../../', food.pic);
            
            if (fs.existsSync(imagePath)) {
              const uploadResult = await ImageService.uploadFoodImageFromPath(
                imagePath,
                food.name
              );
              
              imageUrl = uploadResult.secureUrl;
              successCount++;
              console.log(`✅ [${i + 1}/${foodData.length}] Uploaded: ${food.name}`);
            } else {
              console.log(`⚠️  [${i + 1}/${foodData.length}] Image not found: ${food.pic}`);
            }
          }
        }
      } catch (uploadError) {
        errorCount++;
        console.error(`❌ [${i + 1}/${foodData.length}] Failed to process ${food.name}:`, uploadError);
      }

      // Add food record with or without image
      foodRecords.push({
        name: food.name,
        calories: food.per_100g.calories_kcal,
        protein: food.per_100g.protein_g,
        carbohydrate: food.per_100g.carbohydrate_g,
        fat: food.per_100g.fat_g,
        sugar: food.per_100g.sugar_g || 0.0,
        pic: imageUrl,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Insert all food records
    await queryInterface.bulkInsert('foods', foodRecords, {});

    console.log(`\n✅ Successfully seeded ${foodRecords.length} food items!`);
    console.log(`📸 Images uploaded: ${successCount}`);
    console.log(`⏭️  Images skipped (already exist): ${skippedCount}`);
    console.log(`❌ Upload errors: ${errorCount}`);
    console.log(`📊 Foods table now contains nutrition data for ${foodRecords.length} items.`);
  } catch (error) {
    console.error('❌ Error seeding food nutrition data:', error);
    throw error;
  }
}

export async function down (queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
  try {
    // Remove all food records
    await queryInterface.bulkDelete('foods', {}, {});
    
    console.log('🗑️  All food records removed successfully!');
  } catch (error) {
    console.error('❌ Error removing food records:', error);
    throw error;
  }
}
