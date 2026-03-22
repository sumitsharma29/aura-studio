import { 
  SquareDashed, Scissors, Copy, ClipboardPaste, RotateCw, Type, 
  Pencil, Eraser, PaintBucket, Pipette, Search, Brush, 
  Minus, Square, Circle, Triangle, MousePointer2, Layers, 
  FlipHorizontal, FlipVertical
} from 'lucide-react';

export const Ribbon = ({ 
  currentTool, setCurrentTool, 
  primaryColor, secondaryColor, 
  setPrimaryColor, setSecondaryColor,
  executeFilter, toggleLayers
}) => {
  const toolsGrid1 = [
    { id: 'pencil', icon: <Pencil size={18} />, label: 'Pencil' },
    { id: 'fill', icon: <PaintBucket size={18} />, label: 'Fill' },
    { id: 'text', icon: <Type size={18} />, label: 'Text' },
  ];
  const toolsGrid2 = [
    { id: 'eraser', icon: <Eraser size={18} />, label: 'Eraser' },
    { id: 'picker', icon: <Pipette size={18} />, label: 'Picker' },
    { id: 'zoom', icon: <Search size={18} />, label: 'Zoom' },
  ];

  const shapes = [
    { id: 'line', icon: <Minus size={16}/> },
    { id: 'rect', icon: <Square size={16}/> },
    { id: 'circle', icon: <Circle size={16}/> },
    { id: 'triangle', icon: <Triangle size={16}/> },
    { id: 'arrow', icon: <MousePointer2 size={16} className="rotate-90"/> },
    { id: 'rounded_rect', icon: <Square size={16} rx={4}/> }
  ];

  const baseColorsRow1 = ['#000000', '#7f7f7f', '#880015', '#ed1c24', '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc', '#a349a4'];
  const baseColorsRow2 = ['#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0', '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'];
  const baseColorsRow3 = ['#1C1C1C', '#4A4A4A', '#591616', '#721215', '#8C4312', '#8C8213', '#115C26', '#105B85', '#1B2668', '#542256'];

  return (
    <div className="ribbon">
      <div className="ribbon-section">
        <div className="ribbon-content">
          <button className="btn btn-large"><SquareDashed size={24}/><span>Select</span></button>
        </div>
        <span className="ribbon-section-title">Selection</span>
      </div>

      <div className="ribbon-section">
        <div className="ribbon-content">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button className="btn btn-small" title="Blur" onClick={() => executeFilter('blur')}>Blur</button>
            <button className="btn btn-small" title="Grayscale" onClick={() => executeFilter('grayscale')}>B&amp;W</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button className="btn btn-small" title="Sepia" onClick={() => executeFilter('sepia')}>Sepia</button>
            <button className="btn btn-small" title="Invert" onClick={() => executeFilter('invert')}>Invert</button>
          </div>
        </div>
        <span className="ribbon-section-title">Filters</span>
      </div>

      <div className="ribbon-section">
        <div className="ribbon-content">
          <div className="ribbon-grid">
            {toolsGrid1.map(t => (
              <button key={t.id} className={`btn btn-small ${currentTool === t.id ? 'active' : ''}`} onClick={() => setCurrentTool(t.id)} title={t.label}>{t.icon}</button>
            ))}
            {toolsGrid2.map(t => (
              <button key={t.id} className={`btn btn-small ${currentTool === t.id ? 'active' : ''}`} onClick={() => setCurrentTool(t.id)} title={t.label}>{t.icon}</button>
            ))}
          </div>
        </div>
        <span className="ribbon-section-title">Tools</span>
      </div>

      <div className="ribbon-section">
        <div className="ribbon-content">
          <button className={`btn btn-large ${currentTool === 'brush' ? 'active' : ''}`} onClick={() => setCurrentTool('brush')}>
            <Brush size={24}/><span>Brushes</span>
          </button>
        </div>
        <span className="ribbon-section-title">Brushes</span>
      </div>

      <div className="ribbon-section">
        <div className="ribbon-content">
          <div className="ribbon-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
            {shapes.map(s => (
              <button key={s.id} className={`btn btn-small ${currentTool === s.id ? 'active' : ''}`} onClick={() => setCurrentTool(s.id)}>
                {s.icon}
              </button>
            ))}
          </div>
        </div>
        <span className="ribbon-section-title">Shapes</span>
      </div>

      <div className="ribbon-section">
        <div className="ribbon-content">
          <div className="active-color-slots">
            <div className="color-slot active"><div className="color-slot-inner" style={{backgroundColor: primaryColor}}></div></div>
            <div className="color-slot"><div className="color-slot-inner" style={{backgroundColor: secondaryColor}}></div></div>
          </div>
          <div className="colors-grid">
            {[...baseColorsRow1, ...baseColorsRow2, ...baseColorsRow3].map((c, i) => (
              <div 
                key={i} className="color-circle" style={{backgroundColor: c}}
                onClick={() => setPrimaryColor(c)} onContextMenu={e => { e.preventDefault(); setSecondaryColor(c); }}
              />
            ))}
          </div>
        </div>
        <span className="ribbon-section-title">Colours</span>
      </div>

      <div className="ribbon-section">
        <div className="ribbon-content">
          <button className="btn btn-large" onClick={toggleLayers}><Layers size={24}/><span>Layers</span></button>
        </div>
      </div>
    </div>
  );
};
