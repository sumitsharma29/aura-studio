export const PropertiesPanel = ({ 
  brushSize, setBrushSize,
  brushOpacity, setBrushOpacity,
  primaryColor, setPrimaryColor,
  secondaryColor, setSecondaryColor,
  isFilledShape, setIsFilledShape
}) => {
  const commonColors = [
    '#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', 
    '#22b14c', '#00a2e8', '#3f48cc', '#a349a4', '#ffffff', '#c3c3c3', 
    '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', 
    '#7092be', '#c8bfe7'
  ];

  return (
    <aside className="properties-panel">
      <div className="prop-section">
        <label>Size: {brushSize}px</label>
        <input 
          type="range" 
          min="1" max="50" 
          value={brushSize} 
          onChange={(e) => setBrushSize(Number(e.target.value))} 
        />
      </div>

      <div className="prop-section">
        <label>Opacity: {Math.round(brushOpacity * 100)}%</label>
        <input 
          type="range" 
          min="0.1" max="1" step="0.1"
          value={brushOpacity} 
          onChange={(e) => setBrushOpacity(Number(e.target.value))} 
        />
      </div>

      <div className="prop-section">
        <label className="checkbox-label">
          <input 
            type="checkbox" 
            checked={isFilledShape} 
            onChange={(e) => setIsFilledShape(e.target.checked)} 
          />
          Fill Shapes
        </label>
      </div>

      <div className="prop-section colors-section">
        <h4>Colors</h4>
        <div className="active-colors">
          <div className="color-box-container">
            <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} id="primaryColor" />
            <label htmlFor="primaryColor">Color 1</label>
          </div>
          <div className="color-box-container secondary">
             <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} id="secondaryColor" />
             <label htmlFor="secondaryColor">Color 2</label>
          </div>
        </div>

        <div className="palette">
           {commonColors.map(c => (
             <div 
               key={c} 
               className="palette-color" 
               style={{ backgroundColor: c }}
               onClick={() => setPrimaryColor(c)}
               onContextMenu={(e) => { e.preventDefault(); setSecondaryColor(c); }}
             />
           ))}
        </div>
      </div>
    </aside>
  );
};
