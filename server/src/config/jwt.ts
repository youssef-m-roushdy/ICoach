/**
 * Parse time string (e.g., '7d', '24h', '15m') to milliseconds
 */
const parseTimeToMs = (timeStr: string): number => {
  const match = timeStr.match(/^(\d+)([dhms])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7 days
  
  const value = parseInt(match[1] || '7');
  const unit = match[2];
  
  switch (unit) {
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'h': return value * 60 * 60 * 1000;
    case 'm': return value * 60 * 1000;
    case 's': return value * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
};

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  issuer: process.env.JWT_ISSUER || 'icoach-app',
  audience: process.env.JWT_AUDIENCE || 'icoach-users',
  algorithm: 'HS256' as const,
};

export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: parseTimeToMs(process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
};