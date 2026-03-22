import { Crosshair, Maximize } from 'lucide-react';

export const StatusBar = ({ cursorPos, canvasWidth, canvasHeight, zoomScale, setZoomScale }) => {
  return (
    <footer className="status-bar">
      <div className="status-group">
        <div className="status-item">
          <Crosshair size={14} />
          {cursorPos.x}, {cursorPos.y}px
        </div>
        <div className="status-item">
          <Maximize size={14} />
          {canvasWidth} × {canvasHeight}px
        </div>
      </div>
      
      <div className="zoom-controls">
        <span style={{width: '35px', textAlign: 'right'}}>{Math.round(zoomScale * 100)}%</span>
        <input 
          type="range" 
          min="0.1" max="3" step="0.1" 
          value={zoomScale} 
          onChange={(e) => setZoomScale(Number(e.target.value))} 
        />
      </div>
    </footer>
  );
};
