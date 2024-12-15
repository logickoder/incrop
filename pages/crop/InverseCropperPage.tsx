import { useEffect, useMemo, useRef, useState } from 'react';
import Cropper, { ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { CropMode } from './types';
import { getSafely } from '../../utils/object';

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
        cropInfo: {
          x: cropBoxData.left - canvasData.left,
          y: cropBoxData.top - canvasData.top,
          width: cropBoxData.width,
          height: cropBoxData.height
        },
        imageInfo: imageData
      };

      console.log(inverseCropData);

      onCrop(inverseCropData);
    }
  };

  useEffect(() => {
    if (!cropper) {
      return;
    }

    const isHorizontal = cropMode === CropMode.horizontal;
    const canvasData = cropper.getCanvasData();
    const cropBoxSize = isHorizontal ? canvasData.height * 0.2 : canvasData.width * 0.2;
    // Adjust the crop box
    cropper.setCropBoxData({
      left: isHorizontal ? 0 : cropper.getCanvasData().width / 2 - cropBoxSize / 2,
      top: isHorizontal ? cropper.getCanvasData().height / 2 - cropBoxSize / 2 : 0,
      width: isHorizontal ? cropper.getCanvasData().width : cropBoxSize,
      height: isHorizontal ? cropBoxSize : cropper.getCanvasData().height
    });
    // Disable some cropper points based on the crop mode
    Object.keys(points).forEach((point) => {
      const element = getSafely(cropper, 'cropBox')?.querySelector(`.cropper-point.point-${point}`);
      // @ts-expect-error - check if the point should be enabled
      const enabled = points[point] === cropMode;
      if (element) {
        element.style.display = enabled ? 'block' : 'none';
      }
    });
  }, [cropper, cropMode, points]);

  useEffect(() => {
    if (!cropper) {
      return;
    }

    // make the drag box transparent instead of the half-black color
    const dragBox = getSafely(cropper, 'dragBox') as HTMLDivElement;
    if (dragBox) {
      dragBox.style.backgroundColor = 'inherit';
      dragBox.style.opacity = 'inherit';
    }

    // Then make the face black with 0.3 opacity, since that is what we want to crop out
    const face = getSafely(cropper, 'face') as HTMLDivElement;
    if (face) {
      face.style.backgroundColor = 'black';
      face.style.opacity = '0.3';
    }
  }, [cropper]);

  return (
    <div className="inverse-cropper-container space-y-4">
      <div className="cropper-wrapper relative">
        <Cropper
          ref={cropperRef}
          src={imageSrc}
          style={{
            height: '70vh',
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
          onInitialized={setCropper}
        />
      </div>

      <div className="crop-actions flex justify-between items-center">
        <div className="dropdown">
          <div className="flex flex-rown gap-2 m-1 items-center">
            <p>Crop Mode</p>
            <button tabIndex={0} role="button" className="btn capitalize">{cropMode}</button>
          </div>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
            {
              Object.values(CropMode).map((mode) => (
                <li key={mode}>
                  <button
                    onClick={() => setCropMode(mode)}
                    className={`btn btn-block capitalize ${cropMode === mode ? 'btn-primary' : 'btn-ghost'}`}
                  >
                    {mode}
                  </button>
                </li>
              ))
            }
          </ul>
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
