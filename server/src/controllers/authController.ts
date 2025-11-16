import type { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/userService.js';
import type { UserAttributes } from '../models/index.js';
import { OAuth2Client } from 'google-auth-library';

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
      
      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Return JSON with token for testing (you can change this to redirect later)
      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: {
          user: result.user,
          accessToken: result.accessToken,
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

      // Create user object from Google payload
      const googleUser: any = {
        email: payload.email,
        username: payload.email.split('@')[0] || 'user',
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        role: 'user',
        isActive: true,
        isEmailVerified: payload.email_verified || false,
        authProvider: 'google',
      };

      // Handle OAuth (create or get user, generate tokens)
      const result = await UserService.handleGoogleOAuth(googleUser as UserAttributes);

      // Set refresh token as HTTP-only cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Return JWT and user data directly (no redirect needed!)
      res.status(200).json({
        success: true,
        message: 'Google authentication successful',
        data: {
          accessToken: result.accessToken,
          user: {
            id: result.user.id,
            email: result.user.email,
            username: result.user.username,
            firstName: result.user.firstName,
            lastName: result.user.lastName,
            role: result.user.role,
            isActive: result.user.isActive,
            isEmailVerified: result.user.isEmailVerified,
            authProvider: result.user.authProvider,
            createdAt: result.user.createdAt,
            updatedAt: result.user.updatedAt,
          }
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
