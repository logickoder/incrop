import { MouseEvent, TouchEvent } from 'react';

interface ResizeHandleProps {
  direction: 'n' | 's' | 'e' | 'w';
  onMouseDown: (e: MouseEvent | TouchEvent) => void;
  cropTransform: {
    scaleX: number;
    scaleY: number;
  };
  className?: string;
}

export default function ResizeHandle({ direction, onMouseDown, cropTransform, className = '' }: ResizeHandleProps) {
  const getPositionStyles = () => {
    const baseStyles = {
      width: '20px',
      height: '20px',
      borderRadius: '2px'
      // Add invisible padding for larger touch area (44px total)
      // padding: '14px',
      // margin: '-14px'
    };

    switch (direction) {
      case 'n':
        return {
          ...baseStyles,
          left: '50%',
          top: '-10px',
          transform: `translateX(-50%) scale(${1 / cropTransform.scaleX}, ${1 / cropTransform.scaleY})`
        };
      case 's':
        return {
          ...baseStyles,
          left: '50%',
          bottom: '-10px',
          transform: `translateX(-50%) scale(${1 / cropTransform.scaleX}, ${1 / cropTransform.scaleY})`
        };
      case 'w':
        return {
          ...baseStyles,
          left: '-10px',
          top: '50%',
          transform: `translateY(-50%) scale(${1 / cropTransform.scaleX}, ${1 / cropTransform.scaleY})`
        };
      case 'e':
        return {
          ...baseStyles,
          right: '-10px',
          top: '50%',
          transform: `translateY(-50%) scale(${1 / cropTransform.scaleX}, ${1 / cropTransform.scaleY})`
        };
      default:
        return baseStyles;
    }
  };

  const getCursorClass = () => {
    return direction === 'n' || direction === 's' ? 'cursor-ns-resize' : 'cursor-ew-resize';
  };

  return (
    <div
      className={`resize-handle absolute bg-white border-2 border-image-accent-500 hover:bg-image-accent-50 hover:scale-110 transition-all duration-150 shadow-md touch-manipulation ${getCursorClass()} ${className}`}
      data-handle={direction}
      style={getPositionStyles()}
      onMouseDown={onMouseDown}
      onTouchStart={onMouseDown}
    />
  );
}
