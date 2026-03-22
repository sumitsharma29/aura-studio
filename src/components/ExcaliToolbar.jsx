import { motion } from 'framer-motion';
import { 
  MousePointer2, Pencil, Eraser, Type, Minus, 
  ArrowUpRight, Square, Circle, Sparkles, Diamond, PaintBucket
} from 'lucide-react';

const Triangle = ({ size, color = 'currentColor', strokeWidth = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L2 21H22L12 3Z" />
  </svg>
);

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Select', key: 'V' },
  { id: 'pencil', icon: Pencil, label: 'Draw', key: 'P' },
  { id: 'eraser', icon: Eraser, label: 'Erase', key: 'E' },
  { id: 'text', icon: Type, label: 'Text', key: 'T' },
  { id: 'line', icon: Minus, label: 'Line', key: 'L' },
  { id: 'arrow', icon: ArrowUpRight, label: 'Arrow', key: 'A' },
  { id: 'rect', icon: Square, label: 'Rect', key: 'R' },
  { id: 'circle', icon: Circle, label: 'Circle', key: 'O' },
  { id: 'diamond', icon: Diamond, label: 'Diamond', key: 'D' },
  { id: 'triangle', icon: Triangle, label: 'Triangle', key: 'H' },
  { id: 'paint', icon: PaintBucket, label: 'Paint', key: 'B' },
  { id: 'magic', icon: Sparkles, label: 'Magic', key: 'M' },
];

export const ExcaliToolbar = ({ currentTool, setCurrentTool }) => {
  return (
    <motion.div 
      initial={{ y: 100, x: '-50%', opacity: 0 }}
      animate={{ y: 0, x: '-50%', opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="excali-toolbar nebula-glass"
    >
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = currentTool === tool.id;

        return (
          <motion.button
            key={tool.id}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`ex-btn ${isActive ? 'active active-glow' : ''}`}
            onClick={() => setCurrentTool(tool.id)}
            title={`${tool.label} (${tool.key})`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            <span className="tool-label">{tool.label}</span>
            {isActive && (
              <motion.div 
                layoutId="active-pill"
                className="active-indicator"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </motion.div>
  );
};
