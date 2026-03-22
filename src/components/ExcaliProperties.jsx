import { motion } from 'framer-motion';
import { 
  Pipette, AlignLeft, AlignCenter, AlignRight, 
  AlignVerticalJustifyStart, AlignVerticalJustifyEnd, Copy, Trash2, 
  BringToFront, SendToBack, Sparkles, Move,
  Palette as PaletteIcon
} from 'lucide-react';

export const ExcaliProperties = ({ 
  strokeColor, setStrokeColor, 
  backgroundColor, setBackgroundColor,
  strokeWidth, setBrushSize,
  opacity, setOpacity,
  isFilledShape, setIsFilledShape,
  selectedIds, alignElements, duplicateElements, deleteElements,
  bringToFront, sendToBack, bringForward, sendBackward
}) => {
  const palette = [
    '#000000', '#1c1c1e', '#3a3a3c', '#8e8e93', '#d1d1d6', '#ffffff',
    '#007aff', '#ff3b30', '#34c759', '#ff9500', '#5856d6', '#af52de'
  ];

  return (
    <motion.div 
      className="excali-properties nebula-glass"
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div className="prop-group">
        <label className="prop-label">{selectedIds.length > 0 ? 'EDIT SELECTION' : 'GLOBAL STYLE'}</label>
      </div>
      <div className="prop-group">
        <label className="prop-label">OUTLINE / STROKE</label>
        <div className="color-grid">
          {palette.map(c => (
            <div 
              key={c} className={`ex-color ${strokeColor === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => setStrokeColor(c)}
            />
          ))}
          <div className="ex-color-custom">
            <PaletteIcon size={14} />
            <input type="color" value={strokeColor} onChange={(e) => setStrokeColor(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="prop-group">
        <label className="prop-label">FILL / BACKGROUND</label>
        <div className="color-grid">
          {palette.map(c => (
            <div 
              key={c} className={`ex-color ${backgroundColor === c ? 'active' : ''}`}
              style={{ background: c }}
              onClick={() => {
                 setBackgroundColor(c);
                 setIsFilledShape(true);
              }}
            />
          ))}
          <div className="ex-color ex-color-custom">
            <Pipette size={14} color={backgroundColor} />
            <input type="color" value={backgroundColor === 'transparent' ? '#ffffff' : backgroundColor} onChange={(e) => {
               setBackgroundColor(e.target.value);
               setIsFilledShape(true);
            }} />
          </div>
          <div 
             className={`ex-color ${!isFilledShape ? 'active' : ''}`}
             style={{ background: 'transparent', border: '1px dashed var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
             onClick={() => setIsFilledShape(false)}
             title="No Fill"
          >
             <Trash2 size={12} color="var(--text-muted)" style={{ margin: 'auto' }} />
          </div>
        </div>
      </div>

      <div className="prop-group">
        <label className="prop-label">STROKE WIDTH: {strokeWidth}px</label>
        <div className="slider-container">
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={strokeWidth} 
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="nebula-slider"
          />
        </div>
      </div>

      <div className="prop-group">
        <label className="prop-label">OPACITY: {Math.round(opacity * 100)}%</label>
        <div className="slider-container">
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={opacity} 
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="nebula-slider"
          />
        </div>
      </div>

      {selectedIds.length > 0 && (
        <div className="prop-group border-top">
          <label className="prop-label">ARRANGEMENT</label>
          <div className="layout-hud">
            <button className="layout-btn" onClick={() => bringToFront()} title="To Front"><BringToFront size={16}/></button>
            <button className="layout-btn" onClick={() => bringForward()} title="Forward">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
            </button>
            <button className="layout-btn" onClick={() => sendBackward()} title="Backward">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <button className="layout-btn" onClick={() => sendToBack()} title="To Back"><SendToBack size={16}/></button>
          </div>
          
          <label className="prop-label" style={{ marginTop: 12 }}>ALIGNMENT</label>
          <div className="layout-hud">
            <button className="layout-btn" onClick={() => alignElements('left')} title="Align Left"><AlignLeft size={16}/></button>
            <button className="layout-btn" onClick={() => alignElements('top')} title="Align Top"><AlignVerticalJustifyStart size={16}/></button>
            <button className="layout-btn" onClick={() => alignElements('right')} title="Align Right"><AlignRight size={16}/></button>
          </div>

          <div className="layout-hud" style={{ marginTop: 12 }}>
            <button className="layout-btn" onClick={() => duplicateElements()} title="Duplicate" style={{ gridColumn: 'span 2' }}>
              <Copy size={16} style={{ marginRight: 8 }}/> <span style={{ fontSize: 11, fontWeight: 700 }}>DUPLICATE</span>
            </button>
            <button className="layout-btn danger-btn" onClick={() => deleteElements()} title="Delete">
              <Trash2 size={16}/>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
