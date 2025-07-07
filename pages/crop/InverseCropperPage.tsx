import { useCallback, useEffect, useState } from 'react';
import { CropMode, CropRegion } from './types';
import { toast } from 'react-toastify';
import { CropImage } from '../index/types';
import { getAnalytics, logEvent } from 'firebase/analytics';
import CustomCropper from './CustomCropper';

export default function InverseCropper(
  {
    file,
    preview
  }: CropImage
) {
  const [state, setState] = useState({
    cropMode: CropMode.horizontal,
    cropData: null as CropRegion | null,
    loading: false
  });

  const handleCrop = useCallback(() => {
    if (!state.cropData) {
      toast('Please select a crop area first', { type: 'error' });
      return;
    }

    try {
      setState((prev) => ({ ...prev, loading: true }));

      const isHorizontal = state.cropMode === CropMode.horizontal;
      const cropInfo = state.cropData;

      // Create a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      // Create an image element to load the original image
      const image = new Image();
      image.onload = () => {
        // Set the canvas size to the image size - cropped size
        canvas.width = isHorizontal ? image.naturalWidth : image.naturalWidth - cropInfo.width;
        canvas.height = isHorizontal ? image.naturalHeight - cropInfo.height : image.naturalHeight;

        // Draw the first part of the cropped image
        const width = isHorizontal ? image.naturalWidth : cropInfo.x;
        const height = isHorizontal ? cropInfo.y : image.naturalHeight;

        if (width > 0 && height > 0) {
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
        }

        // Draw the second part of the cropped image
        const sourceX = isHorizontal ? 0 : cropInfo.x + cropInfo.width;
        const sourceY = isHorizontal ? cropInfo.y + cropInfo.height : 0;
        const sourceWidth = isHorizontal ? image.naturalWidth : image.naturalWidth - sourceX;
        const sourceHeight = isHorizontal ? image.naturalHeight - sourceY : image.naturalHeight;

        if (sourceWidth > 0 && sourceHeight > 0) {
          ctx.drawImage(
            image,
            sourceX,  // Source x
            sourceY,  // Source y
            sourceWidth,   // Source width
            sourceHeight,  // Source height
            isHorizontal ? 0 : cropInfo.x,  // Destination x
            isHorizontal ? cropInfo.y : 0, // Destination y
            isHorizontal ? canvas.width : canvas.width - cropInfo.x,     // Destination width
            isHorizontal ? canvas.height - cropInfo.y : canvas.height   // Destination height
          );
        }

        // Get the cropped image as a Data URL
        const croppedImage = canvas.toDataURL(file.type);

        // Create a link and trigger download
        const link = document.createElement('a');
        link.href = croppedImage;
        link.download = `incrop-${file.name}`;
        link.click();

        toast('Image cropped successfully, check your downloads', { type: 'success' });

        const analytics = getAnalytics();
        logEvent(analytics, 'crop_image', {
          cropMode: state.cropMode,
          fileType: file.type
        });

        setState((prev) => ({ ...prev, loading: false }));
      };

      image.onerror = () => {
        console.error('Failed to load image');
        toast('An error occurred when processing your image', { type: 'error' });
        setState((prev) => ({ ...prev, loading: false }));
      };

      image.src = preview;
    } catch (error) {
      console.error('Failed to crop image', error);
      toast('An error occurred when cropping your image', { type: 'error' });
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [state.cropData, state.cropMode, file, preview]);

  return (
    <div className="space-y-4">
      <div className="cropper-wrapper relative">
        <CustomCropper
          src={preview}
          cropMode={state.cropMode}
          onCropChange={(cropData) => setState((prev) => ({ ...prev, cropData }))}
          onReady={(cropData) => setState((prev) => ({ ...prev, cropData }))}
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
