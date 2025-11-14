import { cloudinary } from '../config/cloudinary.js';
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  resourceType: string;
}

export class ImageService {
  /**
   * Upload an image to Cloudinary from a buffer
   * @param buffer - Image buffer from multer
   * @param folder - Cloudinary folder to store the image
   * @param publicId - Optional custom public ID
   * @returns Upload result with URL and metadata
   */
  static async uploadImage(
    buffer: Buffer,
    folder: string,
    publicId?: string
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const options: any = {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto' }, // Automatic quality optimization
          { fetch_format: 'auto' }, // Automatic format selection (WebP, AVIF, etc.)
        ],
      };
      
      if (publicId) {
        options.public_id = publicId;
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              publicId: result.public_id,
              url: result.url,
              secureUrl: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              resourceType: result.resource_type,
            });
          }
        }
      );

      // Convert buffer to stream and pipe to Cloudinary
      const bufferStream = Readable.from(buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Upload profile picture with specific transformations
   * @param buffer - Image buffer
   * @param userId - User ID for organizing images
   * @returns Upload result
   */
  static async uploadProfilePicture(
    buffer: Buffer,
    userId: number | string
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'icoach/profiles',
          public_id: `user_${userId}`,
          overwrite: true, // Replace existing profile picture
          resource_type: 'image',
          transformation: [
            { width: 500, height: 500, crop: 'fill', gravity: 'face' }, // Crop to square, focus on face
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              publicId: result.public_id,
              url: result.url,
              secureUrl: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              resourceType: result.resource_type,
            });
          }
        }
      );

      const bufferStream = Readable.from(buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Upload food image with specific transformations
   * @param buffer - Image buffer
   * @param foodId - Food ID or name
   * @returns Upload result
   */
  static async uploadFoodImage(
    buffer: Buffer,
    foodId: number | string
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'icoach/foods',
          public_id: `food_${foodId}`,
          overwrite: true,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' }, // Max dimensions
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(error);
          } else if (result) {
            resolve({
              publicId: result.public_id,
              url: result.url,
              secureUrl: result.secure_url,
              width: result.width,
              height: result.height,
              format: result.format,
              resourceType: result.resource_type,
            });
          }
        }
      );

      const bufferStream = Readable.from(buffer);
      bufferStream.pipe(uploadStream);
    });
  }

  /**
   * Upload food image from file path (for seeders)
   * @param filePath - Absolute path to the image file
   * @param foodName - Food name for public ID
   * @returns Upload result
   */
  static async uploadFoodImageFromPath(
    filePath: string,
    foodName: string
  ): Promise<CloudinaryUploadResult> {
    try {
      const result = await cloudinary.uploader.upload(filePath, {
        folder: 'icoach/foods',
        public_id: foodName,
        overwrite: true,
        resource_type: 'image',
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type,
      };
    } catch (error) {
      throw new Error(`Failed to upload food image: ${error}`);
    }
  }

  /**
   * Check if an image exists in Cloudinary
   * @param publicId - The public ID of the image (e.g., 'icoach/foods/apple')
   * @returns True if image exists, false otherwise
   */
  static async imageExists(publicId: string): Promise<boolean> {
    try {
      await cloudinary.api.resource(publicId);
      return true;
    } catch (error: any) {
      if (error.http_code === 404) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Get existing image URL from Cloudinary without uploading
   * @param publicId - The public ID (e.g., 'icoach/foods/apple')
   * @returns Cloudinary URL if exists, null otherwise
   */
  static async getExistingImageUrl(publicId: string): Promise<string | null> {
    try {
      const result = await cloudinary.api.resource(publicId);
      return result.secure_url;
    } catch (error: any) {
      if (error.http_code === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId - The public ID of the image to delete
   * @returns Deletion result
   */
  static async deleteImage(publicId: string): Promise<{ result: string }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete image: ${error}`);
    }
  }

  /**
   * Delete image by URL (extracts public ID from URL)
   * @param imageUrl - Full Cloudinary URL
   * @returns Deletion result
   */
  static async deleteImageByUrl(imageUrl: string): Promise<{ result: string }> {
    try {
      // Extract public ID from Cloudinary URL
      const publicId = this.extractPublicId(imageUrl);
      if (!publicId) {
        throw new Error('Invalid Cloudinary URL');
      }
      return await this.deleteImage(publicId);
    } catch (error) {
      throw new Error(`Failed to delete image by URL: ${error}`);
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param url - Cloudinary image URL
   * @returns Public ID or null
   */
  static extractPublicId(url: string): string | null {
    try {
      // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/icoach/profiles/user_1.jpg
      const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
      return matches ? (matches[1] || null) : null;
    } catch {
      return null;
    }
  }

  /**
   * Generate a transformed image URL
   * @param publicId - Public ID of the image
   * @param transformations - Cloudinary transformation options
   * @returns Transformed image URL
   */
  static getTransformedUrl(
    publicId: string,
    transformations: Record<string, any>
  ): string {
    return cloudinary.url(publicId, {
      ...transformations,
      secure: true,
    });
  }

  /**
   * Get thumbnail URL
   * @param publicId - Public ID of the image
   * @param width - Thumbnail width (default: 150)
   * @param height - Thumbnail height (default: 150)
   * @returns Thumbnail URL
   */
  static getThumbnailUrl(publicId: string, width: number = 150, height: number = 150): string {
    return this.getTransformedUrl(publicId, {
      width,
      height,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto',
    });
  }
}
