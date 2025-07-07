/**
 * Progressive Crop Processor - Handles sequential crop operations and preview generation
 */

import { CropMode, CropRegion, CropStep } from './types';

class ProgressiveCropProcessor {
  /**
   * Apply a single crop operation to an image
   */
  static async applyCrop(
    imageDataUrl: string,
    cropRegion: CropRegion,
    cropMode: CropMode,
    originalFileName: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          const isHorizontal = cropMode === CropMode.horizontal;

          // Calculate canvas size after crop
          canvas.width = isHorizontal ? image.naturalWidth : image.naturalWidth - cropRegion.width;
          canvas.height = isHorizontal ? image.naturalHeight - cropRegion.height : image.naturalHeight;

          // Draw the first part (before crop area)
          const firstPartWidth = isHorizontal ? image.naturalWidth : cropRegion.x;
          const firstPartHeight = isHorizontal ? cropRegion.y : image.naturalHeight;

          if (firstPartWidth > 0 && firstPartHeight > 0) {
            ctx.drawImage(
              image,
              0, 0, firstPartWidth, firstPartHeight,
              0, 0, firstPartWidth, firstPartHeight
            );
          }

          // Draw the second part (after crop area)
          const secondPartSourceX = isHorizontal ? 0 : cropRegion.x + cropRegion.width;
          const secondPartSourceY = isHorizontal ? cropRegion.y + cropRegion.height : 0;
          const secondPartWidth = isHorizontal ? image.naturalWidth : image.naturalWidth - secondPartSourceX;
          const secondPartHeight = isHorizontal ? image.naturalHeight - secondPartSourceY : image.naturalHeight;

          if (secondPartWidth > 0 && secondPartHeight > 0) {
            const destX = isHorizontal ? 0 : cropRegion.x;
            const destY = isHorizontal ? cropRegion.y : 0;

            ctx.drawImage(
              image,
              secondPartSourceX, secondPartSourceY, secondPartWidth, secondPartHeight,
              destX, destY, secondPartWidth, secondPartHeight
            );
          }

          resolve(canvas.toDataURL('image/png'));
        } catch (error) {
          reject(error);
        }
      };

      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = imageDataUrl;
    });
  }

  /**
   * Apply multiple crop operations sequentially
   */
  static async applyProgressiveCrops(
    originalImageUrl: string,
    cropSteps: CropStep[]
  ): Promise<string> {
    let currentImage = originalImageUrl;

    for (const step of cropSteps) {
      currentImage = await this.applyCrop(
        currentImage,
        step.cropRegion,
        step.cropMode,
        'progressive'
      );
    }

    return currentImage;
  }

  /**
   * Generate a preview with reduced quality for performance
   */
  static async generatePreview(
    imageDataUrl: string,
    cropRegion: CropRegion,
    cropMode: CropMode,
    maxWidth = 800
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const image = new Image();

      image.onload = () => {
        try {
          // Create a smaller preview for performance
          const scale = Math.min(1, maxWidth / image.naturalWidth);
          const scaledCrop = {
            x: cropRegion.x * scale,
            y: cropRegion.y * scale,
            width: cropRegion.width * scale,
            height: cropRegion.height * scale
          };

          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;

          const isHorizontal = cropMode === CropMode.horizontal;

          canvas.width = isHorizontal ? image.naturalWidth * scale : (image.naturalWidth - cropRegion.width) * scale;
          canvas.height = isHorizontal ? (image.naturalHeight - cropRegion.height) * scale : image.naturalHeight * scale;

          // Draw scaled preview
          const firstPartWidth = isHorizontal ? canvas.width : scaledCrop.x;
          const firstPartHeight = isHorizontal ? scaledCrop.y : canvas.height;

          if (firstPartWidth > 0 && firstPartHeight > 0) {
            ctx.drawImage(
              image,
              0, 0, firstPartWidth / scale, firstPartHeight / scale,
              0, 0, firstPartWidth, firstPartHeight
            );
          }

          const secondPartSourceX = isHorizontal ? 0 : (scaledCrop.x + scaledCrop.width) / scale;
          const secondPartSourceY = isHorizontal ? (scaledCrop.y + scaledCrop.height) / scale : 0;
          const secondPartWidth = isHorizontal ? canvas.width : canvas.width - scaledCrop.x;
          const secondPartHeight = isHorizontal ? canvas.height - scaledCrop.y : canvas.height;

          if (secondPartWidth > 0 && secondPartHeight > 0) {
            const destX = isHorizontal ? 0 : scaledCrop.x;
            const destY = isHorizontal ? scaledCrop.y : 0;

            ctx.drawImage(
              image,
              secondPartSourceX, secondPartSourceY,
              secondPartWidth / scale, secondPartHeight / scale,
              destX, destY, secondPartWidth, secondPartHeight
            );
          }

          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } catch (error) {
          reject(error);
        }
      };

      image.onerror = () => reject(new Error('Failed to load image for preview'));
      image.src = imageDataUrl;
    });
  }
}

export default ProgressiveCropProcessor;