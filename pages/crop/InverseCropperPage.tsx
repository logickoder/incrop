import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { CropMode } from './types';
import { toast } from 'react-toastify';
import { CropImage } from '../index/types';
import { getSafely, setStyle } from '../../utils';
import { getAnalytics, logEvent } from 'firebase/analytics';

export default function InverseCropper(
  {
    file,
    preview
  }: CropImage
) {
  const [state, setState] = useState({
    key: 0,
    cropMode: CropMode.horizontal,
    cropper: null as Cropper | null,
    loading: false
  });
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

  const handleCrop = useCallback(() => {
    const cropper = state.cropper;
    if (!cropper) {
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const isHorizontal = state.cropMode === CropMode.horizontal;

      // Get the crop box data
      const cropBoxData = cropper.getCropBoxData();
      const canvasData = cropper.getCanvasData();
      const imageData = cropper.getImageData();

      // scale the crop box data to the original image size
      const widthRatio = imageData.naturalWidth / imageData.width;
      const heightRatio = imageData.naturalHeight / imageData.height;
      const cropInfo = {
        x: (cropBoxData.left - canvasData.left) * widthRatio,
        y: (cropBoxData.top - canvasData.top) * heightRatio,
        width: cropBoxData.width * widthRatio,
        height: cropBoxData.height * heightRatio
      };

      // Create a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      const image = getSafely(cropper, 'image') as HTMLImageElement | undefined;
      if (!image) {
        return;
      }

      // Set the canvas size to the image size - cropped size
      canvas.width = isHorizontal ? imageData.naturalWidth : imageData.naturalWidth - cropInfo.width;
      canvas.height = isHorizontal ? imageData.naturalHeight - cropInfo.height : imageData.naturalHeight;

      // Draw the first part of the cropped image
      const width = isHorizontal ? imageData.naturalWidth : cropInfo.x;
      const height = isHorizontal ? cropInfo.y : imageData.naturalHeight;
      ctx.drawImage(
        image,
        0,  // Source x
        0,  // Source y
        width,   // Source width
        height,  // Source height
        0,  // Destination x
        0,  // Destination y
        width,   // Destination width
        height   // Destination height
      );

      // Draw the second part of the cropped image
      const sourceX = isHorizontal ? 0 : cropInfo.x + cropInfo.width;
      const sourceY = isHorizontal ? cropInfo.y + cropInfo.height : 0;
      ctx.drawImage(
        image,
        sourceX,  // Source x
        sourceY,  // Source y
        isHorizontal ? imageData.naturalWidth : imageData.naturalWidth - sourceX,   // Source width
        isHorizontal ? imageData.naturalHeight - sourceY : imageData.naturalHeight,  // Source height
        isHorizontal ? 0 : cropInfo.x,  // Destination x
        isHorizontal ? cropInfo.y : 0, // Destination y
        isHorizontal ? canvas.width : canvas.width - cropInfo.x,     // Destination width
        isHorizontal ? canvas.height - cropInfo.y : canvas.height   // Destination height
      );

      // Get the cropped image as a Data URL
      const croppedImage = canvas.toDataURL(file.type);

      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = croppedImage;
      link.download = `incrop-${file.name}`;
      link.click();

      const analytics = getAnalytics();
      logEvent(analytics, 'crop_image', {
        cropMode: state.cropMode,
        fileType: file.type
      });
    } catch (error) {
      console.error('Failed to crop image', error);
      toast('An error occurred when cropping your image', { type: 'error' });
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.cropper, state.cropMode, file]);

  // force a re-render to reset the cropper instance
  useEffect(() => {
    setState((prev) => ({ ...prev, cropper: null, key: prev.key + 1 }));
  }, [preview, state.cropMode]);

  return (
    <div className="space-y-4">
      <div className="cropper-wrapper relative">
        <Cropper
          key={state.key}
          ref={cropperRef}
          src={preview}
          style={{
            height: '60vh',
            width: '100%'
          }}
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
            if (event.detail.action !== 'all' && state.cropMode !== points[event.detail.action]) {
              event.preventDefault();
            }
          }}
          rotatable={false}
          ready={(event) => {
            if (!event.target) {
              return;
            }
            const cropper = getSafely(event.target, 'cropper') as Cropper;
            const cropMode = state.cropMode;
            if (!cropper) {
              return;
            }

            /**
             * This is where the magic happens,
             * first we make the drag box transparent instead of the half-black color,
             * then we make the face black with 0.3 opacity, since that is what we want to crop out
             */

            // make the drag box transparent instead of the half-black color
            setStyle(getSafely(cropper, 'dragBox'), { backgroundColor: 'inherit', opacity: 'inherit' });

            // Then make the face black with 0.3 opacity, since that is what we want to crop out
            setStyle(getSafely(cropper, 'face'), { backgroundColor: 'black', opacity: '0.3' });

            /**
             * Then we adjust the crop box to the desired crop mode
             */
            const isHorizontal = cropMode === CropMode.horizontal;
            const canvasData = cropper.getCanvasData();
            const width = canvasData.width;
            const height = canvasData.height;

            const cropBoxSize = isHorizontal ? height * 0.2 : width * 0.2;
            // Adjust the crop box
            cropper.setCropBoxData({
              left: isHorizontal ? 0 : width / 2 - cropBoxSize / 2,
              top: isHorizontal ? height / 2 - cropBoxSize / 2 : 0,
              width: isHorizontal ? width : cropBoxSize,
              height: isHorizontal ? cropBoxSize : height
            });
            // Disable some cropper points based on the crop mode
            Object.keys(points).forEach((point) => {
              setStyle(
                getSafely(cropper, 'cropBox')?.querySelector(`.cropper-point.point-${point}`),
                // @ts-expect-error - check if the point should be enabled
                { display: points[point] === cropMode ? 'block' : 'none', width: '10px', height: '10px' }
              );
            });
          }}
          onInitialized={(cropper) => setState((prev) => ({ ...prev, cropper }))}
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <label className="form-control w-full md:max-w-xs">
          <div className="label">
            <span className="label-text">Crop Mode</span>
          </div>
          <select
            className="select select-bordered capitalize"
            value={state.cropMode}
            onChange={(event) => {
              setState((prev) => ({ ...prev, cropMode: event.target.value as CropMode }));
            }}
          >
            <option disabled>Pick one</option>
            {
              Object.values(CropMode).map((mode) => (
                <option key={mode} className="capitalize">
                  {mode}
                </option>
              ))
            }
          </select>
        </label>
        <button
          onClick={handleCrop}
          className="btn btn-primary w-full md:w-fit"
          disabled={state.loading}
        >
          Exclude Selection {state.loading && <span className="ml-2 loading loading-dots loading-sm" />}
        </button>
      </div>
    </div>
  );
}
