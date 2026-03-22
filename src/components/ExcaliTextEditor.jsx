import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bold, Italic, Type, ChevronDown } from 'lucide-react';

const FONTS = ['Outfit', 'Georgia', 'Courier New', 'Arial', 'Impact', 'Comic Sans MS'];
const SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64];

export const ExcaliTextEditor = ({ x, y, value, onChange, onComplete, fontSize, color, 
  font = 'Outfit', bold = false, italic = false, textAlign = 'left',
  onFontChange, onSizeChange, onBoldChange, onItalicChange, onAlignChange 
}) => {
  const inputRef = useRef(null);
  const committingRef = useRef(false);
  const [showFontMenu, setShowFontMenu] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const handleComplete = () => {
    if (committingRef.current) return;
    committingRef.current = true;
    onComplete();
  };

  const fontStyle = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px "${font}", sans-serif`;

  return (
    <motion.div
      className="text-editor-wrap"
      style={{ left: x, top: y }}
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={e => e.stopPropagation()}
    >
      {/* Formatting Toolbar */}
      <div className="text-format-bar">
        {/* Font picker */}
        <div className="font-picker-wrap" style={{ position: 'relative' }}>
          <button 
            className="fmt-btn font-pick-btn"
            onMouseDown={e => { e.preventDefault(); setShowFontMenu(v => !v); }}
          >
            <Type size={13} /> <span style={{ maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{font}</span> <ChevronDown size={11} />
          </button>
          <AnimatePresence>
            {showFontMenu && (
              <motion.div
                className="font-dropdown"
                initial={{ opacity: 0, y: -4, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.96 }}
                transition={{ duration: 0.12 }}
              >
                {FONTS.map(f => (
                  <button
                    key={f}
                    className={`font-opt ${font === f ? 'active' : ''}`}
                    style={{ fontFamily: f }}
                    onMouseDown={e => { e.preventDefault(); onFontChange?.(f); setShowFontMenu(false); }}
                  >{f}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="fmt-divider" />

        {/* Size selector */}
        <select
          className="fmt-btn size-select"
          value={fontSize}
          onChange={e => onSizeChange?.(parseInt(e.target.value))}
          onMouseDown={e => e.stopPropagation()}
        >
          {SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <div className="fmt-divider" />

        {/* Bold */}
        <button
          className={`fmt-btn ${bold ? 'active' : ''}`}
          onMouseDown={e => { e.preventDefault(); onBoldChange?.(!bold); }}
          title="Bold"
        ><Bold size={14} /></button>

        {/* Italic */}
        <button
          className={`fmt-btn ${italic ? 'active' : ''}`}
          onMouseDown={e => { e.preventDefault(); onItalicChange?.(!italic); }}
          title="Italic"
        ><Italic size={14} /></button>

        <div className="fmt-divider" />

        {/* Alignment */}
        <div className="align-group">
          {['left', 'center', 'right'].map(align => (
            <button
              key={align}
              className={`fmt-btn ${textAlign === align ? 'active' : ''}`}
              onMouseDown={e => { e.preventDefault(); onAlignChange?.(align); }}
              title={`Align ${align}`}
            >
              <div className={`align-icon align-${align}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      <div className="text-input-area">
        <textarea
          ref={inputRef}
          value={value}
          placeholder="Type here…"
          rows={1}
          onChange={e => {
            onChange(e.target.value);
            // Auto-grow
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          onKeyDown={e => {
            e.stopPropagation();
            if (e.key === 'Escape') handleComplete();
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComplete(); }
          }}
          onBlur={e => {
            if (!e.relatedTarget?.closest?.('.text-editor-wrap')) handleComplete();
          }}
          style={{
            fontFamily: `"${font}", sans-serif`,
            fontSize: `${fontSize}px`,
            fontWeight: bold ? 'bold' : 'normal',
            fontStyle: italic ? 'italic' : 'normal',
            color: color || '#1d1d1f',
            lineHeight: 1.4,
            textAlign: textAlign,
          }}
        />
      </div>
      <div className="text-editor-hint">Enter to commit • Shift+Enter for new line • Esc to cancel</div>
    </motion.div>
  );
};
