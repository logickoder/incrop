import { useEffect, useMemo, useRef, useState } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { CropMode } from './types';

interface InverseCropperProps {
  imageSrc: string;
  onCrop: (cropData: unknown) => void;
}

export default function InverseCropper(
  {
    imageSrc,
    onCrop
  }: InverseCropperProps
) {
  const [cropMode, setCropMode] = useState(CropMode.horizontal);
  const [cropper, setCropper] = useState<Cropper | null>(null);
  const cropperRef = useRef<(HTMLImageElement | ReactCropperElement)>(null);

  const points = useMemo(() => ({
    'n': CropMode.horizontal,
    's': CropMode.horizontal,
    'e': CropMode.vertical,
    'w': CropMode.vertical,
    'ne': undefined,
    'nw': undefined,
    'se': undefined,
    'sw': undefined
  }), []);

  const handleCrop = () => {
    if (cropper) {
      // Get the crop box data
      const cropBoxData = cropper.getCropBoxData();
      const canvasData = cropper.getCanvasData();
      const imageData = cropper.getImageData();

      // Inverse crop logic
      const inverseCropData = {
        x: cropBoxData.left - canvasData.left,
        y: cropBoxData.top - canvasData.top,
        width: cropBoxData.width,
        height: cropBoxData.height,
        rotate: imageData.rotate,
        scaleX: imageData.scaleX,
        scaleY: imageData.scaleY
      };

      onCrop(inverseCropData);
    }
  };

  useEffect(() => {
    if (!cropper) {
      return;
    }
  }, [cropper]);

  useEffect(() => {
    if (!cropper) {
      return;
    }

    const isHorizontal = cropMode === CropMode.horizontal;
    const canvasData = cropper.getCanvasData();
    const cropBoxSize = isHorizontal ? canvasData.height * 0.2 : canvasData.width * 0.2;
    // console.log(cropper);
    // Adjust the crop box
    cropper.setCropBoxData({
      left: isHorizontal ? 0 : cropper.getCanvasData().width / 2 - cropBoxSize / 2,
      top: isHorizontal ? cropper.getCanvasData().height / 2 - cropBoxSize / 2 : 0,
      width: isHorizontal ? cropper.getCanvasData().width : cropBoxSize,
      height: isHorizontal ? cropBoxSize : cropper.getCanvasData().height
    });
    // Disable some cropper points based on the crop mode
    Object.keys(points).forEach((point) => {
      // @ts-expect-error - retrieve the cropper point element
      const element = cropper.cropBox.querySelector(`.cropper-point.point-${point}`);
      // @ts-expect-error - check if the point should be enabled
      const enabled = points[point] === cropMode;
      if (element) {
        element.style.display = enabled ? 'block' : 'none';
      }
    });
  }, [cropper, cropMode, points]);

  return (
    <div className="inverse-cropper-container space-y-4">
      <div className="crop-mode-controls flex justify-between items-center">
        <div className="mode-toggle flex gap-2">
          <button
            onClick={() => setCropMode(CropMode.horizontal)}
            className={`btn btn-sm ${cropMode === CropMode.horizontal ? 'btn-primary' : 'btn-ghost'}`}
          >
            Horizontal Crop
          </button>
          <button
            onClick={() => setCropMode(CropMode.vertical)}
            className={`btn btn-sm ${cropMode === CropMode.vertical ? 'btn-primary' : 'btn-ghost'}`}
          >
            Vertical Crop
          </button>
        </div>
      </div>

      <div className="cropper-wrapper relative">
        <Cropper
          ref={cropperRef}
          src={imageSrc}
          style={{
            height: '100%',
            width: '100%'
          }}
          crop={handleCrop}
          viewMode={1}
          dragMode="none"
          cropBoxResizable={true}
          cropBoxMovable={true}
          background={true}
          zoomable={false}
          scalable={false}
          movable={false}
          cropmove={(event) => {
            // @ts-expect-error - disable cropper move if not the right mode
            if (event.detail.action !== 'all' && cropMode !== points[event.detail.action]) {
              event.preventDefault();
            }
          }}
          rotatable={false}
          onInitialized={(instance) => {
            setCropper(instance);

            // console.log(instance, instance.canvas, instance.cropBox);
            // console.log(instance, Object.keys(instance));
            // Custom styling for inverse crop
            // const cropperCanvas = instance.cropper.querySelector('.cropper-canvas');
            // const cropperCropBox = instance.cropper.querySelector('.cropper-crop-box');
            //
            // if (cropperCanvas && cropperCropBox) {
            //   cropperCanvas.style.opacity = '0.3';
            //   cropperCropBox.style.backgroundColor = 'transparent';
            //   cropperCropBox.style.border = '2px solid white';
            // }
          }}
        />
      </div>

      <div className="crop-actions flex justify-between items-center">
        <div className="zoom-controls flex gap-2">
          <button
            onClick={() => cropper?.zoom(0.1)}
            className="btn btn-square btn-sm"
          >
            +
          </button>
          <button
            onClick={() => cropper?.zoom(-0.1)}
            className="btn btn-square btn-sm"
          >
            -
          </button>
        </div>

        <button
          onClick={handleCrop}
          className="btn btn-primary"
        >
          Inverse Crop
        </button>
      </div>
    </div>
  );
}
