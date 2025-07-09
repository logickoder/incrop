import { useCallback, useState } from 'react';
import { CropMode, CropRegion, CropStep, ProgressiveCropState } from './types';
import { toast } from 'react-toastify';
import { CropImage } from '../index/types';
import { getAnalytics, logEvent } from 'firebase/analytics';
import CustomCropper from './CustomCropper';
import ProgressiveCropProcessor from './ProgressiveCropProcessor';

export default function InverseCropper({ file, preview }: CropImage) {
  const [state, setState] = useState<ProgressiveCropState>({
    originalImage: preview,
    currentPreview: preview,
    cropHistory: [],
    activeCropIndex: -1,
    isProcessing: false
  });

  const [currentCropMode, setCurrentCropMode] = useState(CropMode.horizontal);
  const [currentCropData, setCurrentCropData] = useState<CropRegion | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [cropperKey, setCropperKey] = useState(0);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [featherRadius, setFeatherRadius] = useState(20);

  /**
   * Add a new crop step to the history and generate preview
   */
  const addCropStep = useCallback(async () => {
    if (!currentCropData) {
      toast('Please select a crop area first', { type: 'error' });
      return;
    }

    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const stepId = `crop-${Date.now()}`;
      const newStep: CropStep = {
        id: stepId,
        cropRegion: currentCropData,
        cropMode: currentCropMode,
        timestamp: Date.now()
      };

      // Apply the crop to get the new current preview with smooth blending
      const newCurrentPreview = await ProgressiveCropProcessor.applyCrop(
        state.currentPreview,
        currentCropData,
        currentCropMode,
        file.name,
        featherRadius
      );

      setState(prev => ({
        ...prev,
        cropHistory: [...prev.cropHistory, newStep],
        activeCropIndex: prev.cropHistory.length,
        currentPreview: newCurrentPreview,
        isProcessing: false
      }));

      // Reset cropper by incrementing key
      setCropperKey(prev => prev + 1);

      toast('Crop added successfully! Add another or download when ready.', { type: 'success' });

      const analytics = getAnalytics();
      logEvent(analytics, 'add_crop_step', {
        cropMode: currentCropMode,
        stepCount: state.cropHistory.length + 1,
        featherRadius
      });
    } catch (error) {
      console.error('Failed to add crop step', error);
      toast('An error occurred when processing the crop', { type: 'error' });
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [currentCropData, currentCropMode, state.currentPreview, state.cropHistory.length, file.name, featherRadius]);

  /**
   * Undo to a specific crop step
   */
  const undoToStep = useCallback(async (stepIndex: number) => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const stepsToKeep = state.cropHistory.slice(0, stepIndex + 1);

      // Regenerate preview from original image with remaining steps using smooth blending
      const newPreview = stepIndex === -1
        ? state.originalImage
        : await ProgressiveCropProcessor.applyProgressiveCrops(state.originalImage, stepsToKeep, featherRadius);

      setState(prev => ({
        ...prev,
        cropHistory: stepsToKeep,
        activeCropIndex: stepIndex,
        currentPreview: newPreview,
        isProcessing: false
      }));

      // Reset cropper
      setCropperKey(prev => prev + 1);

      toast(`Undone to ${stepIndex === -1 ? 'original' : `step ${stepIndex + 1}`}`, { type: 'info' });
    } catch (error) {
      console.error('Failed to undo', error);
      toast('An error occurred during undo', { type: 'error' });
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.cropHistory, state.originalImage, featherRadius]);

  /**
   * Download the final processed image
   */
  const downloadFinalImage = useCallback(async () => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      // Generate high-quality final image with smooth blending
      const finalImage = await ProgressiveCropProcessor.applyProgressiveCrops(
        state.originalImage,
        state.cropHistory,
        featherRadius
      );

      // Create download link
      const link = document.createElement('a');
      link.href = finalImage;
      link.download = `incrop-${file.name}`;
      link.click();

      toast('Image downloaded successfully!', { type: 'success' });

      const analytics = getAnalytics();
      logEvent(analytics, 'download_progressive_crop', {
        totalSteps: state.cropHistory.length,
        fileType: file.type,
        featherRadius
      });
    } catch (error) {
      console.error('Failed to download image', error);
      toast('An error occurred when generating final image', { type: 'error' });
    } finally {
      setState(prev => ({ ...prev, isProcessing: false }));
    }
  }, [state.originalImage, state.cropHistory, file.name, file.type, featherRadius]);

  /**
   * Reset all crops and start over
   */
  const resetAllCrops = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentPreview: prev.originalImage,
      cropHistory: [],
      activeCropIndex: -1
    }));
    setCropperKey(prev => prev + 1);
    toast('All crops cleared', { type: 'info' });
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header with crop history */}
      <div className="flex-shrink-0 bg-base-100 border-b border-base-300 p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Crop history info */}
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              {state.cropHistory.length > 0 ? (
                <span className="text-success">
                  {state.cropHistory.length} crop{state.cropHistory.length !== 1 ? 's' : ''} applied
                </span>
              ) : (
                <span className="text-base-content/60">No crops applied</span>
              )}
            </div>

            {/* Crop history list - compact and hidden on small screens */}
            <div className="hidden md:flex items-center gap-2">
              {state.cropHistory.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="badge badge-sm badge-outline">
                    {index + 1}: {step.cropMode[0].toUpperCase()}
                  </div>
                  <button
                    onClick={() => undoToStep(index - 1)}
                    className="btn btn-xs btn-ghost ml-1 text-warning"
                    disabled={state.isProcessing}
                    title={`Undo to ${index === 0 ? 'original' : `step ${index}`}`}
                  >
                    ✕
                  </button>
                  {index < state.cropHistory.length - 1 && (
                    <div className="mx-1 text-base-content/30">→</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {state.cropHistory.length > 0 && (
              <button
                onClick={() => setIsHistoryVisible(true)}
                className="btn btn-sm btn-outline md:hidden"
                disabled={state.isProcessing}
              >
                History
              </button>
            )}
            <button
              onClick={resetAllCrops}
              className="btn btn-sm btn-outline btn-warning"
              disabled={state.isProcessing || state.cropHistory.length === 0}
            >
              Reset All
            </button>
            <button
              onClick={downloadFinalImage}
              className="btn btn-sm btn-primary"
              disabled={state.isProcessing || state.cropHistory.length === 0}
            >
              {state.isProcessing ? (
                <>
                  <span className="loading loading-dots loading-xs"></span>
                  Processing...
                </>
              ) : (
                `Download`
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main cropping area - full height */}
      <div className="flex-1 relative">
        <CustomCropper
          key={cropperKey}
          src={showOriginal ? state.originalImage : state.currentPreview}
          cropMode={currentCropMode}
          onCropChange={(cropData) => setCurrentCropData(cropData)}
          onReady={(cropData) => setCurrentCropData(cropData)}
          showCropArea={!showOriginal}
        />

        {/* Background tint for better button visibility */}
        <div
          className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-5"></div>

        {/* Overlay controls positioned over the crop area */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
          {/* Show Original toggle */}
          <button
            className={`btn btn-sm ${showOriginal ? 'btn-primary' : 'btn-outline'} backdrop-blur-sm bg-base-100/90`}
            onClick={() => setShowOriginal(!showOriginal)}
            disabled={state.isProcessing}
            title="Toggle between current result and original image"
          >
            {showOriginal ? '← Back to Result' : 'Show Original'}
          </button>
        </div>

        {/* Bottom controls */}
        <div className="z-10 mt-6">
          <div
            className="bg-base-100/95 backdrop-blur-sm border border-base-300 rounded-lg p-3 shadow-lg max-w-lg mx-auto">
            <div className="flex flex-col sm:flex-row items-end justify-between gap-4">
              {/* Crop mode selector */}
              <label className="form-control w-full sm:flex-1 sm:max-w-xs">
                <div className="label pb-1">
                  <span className="label-text font-medium text-sm">Crop Mode</span>
                </div>
                <select
                  className="select select-bordered select-sm w-full"
                  value={currentCropMode}
                  onChange={(e) => setCurrentCropMode(e.target.value as CropMode)}
                  disabled={state.isProcessing || showOriginal}
                >
                  <option value={CropMode.horizontal}>Horizontal Strip</option>
                  <option value={CropMode.vertical}>Vertical Strip</option>
                </select>
              </label>

              {/* Feather radius slider */}
              <div className="form-control w-full sm:max-w-xs">
                <div className="label pb-1">
                  <span className="label-text font-medium text-sm">Feather Radius</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={featherRadius}
                  onChange={(e) => setFeatherRadius(Number(e.target.value))}
                  className="range range-primary"
                  disabled={state.isProcessing || showOriginal}
                />
                <div className="flex justify-between text-xs px-2">
                  <span>0</span>
                  <span>{featherRadius}</span>
                  <span>100</span>
                </div>
              </div>

              {/* Add crop button */}
              <button
                onClick={addCropStep}
                className="btn btn-accent w-full sm:w-auto"
                disabled={state.isProcessing || !currentCropData || showOriginal}
              >
                {state.isProcessing ? (
                  <>
                    <span className="loading loading-dots loading-sm"></span>
                    Processing...
                  </>
                ) : (
                  `Add ${currentCropMode} Crop`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* History Modal for mobile */}
        {isHistoryVisible && (
          <div className="fixed inset-0 bg-black/60 z-20 flex items-center justify-center">
            <div className="bg-base-100 rounded-lg shadow-xl p-4 w-11/12 max-w-md">
              <h3 className="text-lg font-bold mb-4">Crop History</h3>
              <div className="flex flex-col gap-3">
                {state.cropHistory.map((step, index) => (
                  <div key={step.id} className="flex items-center justify-between p-2 rounded-lg bg-base-200">
                    <div className="flex items-center gap-3">
                      <div className="badge badge-outline">
                        {index + 1}: {step.cropMode}
                      </div>
                      <span className="text-xs text-base-content/70">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        void undoToStep(index - 1);
                        setIsHistoryVisible(false);
                      }}
                      className="btn btn-xs btn-ghost text-warning"
                      disabled={state.isProcessing}
                      title={`Undo to ${index === 0 ? 'original' : `step ${index}`}`}
                    >
                      Undo to here
                    </button>
                  </div>
                ))}
                {state.cropHistory.length === 0 && (
                  <p className="text-center text-base-content/60 py-4">No history yet.</p>
                )}
              </div>
              <div className="mt-6 text-right">
                <button onClick={() => setIsHistoryVisible(false)} className="btn">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Operations disabled overlay when showing original */}
        {showOriginal && (
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[0.5px] z-5 flex items-center justify-center">
            <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm">
              Viewing original image - switch back to continue editing
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
