/**
 * Progressive Crop Processor - Handles sequential crop operations and preview generation
 * Now includes smooth edge blending for seamless transitions
 */

import { CropMode, CropRegion, CropStep } from './types';

class ProgressiveCropProcessor {
  /**
   * Apply a single crop operation to an image with intelligent color blending
   */
  static async applyCrop(
    imageDataUrl: string,
    cropRegion: CropRegion,
    cropMode: CropMode,
    originalFileName: string,
    featherRadius: number = 20
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

          // First, draw the entire image to analyze edge colors
          const analyzeCanvas = document.createElement('canvas');
          const analyzeCtx = analyzeCanvas.getContext('2d')!;
          analyzeCanvas.width = image.naturalWidth;
          analyzeCanvas.height = image.naturalHeight;
          analyzeCtx.drawImage(image, 0, 0);

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

          // Draw the second part (after crop area) with intelligent color blending
          const secondPartSourceX = isHorizontal ? 0 : cropRegion.x + cropRegion.width;
          const secondPartSourceY = isHorizontal ? cropRegion.y + cropRegion.height : 0;
          const secondPartWidth = isHorizontal ? image.naturalWidth : image.naturalWidth - secondPartSourceX;
          const secondPartHeight = isHorizontal ? image.naturalHeight - secondPartSourceY : image.naturalHeight;

          if (secondPartWidth > 0 && secondPartHeight > 0) {
            const destX = isHorizontal ? 0 : cropRegion.x;
            const destY = isHorizontal ? cropRegion.y : 0;

            // Create a temporary canvas for the second part
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d')!;
            tempCanvas.width = secondPartWidth;
            tempCanvas.height = secondPartHeight;

            // Draw the second part to temporary canvas
            tempCtx.drawImage(
              image,
              secondPartSourceX, secondPartSourceY, secondPartWidth, secondPartHeight,
              0, 0, secondPartWidth, secondPartHeight
            );

            // Apply intelligent color blending
            this.applyIntelligentBlending(
              ctx, tempCtx, analyzeCtx,
              isHorizontal, featherRadius,
              cropRegion, destX, destY,
              firstPartWidth, firstPartHeight,
              secondPartSourceX, secondPartSourceY
            );

            // Draw the blended second part to main canvas
            ctx.drawImage(tempCanvas, destX, destY);
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
    cropSteps: CropStep[],
    featherRadius: number = 20
  ): Promise<string> {
    let currentImage = originalImageUrl;

    for (const step of cropSteps) {
      currentImage = await this.applyCrop(
        currentImage,
        step.cropRegion,
        step.cropMode,
        'progressive',
        featherRadius
      );
    }

    return currentImage;
  }

  /**
   * Generate a preview with reduced quality for performance and smooth blending
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

          // Draw scaled preview with blending
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

            // Create temporary canvas for blending
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d')!;
            tempCanvas.width = secondPartWidth;
            tempCanvas.height = secondPartHeight;

            tempCtx.drawImage(
              image,
              secondPartSourceX, secondPartSourceY,
              secondPartWidth / scale, secondPartHeight / scale,
              0, 0, secondPartWidth, secondPartHeight
            );

            // Draw blended second part
            ctx.drawImage(tempCanvas, destX, destY);
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

  /**
   * Apply intelligent color blending by analyzing pixels on both sides of the crop boundary
   */
  private static applyIntelligentBlending(
    mainCtx: CanvasRenderingContext2D,
    tempCtx: CanvasRenderingContext2D,
    analyzeCtx: CanvasRenderingContext2D,
    isHorizontal: boolean,
    featherRadius: number,
    cropRegion: CropRegion,
    destX: number,
    destY: number,
    firstPartWidth: number,
    firstPartHeight: number,
    secondPartSourceX: number,
    secondPartSourceY: number
  ): void {
    if (featherRadius === 0) return; // No blending needed

    const tempImageData = tempCtx.getImageData(0, 0, tempCtx.canvas.width, tempCtx.canvas.height);
    const tempData = tempImageData.data;
    const width = tempCtx.canvas.width;
    const height = tempCtx.canvas.height;

    // Sample colors from the boundary edges
    for (let i = 0; i < (isHorizontal ? width : height); i++) {
      // Get the colors from both sides of the crop boundary
      const edgeColors = this.sampleBoundaryColors(
        analyzeCtx, isHorizontal, i, cropRegion,
        firstPartWidth, firstPartHeight,
        secondPartSourceX, secondPartSourceY
      );

      if (!edgeColors) continue;

      const { firstPartColor, secondPartColor } = edgeColors;

      // Apply gradient blending for the feather area
      for (let j = 0; j < Math.min(featherRadius, isHorizontal ? height : width); j++) {
        const x = isHorizontal ? i : j;
        const y = isHorizontal ? j : i;

        if (x >= width || y >= height) continue;

        const pixelIndex = (y * width + x) * 4;

        // Calculate blend ratio (0 = fully first part color, 1 = fully second part color)
        const blendRatio = this.smoothStep(0, 1, j / featherRadius);

        // Interpolate between the boundary colors
        tempData[pixelIndex] = Math.round(
          firstPartColor.r * (1 - blendRatio) + secondPartColor.r * blendRatio
        );
        tempData[pixelIndex + 1] = Math.round(
          firstPartColor.g * (1 - blendRatio) + secondPartColor.g * blendRatio
        );
        tempData[pixelIndex + 2] = Math.round(
          firstPartColor.b * (1 - blendRatio) + secondPartColor.b * blendRatio
        );
        // Keep original alpha
        // tempData[pixelIndex + 3] stays the same
      }
    }

    tempCtx.putImageData(tempImageData, 0, 0);
  }

  /**
   * Sample colors from both sides of the crop boundary
   */
  private static sampleBoundaryColors(
    analyzeCtx: CanvasRenderingContext2D,
    isHorizontal: boolean,
    position: number,
    cropRegion: CropRegion,
    firstPartWidth: number,
    firstPartHeight: number,
    secondPartSourceX: number,
    secondPartSourceY: number
  ): {
    firstPartColor: { r: number, g: number, b: number },
    secondPartColor: { r: number, g: number, b: number }
  } | null {
    try {
      let firstPartX: number, firstPartY: number;
      let secondPartX: number, secondPartY: number;

      if (isHorizontal) {
        // For horizontal crops, sample from bottom of first part and top of second part
        firstPartX = position;
        firstPartY = Math.max(0, cropRegion.y - 1);
        secondPartX = position;
        secondPartY = secondPartSourceY;
      } else {
        // For vertical crops, sample from right of first part and left of second part
        firstPartX = Math.max(0, cropRegion.x - 1);
        firstPartY = position;
        secondPartX = secondPartSourceX;
        secondPartY = position;
      }

      // Sample colors with some averaging for stability
      const firstPartColor = this.getAverageColor(analyzeCtx, firstPartX, firstPartY, 3);
      const secondPartColor = this.getAverageColor(analyzeCtx, secondPartX, secondPartY, 3);

      return { firstPartColor, secondPartColor };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get average color in a small area around a point for more stable color sampling
   */
  private static getAverageColor(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number = 3
  ): { r: number, g: number, b: number } {
    const canvas = ctx.canvas;
    let totalR = 0, totalG = 0, totalB = 0, count = 0;

    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        const x = Math.max(0, Math.min(canvas.width - 1, centerX + dx));
        const y = Math.max(0, Math.min(canvas.height - 1, centerY + dy));

        const imageData = ctx.getImageData(x, y, 1, 1);
        const data = imageData.data;

        totalR += data[0];
        totalG += data[1];
        totalB += data[2];
        count++;
      }
    }

    return {
      r: Math.round(totalR / count),
      g: Math.round(totalG / count),
      b: Math.round(totalB / count)
    };
  }

  /**
   * Smooth step function for natural-looking transitions
   */
  private static smoothStep(edge0: number, edge1: number, x: number): number {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
  }
}

export default ProgressiveCropProcessor;
