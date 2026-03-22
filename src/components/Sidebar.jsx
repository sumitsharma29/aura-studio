import { 
  Pencil, Brush, Eraser, PaintBucket, Pipette, 
  Minus, Square, Circle, Triangle, MousePointer2 
} from 'lucide-react';

export const Sidebar = ({ currentTool, setCurrentTool }) => {
  const tools = [
    { id: 'pencil', icon: <Pencil size={20} />, label: 'Pencil' },
    { id: 'brush', icon: <Brush size={20} />, label: 'Brush' },
    { id: 'spray', icon: <div className="dot-icon"></div>, label: 'Spray' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' },
    { id: 'fill', icon: <PaintBucket size={20} />, label: 'Fill' },
    { id: 'picker', icon: <Pipette size={20} />, label: 'Color Picker' },
    { id: 'line', icon: <Minus size={20} />, label: 'Line' },
    { id: 'rect', icon: <Square size={20} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
    { id: 'triangle', icon: <Triangle size={20} />, label: 'Triangle' },
    { id: 'arrow', icon: <MousePointer2 size={20} className="rotate-90" />, label: 'Arrow' },
  ];

  return (
    <aside className="sidebar">
      <div className="tools-grid">
        {tools.map(tool => (
          <button
            key={tool.id}
            className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
            onClick={() => setCurrentTool(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </button>
        ))}
      </div>
    </aside>
  );
};
