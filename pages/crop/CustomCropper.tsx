/**
 * CustomCropper - A high-performance image cropper for inverse cropping
 * Uses CSS transforms for smooth interactions and hardware acceleration
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CropMode, CropRegion } from './types';

interface CustomCropperProps {
  src: string;
  onCropChange?: (cropData: CropRegion) => void;
  cropMode: CropMode;
  onReady?: (cropData: CropRegion) => void;
  showCropArea?: boolean;
}

export default function CustomCropper({
                                        src,
                                        onCropChange,
                                        cropMode,
                                        onReady,
                                        showCropArea = true
                                      }: CustomCropperProps) {
  // DOM references
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Crop state
  const [cropData, setCropData] = useState<CropRegion>({ x: 0, y: 0, width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Interaction state
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeHandle, setResizeHandle] = useState<string>('');

  // Transform optimization - store initial dimensions to enable CSS transforms
  const [initialCropDimensions, setInitialCropDimensions] = useState({ width: 0, height: 0 });

  // Stable callback references to prevent dependency loops
  const onCropChangeRef = useRef(onCropChange);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onCropChangeRef.current = onCropChange;
    onReadyRef.current = onReady;
  }, [onCropChange, onReady]);

  /**
   * Transforms crop data from image coordinates to display coordinates
   * This accounts for scaling and positioning of the image within the container
   */
  const transformCropData: () => CropRegion | undefined = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return undefined;

    const container = containerRef.current;
    const image = imageRef.current;
    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    const scaleX = image.clientWidth / image.naturalWidth;
    const scaleY = image.clientHeight / image.naturalHeight;

    const imageOffsetX = imageRect.left - containerRect.left;
    const imageOffsetY = imageRect.top - containerRect.top;

    return {
      x: cropData.x * scaleX + imageOffsetX,
      y: cropData.y * scaleY + imageOffsetY,
      width: cropData.width * scaleX,
      height: cropData.height * scaleY
    };
  }, [cropData]);

  /**
   * Converts image coordinates to display coordinates (pixels on screen)
   */
  const getDisplayCropData = useCallback(() => {
    return transformCropData() || cropData;
  }, [cropData, transformCropData]);

  /**
   * Converts display coordinates back to image coordinates for processing
   */
  const convertToImageCoordinates = useCallback((displayX: number, displayY: number, displayWidth: number, displayHeight: number) => {
    if (!imageRef.current || !containerRef.current) return { x: 0, y: 0, width: 0, height: 0 };

    const container = containerRef.current;
    const image = imageRef.current;
    const containerRect = container.getBoundingClientRect();
    const imageRect = image.getBoundingClientRect();

    const scaleX = image.naturalWidth / image.clientWidth;
    const scaleY = image.naturalHeight / image.clientHeight;

    const imageOffsetX = imageRect.left - containerRect.left;
    const imageOffsetY = imageRect.top - containerRect.top;

    return {
      x: Math.max(0, (displayX - imageOffsetX) * scaleX),
      y: Math.max(0, (displayY - imageOffsetY) * scaleY),
      width: Math.min(image.naturalWidth, displayWidth * scaleX),
      height: Math.min(image.naturalHeight, displayHeight * scaleY)
    };
  }, []);

  /**
   * Performance optimization: Calculate display coordinates and transforms only when needed
   * Uses CSS transforms for hardware-accelerated positioning and scaling
   */
  const { displayCrop, cropTransform } = useMemo(() => {
    const displayCrop = transformCropData();
    if (!displayCrop) {
      return {
        displayCrop: { x: 0, y: 0, width: 0, height: 0 },
        cropTransform: { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 }
      };
    }

    // Calculate CSS transform values for smooth scaling/positioning
    const cropTransform = {
      translateX: displayCrop.x,
      translateY: displayCrop.y,
      scaleX: initialCropDimensions.width > 0 ? displayCrop.width / initialCropDimensions.width : 1,
      scaleY: initialCropDimensions.height > 0 ? displayCrop.height / initialCropDimensions.height : 1
    };

    return { displayCrop, cropTransform };
  }, [initialCropDimensions.height, initialCropDimensions.width, transformCropData]);

  /**
   * Initialize crop area based on mode when image loads
   * Horizontal: Full width strip in center
   * Vertical: Full height strip in center
   */
  useEffect(() => {
    if (!imageLoaded || !imageRef.current) return;

    const image = imageRef.current;
    const isHorizontal = cropMode === CropMode.horizontal;
    const cropSize = isHorizontal ? image.naturalHeight * 0.2 : image.naturalWidth * 0.2;

    const initialCrop = {
      x: isHorizontal ? 0 : image.naturalWidth / 2 - cropSize / 2,
      y: isHorizontal ? image.naturalHeight / 2 - cropSize / 2 : 0,
      width: isHorizontal ? image.naturalWidth : cropSize,
      height: isHorizontal ? cropSize : image.naturalHeight
    };

    setCropData(initialCrop);

    // Store initial display dimensions for transform calculations
    const container = containerRef.current;
    if (container && imageRef.current) {
      const scaleX = imageRef.current.clientWidth / imageRef.current.naturalWidth;
      const scaleY = imageRef.current.clientHeight / imageRef.current.naturalHeight;

      setInitialCropDimensions({
        width: initialCrop.width * scaleX,
        height: initialCrop.height * scaleY
      });
    }

    onReadyRef.current?.(initialCrop);
  }, [imageLoaded, cropMode]);

  // Notify parent component of crop changes
  useEffect(() => {
    onCropChangeRef.current?.(cropData);
  }, [cropData]);

  /**
   * Revalidate crop area dimensions and grid on window resize
   */
  const revalidateCropArea = useCallback(() => {
    if (!imageRef.current || !containerRef.current || !imageLoaded) return;

    const image = imageRef.current;

    // Update initial crop dimensions based on new window size
    const scaleX = image.clientWidth / image.naturalWidth;
    const scaleY = image.clientHeight / image.naturalHeight;

    setInitialCropDimensions({
      width: cropData.width * scaleX,
      height: cropData.height * scaleY
    });

    // Force re-render of crop area with new dimensions
    onCropChangeRef.current?.(cropData);
  }, [imageLoaded, cropData]);

  /**
   * Handle window resize events with debouncing
   */
  useEffect(() => {
    const handleResize = () => {
      // Debounce the revalidation to avoid excessive calls
      const timeoutId = setTimeout(() => {
        revalidateCropArea();
      }, 100);

      return () => clearTimeout(timeoutId);
    };

    // Add resize event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [revalidateCropArea]);

  /**
   * Handle mouse down events for starting drag or resize operations
   * Also handles touch events for mobile support
   */
  const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !imageRef.current) return;

    e.preventDefault();

    // Get coordinates from either mouse or touch event
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const displayCrop = getDisplayCropData();
    const target = e.target as HTMLElement;

    if (target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeHandle(target.dataset.handle || '');
      setDragStart({ x: clientX, y: clientY });
    } else if (
      x >= displayCrop.x &&
      x <= displayCrop.x + displayCrop.width &&
      y >= displayCrop.y &&
      y <= displayCrop.y + displayCrop.height
    ) {
      setIsDragging(true);
      setDragStart({ x: clientX - displayCrop.x, y: clientY - displayCrop.y });
    }
  }, [getDisplayCropData]);

  /**
   * Handle mouse movement for drag and resize operations
   * Also handles touch events for mobile support
   * Constrains movement to image boundaries and enforces minimum sizes
   */
  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!containerRef.current || !imageRef.current) return;
    if (!isDragging && !isResizing) return;

    e.preventDefault(); // Prevent scrolling on mobile

    // Get coordinates from either mouse or touch event
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const containerRect = containerRef.current.getBoundingClientRect();
    const image = imageRef.current;
    const imageRect = image.getBoundingClientRect();

    const imageOffsetX = imageRect.left - containerRect.left;
    const imageOffsetY = imageRect.top - containerRect.top;
    const imageDisplayWidth = image.clientWidth;
    const imageDisplayHeight = image.clientHeight;

    const displayCrop = getDisplayCropData();

    if (isDragging) {
      // Constrain drag to image boundaries
      const newX = Math.max(imageOffsetX, Math.min(clientX - dragStart.x, imageOffsetX + imageDisplayWidth - displayCrop.width));
      const newY = Math.max(imageOffsetY, Math.min(clientY - dragStart.y, imageOffsetY + imageDisplayHeight - displayCrop.height));

      const newCropData = convertToImageCoordinates(newX, newY, displayCrop.width, displayCrop.height);
      setCropData(newCropData);
    } else if (isResizing) {
      const newDisplayCrop = { ...displayCrop };
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;

      const isHorizontal = cropMode === CropMode.horizontal;

      // Handle resize based on crop mode and handle direction
      if (isHorizontal && (resizeHandle === 'n' || resizeHandle === 's')) {
        if (resizeHandle === 'n') {
          const newY = Math.max(imageOffsetY, displayCrop.y + deltaY);
          const newHeight = displayCrop.height - (newY - displayCrop.y);
          newDisplayCrop.y = newY;
          newDisplayCrop.height = Math.max(20, newHeight);
        } else {
          newDisplayCrop.height = Math.max(20, Math.min(imageDisplayHeight - (displayCrop.y - imageOffsetY), displayCrop.height + deltaY));
        }
      } else if (!isHorizontal && (resizeHandle === 'e' || resizeHandle === 'w')) {
        if (resizeHandle === 'w') {
          const newX = Math.max(imageOffsetX, displayCrop.x + deltaX);
          const newWidth = displayCrop.width - (newX - displayCrop.x);
          newDisplayCrop.x = newX;
          newDisplayCrop.width = Math.max(20, newWidth);
        } else {
          newDisplayCrop.width = Math.max(20, Math.min(imageDisplayWidth - (displayCrop.x - imageOffsetX), displayCrop.width + deltaX));
        }
      }

      const newCropData = convertToImageCoordinates(newDisplayCrop.x, newDisplayCrop.y, newDisplayCrop.width, newDisplayCrop.height);
      setCropData(newCropData);
      setDragStart({ x: clientX, y: clientY });
    }
  }, [isDragging, isResizing, dragStart, resizeHandle, getDisplayCropData, convertToImageCoordinates, cropMode]);

  const handleMouseUp = useCallback((e?: MouseEvent | TouchEvent) => {
    e?.preventDefault();
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle('');
  }, []);

  // Global mouse and touch event listeners for smooth interaction
  useEffect(() => {
    if (isDragging || isResizing) {
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      // Touch events for mobile
      document.addEventListener('touchmove', handleMouseMove, { passive: false });
      document.addEventListener('touchend', handleMouseUp);
      document.addEventListener('touchcancel', handleMouseUp);

      return () => {
        // Clean up mouse events
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        // Clean up touch events
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
        document.removeEventListener('touchcancel', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const isHorizontal = cropMode === CropMode.horizontal;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-image-neutral-50 dark:bg-image-neutral-800 overflow-hidden select-none border border-image-neutral-200 dark:border-image-neutral-700 rounded-lg shadow-sm flex items-center justify-center touch-none"
      style={{ height: '60vh' }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
    >
      <img
        ref={imageRef}
        src={src}
        alt="Crop preview"
        className="max-w-full max-h-full object-contain"
        style={{ userSelect: 'none' }}
        onLoad={() => setImageLoaded(true)}
        draggable={false}
      />

      {imageLoaded && showCropArea && (
        <>
          {/* Crop overlay - shows the area that will be removed */}
          <div
            className="absolute bg-image-accent-500/20 backdrop-blur-[0.5px] cursor-move hover:bg-image-accent-500/25"
            style={{
              left: 0,
              top: 0,
              width: initialCropDimensions.width || displayCrop.width,
              height: initialCropDimensions.height || displayCrop.height,
              transform: `translate(${cropTransform.translateX}px, ${cropTransform.translateY}px) scale(${cropTransform.scaleX}, ${cropTransform.scaleY})`,
              transformOrigin: '0 0',
              pointerEvents: 'auto',
              transition: isDragging || isResizing ? 'none' : 'transform 0.15s ease-out'
            }}
          >
            {/* Resize handles - larger on mobile */}
            {isHorizontal && (
              <>
                <div
                  className="resize-handle absolute bg-white border-2 border-image-accent-500 cursor-ns-resize hover:bg-image-accent-50 hover:scale-110 transition-all duration-150 shadow-md touch-manipulation"
                  data-handle="n"
                  style={{
                    left: '50%',
                    top: '-8px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '2px',
                    transform: `translateX(-50%) scale(${1 / cropTransform.scaleX}, ${1 / cropTransform.scaleY})`
                  }}
                />
                <div
                  className="resize-handle absolute bg-white border-2 border-image-accent-500 cursor-ns-resize hover:bg-image-accent-50 hover:scale-110 transition-all duration-150 shadow-md touch-manipulation"
                  data-handle="s"
                  style={{
                    left: '50%',
                    bottom: '-8px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '2px',
                    transform: `translateX(-50%) scale(${1 / cropTransform.scaleX}, ${1 / cropTransform.scaleY})`
                  }}
                />
              </>
            )}
            {!isHorizontal && (
              <>
                <div
                  className="resize-handle absolute bg-white border-2 border-image-accent-500 cursor-ew-resize hover:bg-image-accent-50 hover:scale-110 transition-all duration-150 shadow-md touch-manipulation"
                  data-handle="w"
                  style={{
                    left: '-8px',
                    top: '50%',
                    width: '16px',
                    height: '16px',
                    borderRadius: '2px',
                    transform: `translateY(-50%) scale(${1 / cropTransform.scaleX}, ${1 / cropTransform.scaleY})`
                  }}
                />
                <div
                  className="resize-handle absolute bg-white border-2 border-image-accent-500 cursor-ew-resize hover:bg-image-accent-50 hover:scale-110 transition-all duration-150 shadow-md touch-manipulation"
                  data-handle="e"
                  style={{
                    right: '-8px',
                    top: '50%',
                    width: '16px',
                    height: '16px',
                    borderRadius: '2px',
                    transform: `translateY(-50%) scale(${1 / cropTransform.scaleX}, ${1 / cropTransform.scaleY})`
                  }}
                />
              </>
            )}

            {/* Visual indicator showing the purpose of the selection */}
            <div
              className="absolute pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) scale(${1 / cropTransform.scaleX}, ${1 / cropTransform.scaleY})`
              }}
            >
              <div className="bg-image-accent-600 text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                Remove
              </div>
            </div>
          </div>

          {/* Separate border element that maintains consistent thickness */}
          <div
            className="absolute border-2 border-image-accent-500 pointer-events-none"
            style={{
              left: cropTransform.translateX,
              top: cropTransform.translateY,
              width: displayCrop.width,
              height: displayCrop.height,
              boxShadow: '0 0 0 2px rgba(230, 32, 32, 0.3), inset 0 0 0 1px rgba(255, 255, 255, 0.5)',
              transition: isDragging || isResizing ? 'none' : 'all 0.15s ease-out'
            }}
          />

          {/* Rule of thirds grid, constrained to image boundaries for composition guidiance */}
          {imageRef.current && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: displayCrop.x - cropTransform.translateX + (imageRef.current.getBoundingClientRect().left - containerRef.current!.getBoundingClientRect().left),
                top: displayCrop.y - cropTransform.translateY + (imageRef.current.getBoundingClientRect().top - containerRef.current!.getBoundingClientRect().top),
                width: imageRef.current.clientWidth,
                height: imageRef.current.clientHeight
              }}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute w-full h-px bg-image-primary-300 top-1/3"></div>
                <div className="absolute w-full h-px bg-image-primary-300 top-2/3"></div>
                <div className="absolute h-full w-px bg-image-primary-300 left-1/3"></div>
                <div className="absolute h-full w-px bg-image-primary-300 left-2/3"></div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
