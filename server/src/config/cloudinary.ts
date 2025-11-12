import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true, // Use HTTPS URLs
});

// Validate configuration
const validateCloudinaryConfig = (): boolean => {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.warn('⚠️  Cloudinary credentials not configured. Image uploads will not work.');
    return false;
  }
  console.log('☁️  Cloudinary configured successfully');
  return true;
};

// Validate on import
validateCloudinaryConfig();

export { cloudinary };
