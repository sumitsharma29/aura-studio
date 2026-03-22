import { Layers, Eye, Plus, Trash2 } from 'lucide-react';

export const LayersPanel = ({ isOpen, onClose }) => {
  return (
    <div className={`layers-panel ${isOpen ? 'open' : ''}`}>
      <div className="layers-header">
        <h4>Layers</h4>
        <button onClick={onClose} className="close-btn">&times;</button>
      </div>
      <div className="layers-actions">
        <button title="New Layer"><Plus size={16}/></button>
        <button title="Delete Layer"><Trash2 size={16}/></button>
      </div>
      <div className="layers-list">
        <div className="layer-item active">
          <Eye size={16} className="eye-icon"/>
          <div className="layer-thumb"></div>
          <span>Layer 2</span>
        </div>
        <div className="layer-item">
          <Eye size={16} className="eye-icon"/>
          <div className="layer-thumb" style={{background: '#fff'}}></div>
          <span>Background</span>
        </div>
      </div>
    </div>
  );
};
