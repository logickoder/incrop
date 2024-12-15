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