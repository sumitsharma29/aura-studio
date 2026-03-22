import { forwardRef } from 'react';

export const CanvasArea = forwardRef(({ startDrawing, draw, finishDrawing }, ref) => {
  return (
    <div className="canvas-container">
      <div className="canvas-wrapper">
        <canvas
          ref={ref}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={finishDrawing}
          onMouseOut={finishDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={finishDrawing}
          // Prevent context menu on right click drawing
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>
    </div>
  );
});

CanvasArea.displayName = 'CanvasArea';
