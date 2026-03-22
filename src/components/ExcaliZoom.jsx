import { motion } from 'framer-motion';
import { Minus, Plus, Hand } from 'lucide-react';

export const ExcaliZoom = ({ camera, setCamera, action }) => {
  return (
    <motion.div 
      className="excali-zoom"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.2 }}
    >
      <button 
        className="ex-btn no-bg"
        onClick={() => setCamera(c => ({...c, zoom: Math.max(c.zoom - 0.1, 0.1)}))}
      >
        <Minus size={16} />
      </button>
      
      <span className="zoom-text" onClick={() => setCamera(c => ({...c, zoom: 1}))} title="Reset Zoom">
        {Math.round(camera.zoom * 100)}%
      </span>
      
      <button 
        className="ex-btn no-bg"
        onClick={() => setCamera(c => ({...c, zoom: Math.min(c.zoom + 0.1, 3)}))}
      >
        <Plus size={16} />
      </button>

      <div className="v-divider" />

      <button className={`ex-btn no-bg ${action === 'panning' ? 'active' : ''}`} title="Pan">
        <Hand size={16} />
      </button>
    </motion.div>
  );
};
