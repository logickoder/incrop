export type CropRegion = {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum CropMode {
  horizontal = 'horizontal',
  vertical = 'vertical'
}

export enum ZoomDirection {
  in,
  out
}

export enum CropType {
  pixel = 'pixel',
  percentage = 'percentage'
}

// Progressive cropping types
export interface CropStep {
  id: string;
  cropRegion: CropRegion;
  cropMode: CropMode;
  timestamp: number;
  previewDataUrl?: string;
}

export interface ProgressiveCropState {
  originalImage: string;
  currentPreview: string;
  cropHistory: CropStep[];
  activeCropIndex: number;
  isProcessing: boolean;
}
