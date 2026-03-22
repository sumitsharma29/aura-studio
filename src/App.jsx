import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, Trash2, Undo2, Redo2,
  Sun, Moon, LayoutGrid, Sparkles,
  Share2, X, FileImage, File,
  Copy, Check, ExternalLink,
  ZoomIn, ZoomOut, Maximize
} from 'lucide-react';
import { useVectorEngine } from './hooks/useVectorEngine';
import { ExcaliToolbar } from './components/ExcaliToolbar';
import { ExcaliProperties } from './components/ExcaliProperties';
import { ExcaliZoom } from './components/ExcaliZoom';
import { AutoDrawBar } from './components/AutoDrawBar';
import { ExcaliTextEditor } from './components/ExcaliTextEditor';
import { AssetLibrary } from './components/AssetLibrary';
import './index.css';

// ─── Share Modal ──────────────────────────────────────────────────────────────
const ShareModal = ({ onClose, canvasRef }) => {
  const [status, setStatus] = useState('');
  const [copied, setCopied] = useState(false);

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) { setStatus('Canvas not ready'); return; }
    const link = document.createElement('a');
    link.download = 'aura-sketch.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    setStatus('✨ PNG Saved!');
  };

  const downloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) { setStatus('Canvas not ready'); return; }
    
    // Create a temporary canvas with a white background for PDF
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.fillStyle = '#ffffff'; // Ensure non-blank background
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    const dataUrl = tempCanvas.toDataURL('image/jpeg', 0.95);
    const html = `<html><head><title>VEXOR Export</title><style>
      body{margin:0;background:#f0f0f0;display:flex;align-items:center;justify-content:center;min-height:100vh;}
      img{max-width:100%;box-shadow:0 0 50px rgba(0,0,0,0.2);background:#fff;}
      @media print{body{background:#fff;}img{box-shadow:none;}}
    </style></head><body><img src="${dataUrl}" onload="setTimeout(()=>{window.print();window.close()},500)"/></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (!win) setStatus('⚠️ Allow pop-ups to export PDF');
    else setStatus('🖨️ Choose "Save as PDF" in print dialog');
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  };

  const copyToClipboard = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.toBlob(async blob => {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setCopied(true); setStatus('✅ Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      });
    } catch { setStatus('⚠️ Copy failed — try downloading instead'); }
  };

  const shareNative = async () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.toBlob(async blob => {
        const file = new File([blob], 'vexor-artwork.png', { type: 'image/png' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: 'VEXOR Artwork', files: [file] });
          setStatus('✅ Shared!');
        } else {
          setStatus('⚠️ Native sharing not supported — use Download instead');
        }
      });
    } catch { setStatus('Sharing cancelled'); }
  };

  return (
    <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="modal-panel"
        initial={{ scale: 0.88, opacity: 0, y: 40 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 40 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title"><Share2 size={18} /> Share & Export</div>
          <button className="icon-btn-rich" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div className="share-grid">
            <button className="share-btn" onClick={downloadPNG}>
              <FileImage size={28} /><span>Download PNG</span><small>High quality image</small>
            </button>
            <button className="share-btn" onClick={downloadPDF}>
              <File size={28} /><span>Export PDF</span><small>Print & save</small>
            </button>
            <button className="share-btn" onClick={copyToClipboard}>
              {copied ? <Check size={28} /> : <Copy size={28} />}
              <span>{copied ? 'Copied!' : 'Copy Image'}</span><small>To clipboard</small>
            </button>
            <button className="share-btn share-btn-accent" onClick={shareNative}>
              <ExternalLink size={28} /><span>Share…</span><small>System share sheet</small>
            </button>
          </div>
          {status && (
            <motion.p className="share-status" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              {status}
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Startup Overlay ──────────────────────────────────────────────────────────

const AuraLogo = ({ size = 32, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#af52de', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#007aff', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#g)" opacity="0.8" />
    <path d="M28 72L50 28L72 72 M36 60L64 60" stroke="white" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StartupOverlay = ({ onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, [onDone]);
  const particles = Array.from({ length: 24 }, (_, i) => i);

  return (
    <motion.div className="startup-overlay"
      exit={{ opacity: 0, scale: 1.04, filter: 'blur(24px)' }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="startup-orb startup-orb-1" />
      <div className="startup-orb startup-orb-2" />
      <div className="startup-orb startup-orb-3" />

      {particles.map(i => (
        <motion.div key={i} className="startup-particle"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.9, 0], scale: [0, 1, 0], x: (Math.random() - 0.5) * 700, y: (Math.random() - 0.5) * 500 }}
          transition={{ duration: 1.8 + Math.random(), delay: Math.random() * 1.4, ease: 'easeOut' }}
          style={{ position: 'absolute', width: 3 + Math.random() * 7, height: 3 + Math.random() * 7, borderRadius: '50%', background: `hsl(${200 + Math.random() * 140}, 90%, 70%)` }}
        />
      ))}

      <div className="startup-content">
        {/* Removal of redundant sparkly icon to ensure single main brand mark */}

        <motion.div className="startup-brand"
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <AuraLogo size={120} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '110px', fontWeight: 900, letterSpacing: '0.15em', background: 'linear-gradient(135deg, #fff 10%, #af52de 50%, #007aff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AURA</span>
            <span className="startup-sub" style={{ fontSize: '32px', marginTop: '-15px' }}>STUDIO</span>
          </div>
        </motion.div>

        <motion.div className="startup-loader"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 2, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />

        <motion.p className="startup-tagline" 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 2.2 }}
        >
          Infinite Vision • Professional Precision
        </motion.p>
      </div>
    </motion.div>
  );
};

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const engine = useVectorEngine();
  const [isLibOpen, setLibOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [isDarkMode, setDarkMode] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const {
    canvasRef, startInteraction, continueInteraction, endInteraction,
    currentTool, setCurrentTool, undo, redo, clearCanvas,
    primaryColor, setPrimaryColor, secondaryColor, setSecondaryColor,
    brushSize, setBrushSize, opacity, setOpacity, isFilledShape, setIsFilledShape,
    selectedIds, alignElements, duplicateElements, deleteElements,
    bringToFront, sendToBack, bringForward, sendBackward,
    autoDrawElement, convertMagicShape, dismissAutoDrawBar,
    camera, setCamera, action,
    addAssetItem, editingText, setEditingText, commitTextEdit,
    textFont, setTextFont, textSize, setTextSize, textBold, setTextBold, textItalic, setTextItalic,
    textAlign, setTextAlign
  } = engine;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') return;
      if (showShare) return;
      if (e.key === 'Escape') { dismissAutoDrawBar?.(); return; }
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo?.(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo?.(); }
      if (e.ctrlKey && e.key === 'Backspace') { e.preventDefault(); deleteElements?.(); }
      const key = e.key.toLowerCase();
      const tools = { v:'select', p:'pencil', m:'magic', e:'eraser', t:'text', l:'line', a:'arrow', r:'rect', o:'circle' };
      if (tools[key]) setCurrentTool(tools[key]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, setCurrentTool, showShare, dismissAutoDrawBar, deleteElements]);

  useEffect(() => { document.body.classList.toggle('dark-mode', isDarkMode); }, [isDarkMode]);

  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'aura-artwork.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const resetZoom = () => setCamera({ x: 0, y: 0, zoom: 1 });

  return (
    <div className={`excali-app ${isDarkMode ? 'dark-mode' : ''}`}>
      <AnimatePresence>
        {showOverlay && <StartupOverlay onDone={() => setShowOverlay(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showShare && <ShareModal onClose={() => setShowShare(false)} canvasRef={canvasRef} />}
      </AnimatePresence>

      {/* Header */}
      <header className="excali-header nebula-glass">
        <div className="header-left">
          <div className="excali-logo">
            <AuraLogo size={32} />
            <div className="logo-text">
              <div className="logo-name-group" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                <span className="logo-main-text" style={{ fontSize: '24px', fontWeight: 900 }}>AURA</span>
                <span className="logo-studio" style={{ fontSize: '12px' }}>STUDIO</span>
              </div>
            </div>
          </div>
        </div>

        <div className="header-center">
          <div className="top-actions">
            <button className="icon-btn-rich" onClick={() => setDarkMode(!isDarkMode)} title="Toggle Dark Mode">
              {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <button className="icon-btn-rich" onClick={() => setLibOpen(!isLibOpen)} title="Asset Library"
              style={{ color: isLibOpen ? 'var(--accent-blue)' : 'inherit' }}>
              <LayoutGrid size={18}/>
            </button>
            <div className="h-divider" />
            <button className="icon-btn-rich" onClick={undo} title="Undo (Ctrl+Z)"><Undo2 size={16} /></button>
            <button className="icon-btn-rich" onClick={redo} title="Redo (Ctrl+Y)"><Redo2 size={16} /></button>
            <div className="h-divider" />
            <button className="hdr-btn" onClick={resetZoom} title="Reset View"><Maximize size={14}/><span>Fit</span></button>
            <button className="hdr-btn hdr-btn-blue" onClick={downloadPNG} title="Save as PNG"><Download size={14}/><span>Download</span></button>
            <button className="hdr-btn hdr-btn-purple" onClick={() => setShowShare(true)} title="Share"><Share2 size={14}/><span>Share</span></button>
            <button className="hdr-btn hdr-btn-red" onClick={clearCanvas} title="Clear canvas"><Trash2 size={14}/><span>Reset</span></button>
          </div>
        </div>
      </header>

      {/* Canvas */}
      <main className="excali-main">
        <canvas
          ref={canvasRef}
          onMouseDown={startInteraction}
          onMouseMove={continueInteraction}
          onMouseUp={endInteraction}
          onMouseLeave={endInteraction}
          style={{ cursor: currentTool === 'select' ? 'default' : currentTool === 'eraser' ? 'cell' : 'crosshair' }}
        />

        {editingText && (
          <ExcaliTextEditor
            x={editingText.x * camera.zoom + camera.x}
            y={editingText.y * camera.zoom + camera.y}
            value={editingText.text}
            fontSize={textSize}
            color={primaryColor}
            font={textFont}
            bold={textBold}
            italic={textItalic}
            textAlign={textAlign}
            onChange={(t) => setEditingText({ ...editingText, text: t })}
            onComplete={() => commitTextEdit(editingText.text)}
            onFontChange={setTextFont}
            onSizeChange={setTextSize}
            onBoldChange={setTextBold}
            onItalicChange={setTextItalic}
            onAlignChange={setTextAlign}
          />
        )}
      </main>

      {/* AutoDraw */}
      <AnimatePresence>
        {autoDrawElement && (
          <AutoDrawBar
            magicElement={autoDrawElement}
            convertMagicShape={convertMagicShape}
            onDismiss={dismissAutoDrawBar}
          />
        )}
      </AnimatePresence>

      {/* Asset Library */}
      <AssetLibrary isOpen={isLibOpen} setOpen={setLibOpen} onAddItem={addAssetItem} />

      {/* Toolbars */}
      <ExcaliToolbar currentTool={currentTool} setCurrentTool={setCurrentTool} />

      <ExcaliProperties
        strokeColor={primaryColor} setStrokeColor={setPrimaryColor}
        backgroundColor={secondaryColor} setBackgroundColor={setSecondaryColor}
        strokeWidth={brushSize} setBrushSize={setBrushSize}
        opacity={opacity} setOpacity={setOpacity}
        isFilledShape={isFilledShape} setIsFilledShape={setIsFilledShape}
        selectedIds={selectedIds} alignElements={alignElements}
        duplicateElements={duplicateElements} deleteElements={deleteElements}
        bringToFront={bringToFront} sendToBack={sendToBack}
        bringForward={bringForward} sendBackward={sendBackward}
      />

      <ExcaliZoom camera={camera} setCamera={setCamera} action={action} />
    </div>
  );
}

export default App;
