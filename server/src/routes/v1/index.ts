import { Router } from 'express';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import foodRoutes from './foodRoutes.js';
import workoutRoutes from './workouts.js';

const router = Router();

// Version 1 API Routes
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/foods', foodRoutes);
router.use('/workouts', workoutRoutes);

export default router;