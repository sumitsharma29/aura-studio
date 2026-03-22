import { Undo2, Redo2, Download, Upload, Trash2, ZoomIn, ZoomOut, Grid } from 'lucide-react';

export const Toolbar = ({ 
  undo, redo, clearCanvas, downloadImage, handleImageUpload, zoomScale, setZoomScale, toggleGrid 
}) => {
  return (
    <header className="toolbar">
      <div className="toolbar-section">
        <div className="brand">PaintWeb</div>
      </div>
      
      <div className="toolbar-section split">
        <button onClick={undo} title="Undo (Ctrl+Z)"><Undo2 size={20} /></button>
        <button onClick={redo} title="Redo (Ctrl+Y)"><Redo2 size={20} /></button>
        <div className="divider" />
        <button onClick={clearCanvas} title="Clear Canvas" className="danger-text"><Trash2 size={20} /></button>
      </div>

      <div className="toolbar-section split">
        <button onClick={() => setZoomScale(Math.min(zoomScale + 0.2, 3))} title="Zoom In"><ZoomIn size={20} /></button>
        <span className="zoom-level">{Math.round(zoomScale * 100)}%</span>
        <button onClick={() => setZoomScale(Math.max(zoomScale - 0.2, 0.2))} title="Zoom Out"><ZoomOut size={20} /></button>
        <div className="divider" />
        <button onClick={toggleGrid} title="Toggle Grid"><Grid size={20} /></button>
      </div>

      <div className="toolbar-section split">
        <label className="icon-btn" title="Open Image">
          <Upload size={20} />
          <input type="file" accept="image/*" className="hidden-input" onChange={handleImageUpload} />
        </label>
        <button onClick={downloadImage} title="Save Image (Ctrl+S)"><Download size={20} /></button>
      </div>
    </header>
  );
};
