import { Eraser, Pencil } from 'lucide-react';

export const FloatingSizeSlider = ({ brushSize, setBrushSize, currentTool }) => {
  return (
    <div className="floating-slider">
      <div className="slider-icon">
        {currentTool === 'eraser' ? <Eraser size={18} /> : <Pencil size={18} />}
      </div>
      <input 
        type="range" 
        min="1" 
        max="50" 
        value={brushSize} 
        onChange={(e) => setBrushSize(Number(e.target.value))}
        title={`${brushSize}px`}
      />
    </div>
  );
};
