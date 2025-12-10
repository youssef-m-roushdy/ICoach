import dotenv from 'dotenv';

// Load environment variables before exporting config
dotenv.config();

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT) : 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Configuration
  api: {
    version: 'v1',
    prefix: '/api',
    rateLimit: {
      windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 15 * 60 * 1000, // 15 minutes
      max: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) : 100, // requests per window
    },
  },
  
  // CORS Configuration
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
  },
  
  // Email Configuration (using Nodemailer with SMTP)
  email: {
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
    from: process.env.EMAIL_FROM || 'noreply@icoach.com',
  },

  // Client URL for email links
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || './logs/app.log',
  },
};