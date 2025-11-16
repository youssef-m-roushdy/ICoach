import { Router } from 'express';
import passport from '../../config/passport.js';
import { AuthController } from '../../controllers/authController.js';

const router = Router();

/**
 * @swagger
 * /api/v1/auth/google:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Initiate Google OAuth
 *     description: |
 *       **⚠️ CANNOT BE TESTED IN SWAGGER - Use browser instead**
 *       
 *       Initiates Google OAuth authentication flow. This endpoint MUST be accessed directly in a browser, not via Swagger's "Try it out" button.
 *       
 *       **How to test:**
 *       1. Open a new browser tab
 *       2. Navigate to: `http://localhost:5000/api/v1/auth/google`
 *       3. You'll be redirected to Google's login page
 *       4. After authentication, you'll be redirected back with a token
 *       
 *       **Why Swagger doesn't work:**
 *       - OAuth requires full browser redirects (not AJAX requests)
 *       - Cookies must be set in browser context
 *       - Cross-domain redirects don't work with CORS in Swagger UI
 *       
 *       Redirects to Google OAuth consent screen for authentication.
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @swagger
 * /api/v1/auth/google/callback:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth callback
 *     description: |
 *       **⚠️ DO NOT TEST MANUALLY - This is called automatically by Google**
 *       
 *       This endpoint is automatically called by Google after user authentication.
 *       You should never need to call this endpoint directly.
 *       
 *       Handles the callback from Google OAuth. 
 *       On success, redirects to frontend with access token.
 *       On failure, redirects to frontend with error message.
 *       Email is automatically verified for Google OAuth users.
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: OAuth authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: OAuth state parameter
 *     responses:
 *       302:
 *         description: Redirect to frontend
 *         headers:
 *           Set-Cookie:
 *             description: Refresh token (HTTP-only)
 *             schema:
 *               type: string
 *         content:
 *           text/html:
 *             examples:
 *               success:
 *                 summary: Successful authentication
 *                 value: 'Redirects to: {FRONTEND_URL}/auth/success?token={accessToken}'
 *               failure:
 *                 summary: Authentication failure
 *                 value: 'Redirects to: {FRONTEND_URL}/auth/error?message={errorMessage}'
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/v1/auth/google/failure',
    session: false 
  }),
  AuthController.googleCallback
);

/**
 * @swagger
 * /api/v1/auth/google/failure:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Google OAuth failure handler
 *     description: |
 *       **⚠️ DO NOT TEST MANUALLY - This is called automatically on OAuth failure**
 *       
 *       Handles Google OAuth authentication failures and redirects to frontend with error message.
 *     responses:
 *       302:
 *         description: Redirect to frontend with error message
 */
router.get('/google/failure', AuthController.googleFailure);

/**
 * @swagger
 * /api/v1/auth/google/mobile:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Google Sign-In for Mobile (React Native)
 *     description: |
 *       **For Mobile Apps - No redirect needed!**
 *       
 *       This endpoint receives the idToken from Google Sign-In in React Native,
 *       verifies it with Google, and returns JWT + user data directly.
 *       
 *       **Flow:**
 *       1. User taps "Sign in with Google" in mobile app
 *       2. Google Sign-In SDK handles authentication
 *       3. App sends idToken to this endpoint
 *       4. Server verifies token and returns JWT + user data
 *       5. App stores JWT and navigates to Home screen
 *       
 *       Just like Facebook, Instagram, TikTok!
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idToken
 *             properties:
 *               idToken:
 *                 type: string
 *                 description: ID token from Google Sign-In SDK
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjE4MmU..."
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Google authentication successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     jwt:
 *                       type: string
 *                       description: Access token (JWT)
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: number
 *                         email:
 *                           type: string
 *                         username:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *       400:
 *         description: Missing idToken
 *       401:
 *         description: Invalid or expired Google token
 */
router.post('/google/mobile', AuthController.googleMobileAuth);

export default router;
