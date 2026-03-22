import { motion } from 'framer-motion';
import { Circle, Square, X, Zap } from 'lucide-react';

const Triangle = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L2 21H22L12 3Z" />
  </svg>
);

const Diamond = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.7 12L12 2.7l9.3 9.3-9.3 9.3L2.7 12z" />
  </svg>
);

const suggestions = [
  { type: 'circle', icon: <Circle size={20}/>, label: 'Circle' },
  { type: 'rect', icon: <Square size={20}/>, label: 'Rectangle' },
  { type: 'triangle', icon: <Triangle size={20}/>, label: 'Triangle' },
  { type: 'diamond', icon: <Diamond size={20}/>, label: 'Diamond' },
  { type: 'text', text: '⭐', label: 'Star' },
  { type: 'text', text: '🚗', label: 'Car' },
  { type: 'text', text: '🍎', label: 'Apple' },
  { type: 'text', text: '🏠', label: 'House' },
  { type: 'text', text: '🌸', label: 'Flower' },
];

export const AutoDrawBar = ({ magicElement, convertMagicShape, onDismiss }) => (
  <motion.div
    className="autodraw-bar nebula-glass"
    initial={{ y: -60, opacity: 0, x: '-50%' }}
    animate={{ y: 0, opacity: 1, x: '-50%' }}
    exit={{ y: -60, opacity: 0, x: '-50%' }}
    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
  >
    <Zap size={14} className="autodraw-zap" />
    <span className="autodraw-label">Did you mean?</span>
    <div className="autodraw-suggestions">
      {suggestions.map((s, i) => (
        <motion.button
          key={i}
          whileHover={{ scale: 1.12, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="autodraw-item"
          onClick={() => convertMagicShape(magicElement.id, s.type, s.text)}
          title={s.label}
        >
          {s.icon || <span style={{ fontSize: 20 }}>{s.text}</span>}
          <span className="autodraw-item-label">{s.label}</span>
        </motion.button>
      ))}
    </div>
    <button className="autodraw-close" onClick={onDismiss} title="Dismiss">
      <X size={14} />
    </button>
  </motion.div>
);
