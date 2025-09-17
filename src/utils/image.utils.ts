import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ProcessedImageUrls {
  original: string;
  medium: string;
  thumbnail: string;
}

export class ImageUtils {
  private uploadPath: string;
  private allowedMimeTypes: string[];
  private maxFileSize: number;

  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.allowedMimeTypes = (process.env.ALLOWED_MIME_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    this.maxFileSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default
    
    // Ensure upload directory exists
    this.ensureUploadDirectory();
  }

  /**
   * Process artwork image: create thumbnail, medium, and original versions
   */
  async processArtworkImage(imageData: string): Promise<ProcessedImageUrls> {
    try {
      // Decode base64 image data
      const buffer = await this.decodeImageData(imageData);
      
      // Validate image
      await this.validateImage(buffer);

      // Generate unique filename
      const filename = uuidv4();
      const timestamp = Date.now();
      
      // Process images in parallel
      const [originalUrl, mediumUrl, thumbnailUrl] = await Promise.all([
        this.processOriginalImage(buffer, `${filename}_original_${timestamp}`),
        this.processMediumImage(buffer, `${filename}_medium_${timestamp}`),
        this.processThumbnailImage(buffer, `${filename}_thumb_${timestamp}`),
      ]);

      return {
        original: originalUrl,
        medium: mediumUrl,
        thumbnail: thumbnailUrl,
      };
    } catch (error) {
      throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get image dimensions
   */
  async getImageDimensions(imageUrl: string): Promise<ImageDimensions | null> {
    try {
      // If it's a local file path, read from filesystem
      if (imageUrl.startsWith('./') || imageUrl.startsWith('/')) {
        const filePath = path.resolve(imageUrl);
        const metadata = await sharp(filePath).metadata();
        
        if (metadata.width && metadata.height) {
          return {
            width: metadata.width,
            height: metadata.height,
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get image dimensions:', error);
      return null;
    }
  }

  /**
   * Delete image file
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // Only delete local files
      if (imageUrl.startsWith('./') || imageUrl.startsWith('/')) {
        const filePath = path.resolve(imageUrl);
        await fs.unlink(filePath);
      }
    } catch (error) {
      console.error('Failed to delete image:', error);
      // Don't throw error for file deletion failures
    }
  }

  /**
   * Decode base64 image data or read from file path
   */
  private async decodeImageData(imageData: string): Promise<Buffer> {
    try {
      // Check if it's a base64 data URL
      if (imageData.startsWith('data:image/')) {
        const base64Data = imageData.split(',')[1];
        if (!base64Data) {
          throw new Error('Invalid base64 image data');
        }
        return Buffer.from(base64Data, 'base64');
      }
      
      // Check if it's a file path
      if (imageData.startsWith('./') || imageData.startsWith('/')) {
        return await fs.readFile(imageData);
      }
      
      // Assume it's raw base64
      return Buffer.from(imageData, 'base64');
    } catch (error) {
      throw new Error(`Failed to decode image data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate image buffer
   */
  private async validateImage(buffer: Buffer): Promise<void> {
    try {
      // Check file size
      if (buffer.length > this.maxFileSize) {
        throw new Error(`Image size exceeds maximum allowed size of ${this.maxFileSize} bytes`);
      }

      // Get image metadata to validate format
      const metadata = await sharp(buffer).metadata();
      
      if (!metadata.format) {
        throw new Error('Invalid image format');
      }

      const mimeType = `image/${metadata.format}`;
      if (!this.allowedMimeTypes.includes(mimeType)) {
        throw new Error(`Unsupported image format: ${metadata.format}. Allowed formats: ${this.allowedMimeTypes.join(', ')}`);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('Input buffer contains unsupported image format')) {
        throw new Error('Unsupported image format');
      }
      throw error;
    }
  }

  /**
   * Process original image (optimize without resizing)
   */
  private async processOriginalImage(buffer: Buffer, filename: string): Promise<string> {
    const outputPath = path.join(this.uploadPath, `${filename}.jpg`);
    
    await sharp(buffer)
      .jpeg({ 
        quality: 90, 
        progressive: true,
        mozjpeg: true 
      })
      .toFile(outputPath);
    
    return outputPath;
  }

  /**
   * Process medium-sized image (800x600 max, maintain aspect ratio)
   */
  private async processMediumImage(buffer: Buffer, filename: string): Promise<string> {
    const outputPath = path.join(this.uploadPath, `${filename}.jpg`);
    
    await sharp(buffer)
      .resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ 
        quality: 85, 
        progressive: true,
        mozjpeg: true 
      })
      .toFile(outputPath);
    
    return outputPath;
  }

  /**
   * Process thumbnail image (200x200 square, center crop)
   */
  private async processThumbnailImage(buffer: Buffer, filename: string): Promise<string> {
    const outputPath = path.join(this.uploadPath, `${filename}.jpg`);
    
    await sharp(buffer)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ 
        quality: 80, 
        progressive: true,
        mozjpeg: true 
      })
      .toFile(outputPath);
    
    return outputPath;
  }

  /**
   * Ensure upload directory exists
   */
  private async ensureUploadDirectory(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
    }
  }

  /**
   * Generate responsive image URLs for different screen densities
   */
  generateResponsiveUrls(baseUrl: string): { [key: string]: string } {
    const urlWithoutExt = baseUrl.replace(/\.[^/.]+$/, '');
    const ext = path.extname(baseUrl);
    
    return {
      '1x': baseUrl,
      '2x': `${urlWithoutExt}@2x${ext}`,
      '3x': `${urlWithoutExt}@3x${ext}`,
    };
  }

  /**
   * Convert image to WebP format for better compression
   */
  async convertToWebP(buffer: Buffer, quality: number = 80): Promise<Buffer> {
    return await sharp(buffer)
      .webp({ quality, effort: 6 })
      .toBuffer();
  }

  /**
   * Extract dominant colors from image
   */
  async extractDominantColors(buffer: Buffer, count: number = 5): Promise<string[]> {
    try {
      const { dominant } = await sharp(buffer)
        .resize(150, 150)
        .raw()
        .toBuffer({ resolveWithObject: true });

      // This is a simplified implementation
      // In production, you might want to use a more sophisticated color extraction library
      const { data } = dominant;
      const colors: string[] = [];
      
      for (let i = 0; i < Math.min(count, data.length / 3); i += 3) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        colors.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);
      }
      
      return colors;
    } catch (error) {
      console.error('Failed to extract dominant colors:', error);
      return [];
    }
  }
}
