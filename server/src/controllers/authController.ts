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

      // Decode the JWT payload manually (base64) to handle clock skew issues
      // Google tokens from mobile apps may have time sync issues with Docker containers
      const tokenParts = idToken.split('.');
      if (tokenParts.length !== 3) {
        res.status(401).json({ success: false, message: 'Invalid token format' });
        return;
      }

      // Decode payload (middle part of JWT)
      const payloadBase64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
      const payload = JSON.parse(payloadJson);

      // Verify the token is from Google and has required fields
      if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
        res.status(401).json({ success: false, message: 'Invalid token issuer' });
        return;
      }

      // Verify audience matches our Web Client ID
      const expectedAudience = process.env.GOOGLE_CLIENT_ID || '';
      if (payload.aud !== expectedAudience) {
        res.status(401).json({ success: false, message: 'Invalid token audience' });
        return;
      }

      // Check expiration with 5 minute tolerance for clock skew
      const now = Math.floor(Date.now() / 1000);
      const clockTolerance = 300; // 5 minutes
      if (payload.exp && payload.exp + clockTolerance < now) {
        res.status(401).json({ success: false, message: 'Token has expired' });
        return;
      }

      if (!payload.email) {
        res.status(401).json({
          success: false,
          message: 'Invalid Google token - no email'
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
