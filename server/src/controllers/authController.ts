import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import type { UserAttributes } from '../models/index.js';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/sql/User.js';
import crypto from 'crypto';
import { cookieConfig } from '../config/jwt.js';

export class AuthController {
  /**
   * Handle Google OAuth callback
   */
  static async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user as UserAttributes;
      
      if (!user) {
        // Return JSON error for testing
        res.status(401).json({
          success: false,
          message: 'Authentication failed'
        });
        return;
      }

      // Generate tokens
      const result = await UserService.handleGoogleOAuth(user);
      
      // Set refresh token as HTTP-only cookie (for web clients)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: cookieConfig.maxAge,
      });

      // Return JSON with token for testing (you can change this to redirect later)
      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken, // Also return in body for mobile clients
        }
      });

      // OPTIONAL: Uncomment below to redirect to frontend instead
      // const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      // const redirectUrl = `${frontendUrl}/auth/success?token=${result.accessToken}`;
      // res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Google OAuth failure
   */
  static async googleFailure(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error?message=Google authentication failed`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handle Google Sign-In from Mobile App (React Native)
   * Receives idToken from Google Sign-In, verifies it, and returns JWT + user data
   */
  static async googleMobileAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { idToken } = req.body;

      if (!idToken) {
        res.status(400).json({
          success: false,
          message: 'idToken is required'
        });
        return;
      }

      // Initialize Google OAuth2 client
      const client = new OAuth2Client();

      // Verify the ID token - accept both Web and Android client IDs
      const ticket = await client.verifyIdToken({
        idToken,
        audience: [
          process.env.GOOGLE_CLIENT_ID || '',
          process.env.GOOGLE_ANDROID_CLIENT_ID || '',
        ],
      });

      const payload = ticket.getPayload();

      if (!payload || !payload.email) {
        res.status(401).json({
          success: false,
          message: 'Invalid Google token'
        });
        return;
      }

      // Check if user already exists with this email
      let user = await User.findByEmail(payload.email);

      if (user) {
        // User exists - check if they signed up with Google or regular method
        if (user.authProvider !== 'google') {
          res.status(400).json({
            success: false,
            message: `This email is already registered with ${user.authProvider} authentication. Please use ${user.authProvider} to login.`
          });
          return;
        }
        
        // Update last login
        user.lastLogin = new Date();
        await user.save();
      } else {
        // Create new user from Google profile
        const username = payload.email.split('@')[0] + '_' + crypto.randomBytes(4).toString('hex');
        
        user = await User.create({
          email: payload.email,
          username: username,
          firstName: payload.given_name || payload.name || 'User',
          lastName: payload.family_name || '',
          password: null, // No password for OAuth users
          avatar: payload.picture || null,
          isEmailVerified: payload.email_verified || true, // Google email is already verified
          isActive: true,
          role: 'user',
          authProvider: 'google',
          lastLogin: new Date(),
        });
      }

      // Generate tokens
      const accessToken = UserService.generateAccessToken(user.id, user.email, user.role);
      const refreshToken = UserService.generateRefreshToken(user.id);

      // Set refresh token as HTTP-only cookie with strict sameSite for security (for web clients)
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: cookieConfig.maxAge,
      });

      // Return JWT and user data directly (no redirect needed!)
      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: {
          accessToken: accessToken,
          refreshToken: refreshToken, // Also return in body for mobile clients
          user: user.toJSON()
        }
      });
    } catch (error) {
      console.error('Google mobile auth error:', error);
      res.status(401).json({
        success: false,
        message: 'Google authentication failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
