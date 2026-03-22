import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const assets = [
  // Emojis
  { type: 'emoji', emoji: '⭐', label: 'Star' },
  { type: 'emoji', emoji: '❤️', label: 'Heart' },
  { type: 'emoji', emoji: '🔥', label: 'Fire' },
  { type: 'emoji', emoji: '💡', label: 'Idea' },
  { type: 'emoji', emoji: '🚀', label: 'Rocket' },
  { type: 'emoji', emoji: '🎨', label: 'Palette' },
  { type: 'emoji', emoji: '✅', label: 'Check' },
  { type: 'emoji', emoji: '⚡', label: 'Lightning' },
  { type: 'emoji', emoji: '🌈', label: 'Rainbow' },
  { type: 'emoji', emoji: '💎', label: 'Diamond' },
  { type: 'emoji', emoji: '🌊', label: 'Wave' },
  { type: 'emoji', emoji: '🎯', label: 'Target' },
  // Shapes
  { type: 'shape', shapeType: 'rect', color: '#007aff', fill: 'rgba(0,122,255,0.15)', label: 'Blue Rect' },
  { type: 'shape', shapeType: 'circle', color: '#ff3b30', fill: 'rgba(255,59,48,0.15)', label: 'Red Circle' },
  { type: 'shape', shapeType: 'diamond', color: '#a855f7', fill: 'rgba(168,85,247,0.15)', label: 'Purple Diamond' },
  { type: 'shape', shapeType: 'triangle', color: '#34c759', fill: 'rgba(52,199,89,0.15)', label: 'Green Triangle' },
  { type: 'shape', shapeType: 'rect', color: '#ff9500', fill: 'rgba(255,149,0,0.15)', label: 'Orange Rect' },
  { type: 'shape', shapeType: 'circle', color: '#5856d6', fill: 'rgba(88,86,214,0.15)', label: 'Indigo Circle' },
];

const ShapePreview = ({ asset }) => {
  if (asset.type === 'emoji') {
    return <div style={{ fontSize: 26, lineHeight: 1 }}>{asset.emoji}</div>;
  }
  const colors = { rect: asset.color, circle: asset.color, diamond: asset.color, triangle: asset.color };
  const fills = { rect: asset.fill, circle: asset.fill, diamond: asset.fill, triangle: asset.fill };
  const svgMap = {
    rect: <rect x="4" y="4" width="22" height="16" rx="2" />,
    circle: <circle cx="15" cy="13" r="10" />,
    diamond: <polygon points="15,3 26,13 15,23 4,13" />,
    triangle: <polygon points="15,4 26,22 4,22" />,
  };
  return (
    <svg width="30" height="26" viewBox="0 0 30 26" fill={asset.fill || 'transparent'} stroke={asset.color || '#007aff'} strokeWidth="1.5">
      {svgMap[asset.shapeType] || svgMap.rect}
    </svg>
  );
};

export const AssetLibrary = ({ isOpen, setOpen, onAddItem }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="asset-library"
        initial={{ x: -260, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -260, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <div className="lib-header">
          <div>
            <h3>Asset Library</h3>
            <p className="lib-sub">Click any item to add to canvas</p>
          </div>
          <button className="icon-btn-rich" onClick={() => setOpen(false)}><X size={16} /></button>
        </div>

        <div className="lib-section-label">Emojis</div>
        <div className="lib-content">
          {assets.filter(a => a.type === 'emoji').map((a, i) => (
            <button
              key={i}
              className="lib-item"
              onClick={() => { onAddItem(a); setOpen(false); }}
              title={a.label}
            >
              <ShapePreview asset={a} />
            </button>
          ))}
        </div>

        <div className="lib-section-label">Shapes</div>
        <div className="lib-content">
          {assets.filter(a => a.type === 'shape').map((a, i) => (
            <button
              key={i}
              className="lib-item"
              onClick={() => { onAddItem(a); setOpen(false); }}
              title={a.label}
            >
              <ShapePreview asset={a} />
            </button>
          ))}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);
