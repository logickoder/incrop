import { MouseEventHandler, useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { CropMode, CropRegion, CropType, ZoomDirection } from './types';
import { getAverageRGB, getGrayscale } from '../../utils/image';

interface InverseCropperProps {
  imageSrc: string;
  onCrop: (cropRegion: CropRegion) => void;
  initialCropMode?: CropMode;
}

export default function InverseCropper(
  {
    imageSrc,
    onCrop,
    initialCropMode = CropMode.horizontal
  }: InverseCropperProps
) {
  const [cropMode, setCropMode] = useState(initialCropMode);
  const [cropRegion, setCropRegion] = useState<CropRegion>({
    x: 0,
    y: 0,
    width: 0,
    height: 0
  });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isSymmetrical, setIsSymmetrical] = useState(true);
  const [cropType, setCropType] = useState(CropType.pixel);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cropGuideRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [containerBackground, setContainerBackground] = useState('transparent');

  const isHorizontalCrop = cropMode === CropMode.horizontal;

  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      // Initial crop region setup
      const defaultCropSize = isHorizontalCrop
        ? image.naturalHeight * 0.2
        : image.naturalWidth * 0.2;

      setCropRegion({
        x: isHorizontalCrop
          ? 0
          : (image.naturalWidth - defaultCropSize) / 2,
        y: isHorizontalCrop
          ? (image.naturalHeight - defaultCropSize) / 2
          : 0,
        width: isHorizontalCrop
          ? image.naturalWidth
          : defaultCropSize,
        height: isHorizontalCrop
          ? defaultCropSize
          : image.naturalHeight
      });
    }
  }, [imageSrc, isHorizontalCrop]);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove: MouseEventHandler<HTMLDivElement> = (e) => {
    if (!isDragging) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }

    const image = imageRef.current;
    if (!image) {
      return;
    }

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;

    // Update crop region based on crop mode
    setCropRegion(prev => {
      const newRegion = { ...prev };

      if (isHorizontalCrop) {
        newRegion.y = Math.max(0, Math.min(
          image.naturalHeight - newRegion.height,
          prev.y + deltaY
        ));
      } else {
        newRegion.x = Math.max(0, Math.min(
          image.naturalWidth - newRegion.width,
          prev.x + deltaX
        ));
      }

      return newRegion;
    });

    setDragStart({ x: currentX, y: currentY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (direction: ZoomDirection) => {
    setZoomLevel(prev =>
      direction === ZoomDirection.in
        ? Math.min(3, prev + 0.1)
        : Math.max(0.5, prev - 0.1)
    );
  };

  const performCrop = () => {
    // Implement actual cropping logic here
    onCrop(cropRegion);
  };

  useEffect(() => {
    if (imageRef?.current) {
      const predominantColor = getAverageRGB(imageRef.current);
      const grayscale = getGrayscale(predominantColor);
      setContainerBackground(grayscale > 128 ? 'black' : 'white');
    }
  }, [imageRef]);

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-100 h-[calc(100vh-200px)]">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setCropMode(CropMode.horizontal)}
            className={`btn btn-sm ${isHorizontalCrop ? 'btn-primary' : 'btn-ghost'}`}
          >
            Horizontal
          </button>
          <button
            onClick={() => setCropMode(CropMode.vertical)}
            className={`btn btn-sm ${cropMode === CropMode.vertical ? 'btn-primary' : 'btn-ghost'}`}
          >
            Vertical
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSymmetrical}
              onChange={() => setIsSymmetrical(!isSymmetrical)}
              className="checkbox checkbox-primary"
            />
            Symmetrical
          </label>
          <select
            value={cropType}
            onChange={(e) => setCropType(e.target.value as CropType)}
            className="select select-bordered select-sm"
          >
            {
              Object.values(CropType).map(type => (
                <option key={type} value={type} className="capitalize">
                  {type}
                </option>
              ))
            }
          </select>
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden border-2 border-gray-300 rounded-lg flex-1"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={
          {
            background: containerBackground
          }
        }
      >
        {/* Background Dimming */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `linear-gradient(to right, 
              rgba(0,0,0,0.5) 0%, 
              rgba(0,0,0,0.5) ${cropRegion.x}px, 
              transparent ${cropRegion.x}px, 
              transparent ${cropRegion.x + cropRegion.width}px, 
              rgba(0,0,0,0.5) ${cropRegion.x + cropRegion.width}px, 
              rgba(0,0,0,0.5) 100%
            )`
          }}
        />

        {/* Image */}
        <img
          ref={imageRef}
          src={imageSrc}
          alt="Crop Preview"
          className="w-full h-auto max-h-full object-contain"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center'
          }}
        />

        {/* Crop Guide */}
        <div
          ref={cropGuideRef}
          className="absolute border-2 border-white z-20 cursor-move"
          style={{
            left: `${cropRegion.x}px`,
            top: `${cropRegion.y}px`,
            width: `${cropRegion.width}px`,
            height: `${cropRegion.height}px`
          }}
        />
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => handleZoom(ZoomDirection.out)}
            className="btn btn-square btn-sm"
          >
            <ZoomOut />
          </button>
          <button
            onClick={() => handleZoom(ZoomDirection.in)}
            className="btn btn-square btn-sm"
          >
            <ZoomIn />
          </button>
        </div>
        <button
          onClick={performCrop}
          className="btn btn-primary"
        >
          Crop Image
        </button>
      </div>
    </div>
  );
}