import type { Request, Response, NextFunction } from 'express';
import { Workout } from '../models/sql/index.js';
import { Op } from 'sequelize';
import path from 'path';
import fs from 'fs';

/**
 * Get all workouts with optional filtering and pagination
 */
export const getWorkouts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      body_part,
      target_area,
      equipment,
      level,
      search,
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Build filter conditions
    const where: any = {};

    if (body_part) {
      where.body_part = body_part;
    }

    if (target_area) {
      where.target_area = target_area;
    }

    if (equipment) {
      where.equipment = equipment;
    }

    if (level) {
      where.level = level;
    }

    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Workout.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['id', 'ASC']],
    });

    res.status(200).json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(count / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single workout by ID
 */
export const getWorkoutById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const workout = await Workout.findByPk(id);

    if (!workout) {
      res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new workout
 */
export const createWorkout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Log request body to debug
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    // Only extract allowed fields
    const {
      body_part,
      target_area,
      name,
      equipment,
      level,
      description,
      gif_link,
    } = req.body;

    // Handle uploaded file
    let local_image_path = null;
    if (req.file) {
      // Store relative path to the uploaded file
      local_image_path = `/public/workout_gifs/${req.file.filename}`;
    }

    // Create workout with only allowed fields (no id)
    const workoutData: any = {
      body_part,
      target_area,
      name,
      equipment,
      level,
    };

    // Add optional fields only if they have values
    if (description) workoutData.description = description;
    if (gif_link) workoutData.gif_link = gif_link;
    if (local_image_path) workoutData.local_image_path = local_image_path;

    console.log('Creating workout with data:', workoutData);

    const workout = await Workout.create(workoutData);

    res.status(201).json({
      success: true,
      message: 'Workout created successfully',
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a workout by ID
 */
export const updateWorkout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      body_part,
      target_area,
      name,
      equipment,
      level,
      description,
      gif_link,
    } = req.body;

    const workout = await Workout.findByPk(id);

    if (!workout) {
      res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
      return;
    }

    // Handle uploaded file
    let local_image_path = workout.local_image_path;
    if (req.file) {
      // Delete old file if exists
      if (workout.local_image_path) {
        const oldFilePath = path.join(process.cwd(), workout.local_image_path);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      // Store relative path to the new uploaded file
      local_image_path = `/public/workout_gifs/${req.file.filename}`;
    }

    await workout.update({
      body_part,
      target_area,
      name,
      equipment,
      level,
      description,
      gif_link,
      local_image_path,
    });

    res.status(200).json({
      success: true,
      message: 'Workout updated successfully',
      data: workout,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a workout by ID
 */
export const deleteWorkout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const workout = await Workout.findByPk(id);

    if (!workout) {
      res.status(404).json({
        success: false,
        message: 'Workout not found',
      });
      return;
    }

    await workout.destroy();

    res.status(200).json({
      success: true,
      message: 'Workout deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unique values for filtering
 */
export const getWorkoutFilters = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [bodyParts, targetAreas, equipment, levels] = await Promise.all([
      Workout.findAll({
        attributes: ['body_part'],
        group: ['body_part'],
        raw: true,
      }),
      Workout.findAll({
        attributes: ['target_area'],
        group: ['target_area'],
        raw: true,
      }),
      Workout.findAll({
        attributes: ['equipment'],
        group: ['equipment'],
        raw: true,
      }),
      Workout.findAll({
        attributes: ['level'],
        group: ['level'],
        raw: true,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        bodyParts: bodyParts.map((item: any) => item.body_part),
        targetAreas: targetAreas.map((item: any) => item.target_area),
        equipment: equipment.map((item: any) => item.equipment),
        levels: levels.map((item: any) => item.level),
      },
    });
  } catch (error) {
    next(error);
  }
};
