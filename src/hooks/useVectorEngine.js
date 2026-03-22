import { useState, useRef, useEffect, useCallback } from 'react';
import rough from 'roughjs';
import { hitTest } from '../utils/geometry';

export const useVectorEngine = () => {
  const canvasRef = useRef(null);
  const [elements, setElements] = useState([]);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentTool, setCurrentTool] = useState('select');
  const [brushSize, setBrushSize] = useState(3);
  const [primaryColor, setPrimaryColor] = useState('#1d1d1f');
  const [secondaryColor, setSecondaryColor] = useState('transparent');
  const [isFilledShape, setIsFilledShape] = useState(false);
  const [brushStyle, setBrushStyle] = useState('clean');
  const [opacity, setOpacity] = useState(1);
  const [action, setAction] = useState('none');
  const [selectionBox, setSelectionBox] = useState(null);
  const [editingText, setEditingText] = useState(null);
  const [autoDrawElement, setAutoDrawElement] = useState(null);
  const [canvasBackground, setCanvasBackground] = useState('#f8f9fb');
  const [resizingHandle, setResizingHandle] = useState(null);

  // Text formatting state (applied to new text elements)
  const [textFont, setTextFont] = useState('Outfit');
  const [textSize, setTextSize] = useState(24);
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textAlign, setTextAlign] = useState('left'); // left, center, right

  const historyRef = useRef([[]]); 
  const historyStepRef = useRef(0);
  const startPosRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const lastPanPosRef = useRef({ x: 0, y: 0 });

  // Load saved canvas
  useEffect(() => {
    const saved = localStorage.getItem('aura_canvas');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setElements(parsed);
        historyRef.current = [parsed];
      } catch (e) {
        // Try legacy keys
        const keys = ['vexor_canvas', 'aetheris_studio_canvas'];
        for (const k of keys) {
          const old = localStorage.getItem(k);
          if (old) { const p = JSON.parse(old); setElements(p); historyRef.current = [p]; break; }
        }
      }
    }
  }, []);

  // Autosave
  useEffect(() => {
    if (elements.length > 0) {
      localStorage.setItem('aura_canvas', JSON.stringify(elements));
    }
  }, [elements]);

  // ── INFINITE CANVAS: Mouse Wheel ──────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleWheel = (e) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Pinch-to-zoom
        const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        setCamera(cam => {
          const newZoom = Math.min(8, Math.max(0.1, cam.zoom * zoomFactor));
          const zoomRatio = newZoom / cam.zoom;
          return {
            x: mouseX - zoomRatio * (mouseX - cam.x),
            y: mouseY - zoomRatio * (mouseY - cam.y),
            zoom: newZoom
          };
        });
      } else {
        // Pan (scroll)
        setCamera(cam => ({
          ...cam,
          x: cam.x - e.deltaX,
          y: cam.y - e.deltaY
        }));
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  // ── RENDER ────────────────────────────────────────────────────────────────
  const render = useCallback(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w; canvas.height = h;
      }

      ctx.fillStyle = canvasBackground;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(camera.x, camera.y);
      ctx.scale(camera.zoom, camera.zoom);

      const roughCanvas = (rough.default ? rough.default.canvas(canvas) : rough.canvas(canvas));

      elements.forEach(el => {
        if (editingText && editingText.id === el.id) return;
        ctx.globalAlpha = el.opacity ?? 1;
        const roughMode = el.brushStyle || brushStyle;
        const opts = {
          stroke: el.strokeColor || '#1d1d1f',
          strokeWidth: el.strokeWidth || 2,
          roughness: roughMode === 'sketchy' ? 1.5 : 0,
          bowing: roughMode === 'sketchy' ? 1 : 0
        };
        if (el.fillColor && el.fillColor !== 'transparent') {
          opts.fill = el.fillColor;
          opts.fillStyle = roughMode === 'sketchy' ? 'hachure' : 'solid';
        }

        if (el.type === 'pencil' || el.type === 'magic') {
          ctx.beginPath();
          ctx.strokeStyle = el.strokeColor || '#1d1d1f';
          ctx.lineWidth = el.strokeWidth || 2;
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          if (el.points?.length > 0) {
            ctx.moveTo(el.points[0].x, el.points[0].y);
            el.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
          }
        } else if (el.type === 'eraser') {
          ctx.save();
          ctx.globalCompositeOperation = 'destination-out';
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(0,0,0,1)';
          ctx.lineWidth = (el.strokeWidth || 3) * 5;
          ctx.lineCap = 'round'; ctx.lineJoin = 'round';
          if (el.points?.length > 0) {
            ctx.moveTo(el.points[0].x, el.points[0].y);
            el.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.stroke();
          }
          ctx.restore();
        } else if (el.type === 'rect') {
          roughCanvas.rectangle(el.x, el.y, el.width || 80, el.height || 60, opts);
        } else if (el.type === 'circle') {
          const r = Math.sqrt((el.width || 60) ** 2 + (el.height || 60) ** 2);
          roughCanvas.circle(el.x, el.y, r * 2, opts);
        } else if (el.type === 'line') {
          roughCanvas.line(el.x, el.y, el.x + (el.width || 100), el.y + (el.height || 0), opts);
        } else if (el.type === 'arrow') {
          const x2 = el.x + (el.width || 100), y2 = el.y + (el.height || 0);
          roughCanvas.line(el.x, el.y, x2, y2, opts);
          const angle = Math.atan2(y2 - el.y, x2 - el.x);
          const hd = 16;
          roughCanvas.line(x2, y2, x2 - hd * Math.cos(angle - Math.PI / 6), y2 - hd * Math.sin(angle - Math.PI / 6), opts);
          roughCanvas.line(x2, y2, x2 - hd * Math.cos(angle + Math.PI / 6), y2 - hd * Math.sin(angle + Math.PI / 6), opts);
        } else if (el.type === 'triangle') {
          const w = el.width || 80, h = el.height || 80;
          roughCanvas.polygon([[el.x + w/2, el.y], [el.x, el.y + h], [el.x + w, el.y + h]], opts);
        } else if (el.type === 'diamond') {
          const w = el.width || 80, h = el.height || 80;
          roughCanvas.polygon([[el.x + w/2, el.y], [el.x + w, el.y + h/2], [el.x + w/2, el.y + h], [el.x, el.y + h/2]], opts);
        } else if (el.type === 'text') {
          const weight = el.bold ? 'bold' : 'normal';
          const style = el.italic ? 'italic' : 'normal';
          const font = el.fontFamily || 'Outfit';
          const size = el.fontSize || 22;
          ctx.font = `${style} ${weight} ${size}px "${font}", sans-serif`;
          ctx.fillStyle = el.strokeColor || '#1d1d1f';
          ctx.textAlign = el.textAlign || 'left';
          ctx.textBaseline = 'top';
          // Render multi-line text
          const lines = (el.text || '').split('\n');
          const lineHeight = size * 1.4;
          lines.forEach((line, i) => {
            let lx = el.x;
            if (ctx.textAlign === 'center') lx += (el.width || 0) / 2;
            else if (ctx.textAlign === 'right') lx += (el.width || 0);
            ctx.fillText(line, lx, el.y + i * lineHeight);
          });
          // Draw selection highlight
          if (selectedIds.includes(el.id)) {
            const maxWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
            ctx.strokeStyle = '#007aff';
            ctx.lineWidth = 1 / camera.zoom;
            ctx.setLineDash([4 / camera.zoom, 4 / camera.zoom]);
            ctx.strokeRect(el.x - 4, el.y - 4, maxWidth + 8, lines.length * size * 1.4 + 8);
            ctx.setLineDash([]);
          }
        } else if (el.type === 'asset-shape') {
          // Draw a predefined shape asset
          const w = el.width || 60, h = el.height || 60;
          roughCanvas.rectangle(el.x, el.y, w, h, { ...opts, fill: el.fillColor || '#007aff', fillStyle: 'solid' });
          ctx.font = `bold ${Math.min(w, h) * 0.5}px sans-serif`;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = '#fff';
          ctx.fillText(el.emoji || '★', el.x + w/2, el.y + h/2);
          ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        }

        ctx.globalAlpha = 1;

        // Draw selection handles for single selection
        if (selectedIds.length === 1 && selectedIds[0] === el.id && !['pencil', 'magic', 'eraser'].includes(el.type)) {
          const handles = getResizeHandles(el);
          ctx.fillStyle = '#fff';
          ctx.strokeStyle = '#007aff';
          ctx.lineWidth = 1.5 / camera.zoom;
          Object.values(handles).forEach(h => {
            ctx.beginPath();
            ctx.rect(h.x, h.y, h.size, h.size);
            ctx.fill();
            ctx.stroke();
          });
        }
      });

      if (selectionBox) {
        ctx.strokeStyle = '#007aff'; ctx.lineWidth = 1 / camera.zoom; ctx.setLineDash([5 / camera.zoom, 5 / camera.zoom]);
        ctx.strokeRect(selectionBox.x, selectionBox.y, selectionBox.width, selectionBox.height);
        ctx.setLineDash([]);
      }

      ctx.restore();
    } catch (e) { console.error('Render error:', e); }
  }, [elements, camera, selectionBox, editingText, selectedIds, brushStyle]);

  useEffect(() => { render(); }, [render]);

  const saveHistory = (newArr) => {
    historyRef.current = historyRef.current.slice(0, historyStepRef.current + 1);
    historyRef.current.push(newArr);
    historyStepRef.current++;
  };

  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - camera.x) / camera.zoom,
      y: (e.clientY - rect.top - camera.y) / camera.zoom
    };
  };

  const startInteraction = (e) => {
    const { x, y } = getCanvasPos(e);
    startPosRef.current = { x, y };

    // Update cursor for handles
    if (currentTool === 'select' && selectedIds.length === 1) {
      const el = elements.find(e => e.id === selectedIds[0]);
      if (el && !['pencil', 'magic', 'eraser'].includes(el.type)) {
        const handles = getResizeHandles(el);
        let found = false;
        for (const [key, h] of Object.entries(handles)) {
          if (x >= h.x && x <= h.x + h.size && y >= h.y && y <= h.y + h.size) {
            const cursors = { n:'ns-resize', s:'ns-resize', e:'ew-resize', w:'ew-resize', nw:'nwse-resize', se:'nwse-resize', ne:'nesw-resize', sw:'nesw-resize' };
            canvasRef.current.style.cursor = cursors[key];
            found = true; break;
          }
        }
        if (!found) canvasRef.current.style.cursor = 'default';
      }
    }

    if (currentTool === 'paint') {
      const hit = [...elements].reverse().find(el => hitTest(el, x, y, camera.zoom));
      const paintColor = (secondaryColor && secondaryColor !== 'transparent') ? secondaryColor : primaryColor;
      
      if (hit) {
        // Power Feature: If hit is part of a multi-selection, fill all selected
        if (selectedIds.includes(hit.id) && selectedIds.length > 1) {
          setElements(elements.map(el => selectedIds.includes(el.id) ? { ...el, fillColor: paintColor } : el));
        } else {
          setElements(elements.map(el => el.id === hit.id ? { ...el, fillColor: paintColor } : el));
        }
        saveHistory(elements);
      } else {
        setCanvasBackground(paintColor);
      }
      return;
    }

    // Middle mouse / Space+drag = pan
    if (e.button === 1 || e.button === 2) {
      isPanningRef.current = true;
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (currentTool === 'select') {
      // Check handles first
      if (selectedIds.length === 1) {
        const el = elements.find(e => e.id === selectedIds[0]);
        if (el && !['pencil', 'magic', 'eraser'].includes(el.type)) {
          const handles = getResizeHandles(el);
          for (const [key, h] of Object.entries(handles)) {
            if (x >= h.x && x <= h.x + h.size && y >= h.y && y <= h.y + h.size) {
              setAction('resizing');
              setResizingHandle(key);
              return;
            }
          }
        }
      }

      const hit = [...elements].reverse().find(el => hitTest(el, x, y, camera.zoom));
      if (hit) {
        if (!selectedIds.includes(hit.id)) setSelectedIds([hit.id]);
        setAction('moving');
      } else {
        setSelectedIds([]); setAction('selecting');
      }
    } else if (currentTool === 'text') {
      const id = Date.now().toString();
      setEditingText({ id, x, y, text: '', textAlign });
    } else {
      setAction('drawing');
      const id = Date.now().toString();
      const newEl = {
        id, type: currentTool, x, y, width: 0, height: 0,
        strokeColor: primaryColor, strokeWidth: brushSize,
        fillColor: isFilledShape ? secondaryColor : 'transparent',
        brushStyle, opacity, points: [{ x, y }]
      };
      setElements(prev => [...prev, newEl]);
    }
  };

  const continueInteraction = (e) => {
    if (isPanningRef.current) {
      const dx = e.clientX - lastPanPosRef.current.x;
      const dy = e.clientY - lastPanPosRef.current.y;
      setCamera(cam => ({ ...cam, x: cam.x + dx, y: cam.y + dy }));
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }
    if (action === 'none') return;
    const { x, y } = getCanvasPos(e);

    if (action === 'drawing') {
      setElements(prev => {
        const arr = [...prev];
        const el = arr[arr.length - 1];
        if (!el) return arr;
        if (['pencil', 'magic', 'eraser'].includes(currentTool)) {
          el.points = [...(el.points || []), { x, y }];
        } else {
          el.width = x - el.x; el.height = y - el.y;
        }
        return arr;
      });
    } else if (action === 'moving') {
      const dx = x - startPosRef.current.x;
      const dy = y - startPosRef.current.y;
      setElements(prev => prev.map(el =>
        selectedIds.includes(el.id)
          ? { ...el, x: (el.x || 0) + dx, y: (el.y || 0) + dy, points: el.points?.map(p => ({ x: p.x + dx, y: p.y + dy })) }
          : el
      ));
      startPosRef.current = { x, y };
    } else if (action === 'selecting') {
      const box = { x: Math.min(x, startPosRef.current.x), y: Math.min(y, startPosRef.current.y), width: Math.abs(x - startPosRef.current.x), height: Math.abs(y - startPosRef.current.y) };
      setSelectionBox(box);
      setSelectedIds(elements.filter(el => {
        const ex = el.x ?? el.points?.[0]?.x ?? 0;
        const ey = el.y ?? el.points?.[0]?.y ?? 0;
        return ex >= box.x && ex <= box.x + box.width && ey >= box.y && ey <= box.y + box.height;
      }).map(el => el.id));
    } else if (action === 'resizing') {
      const id = selectedIds[0];
      setElements(prev => prev.map(el => {
        if (el.id !== id) return el;
        let { x: ex, y: ey, width: ew, height: eh } = el;
        const dx = x - startPosRef.current.x;
        const dy = y - startPosRef.current.y;

        // Apply changes
        if (resizingHandle.includes('e')) ew += dx;
        if (resizingHandle.includes('s')) eh += dy;
        if (resizingHandle.includes('w')) { ex += dx; ew -= dx; }
        if (resizingHandle.includes('n')) { ey += dy; eh -= dy; }

        // Text scaling logic
        if (el.type === 'text') {
           if (resizingHandle.length === 2) {
             // Corner drag scales font size
             const scale = Math.max(0.1, resizingHandle.includes('e') ? (ew / (el.width || 1)) : (ew / (el.width || 1)));
             const newFontSize = Math.max(8, Math.round((el.fontSize || 24) * (ew / (el.width || 1))));
             return { ...el, x: ex, y: ey, width: ew, height: eh, fontSize: newFontSize };
           }
        }

        return { ...el, x: ex, y: ey, width: Math.abs(ew) > 5 ? ew : el.width, height: Math.abs(eh) > 5 ? eh : el.height };
      }));
      startPosRef.current = { x, y };
    }
  };

  const endInteraction = (e) => {
    if (isPanningRef.current) { isPanningRef.current = false; return; }
    if (action !== 'none') saveHistory(elements);
    if (action === 'drawing' && currentTool === 'magic') {
      setAutoDrawElement(elements[elements.length - 1]);
    }
    setAction('none'); setSelectionBox(null); setResizingHandle(null);
  };

  const commitTextEdit = (t) => {
    if (!t || t.trim() === '') { setEditingText(null); return; }
    const isNew = !elements.find(e => e.id === editingText.id);
    let updated;
    if (isNew) {
      const newEl = {
        id: editingText.id, type: 'text',
        x: editingText.x, y: editingText.y,
        width: 0, height: 0, text: t,
        strokeColor: primaryColor, strokeWidth: brushSize,
        fillColor: 'transparent', opacity,
        fontSize: textSize, fontFamily: textFont,
        bold: textBold, italic: textItalic, textAlign: editingText.textAlign || textAlign
      };
      updated = [...elements, newEl];
    } else {
      updated = elements.map(e => e.id === editingText.id ? { ...e, text: t } : e);
    }
    setElements(updated); saveHistory(updated); setEditingText(null);
  };

  const addAssetItem = (assetDef) => {
    // assetDef: { type, emoji, color, label }
    const cx = (canvasRef.current?.width / 2 - camera.x) / camera.zoom;
    const cy = (canvasRef.current?.height / 2 - camera.y) / camera.zoom;
    let el;
    if (assetDef.type === 'emoji') {
      el = { id: Date.now().toString(), type: 'text', text: assetDef.emoji, x: cx - 20, y: cy - 20, fontSize: 48, strokeColor: '#000', opacity: 1, fontFamily: 'Outfit' };
    } else {
      el = {
        id: Date.now().toString(), type: assetDef.shapeType || 'rect',
        x: cx - 40, y: cy - 40, width: 80, height: 80,
        strokeColor: assetDef.color || primaryColor, strokeWidth: 2,
        fillColor: assetDef.fill || 'transparent', opacity: 1, brushStyle: 'clean'
      };
    }
    const updated = [...elements, el];
    setElements(updated); saveHistory(updated);
  };

  return {
    canvasRef, elements, camera, setCamera, selectedIds, setSelectedIds,
    currentTool, setCurrentTool, brushSize, setBrushSize,
    primaryColor, setPrimaryColor, secondaryColor, setSecondaryColor,
    opacity, setOpacity, isFilledShape, setIsFilledShape,
    brushStyle, setBrushStyle, action,
    // text formatting
    textFont, setTextFont, textSize, setTextSize,
    textBold, setTextBold, textItalic, setTextItalic,
    startInteraction, continueInteraction, endInteraction,
    alignElements: (type) => {
      if (selectedIds.length < 2) return;
      const sel = elements.filter(e => selectedIds.includes(e.id));
      let val;
      if (type === 'left') val = Math.min(...sel.map(e => e.x || 0));
      if (type === 'right') val = Math.max(...sel.map(e => (e.x || 0) + (e.width || 0)));
      if (type === 'top') val = Math.min(...sel.map(e => e.y || 0));
      if (type === 'bottom') val = Math.max(...sel.map(e => (e.y || 0) + (e.height || 0)));
      const updated = elements.map(el => {
        if (!selectedIds.includes(el.id)) return el;
        if (type === 'left') return { ...el, x: val };
        if (type === 'right') return { ...el, x: val - (el.width || 0) };
        if (type === 'top') return { ...el, y: val };
        if (type === 'bottom') return { ...el, y: val - (el.height || 0) };
        return el;
      });
      setElements(updated); saveHistory(updated);
    },
    duplicateElements: () => {
      const newItems = elements.filter(e => selectedIds.includes(e.id)).map(e => ({
        ...e, id: Date.now().toString() + Math.random(),
        x: (e.x || 0) + 24, y: (e.y || 0) + 24,
        points: e.points?.map(p => ({ x: p.x + 24, y: p.y + 24 }))
      }));
      const updated = [...elements, ...newItems]; setElements(updated); saveHistory(updated);
    },
    deleteElements: () => { const u = elements.filter(e => !selectedIds.includes(e.id)); setElements(u); setSelectedIds([]); saveHistory(u); },
    bringToFront: () => { const a = elements.filter(e => !selectedIds.includes(e.id)); const s = elements.filter(e => selectedIds.includes(e.id)); const u = [...a, ...s]; setElements(u); saveHistory(u); },
    sendToBack: () => { const a = elements.filter(e => !selectedIds.includes(e.id)); const s = elements.filter(e => selectedIds.includes(e.id)); const u = [...s, ...a]; setElements(u); saveHistory(u); },
    bringForward: () => { const u = [...elements]; selectedIds.forEach(id => { const i = u.findIndex(e => e.id === id); if (i < u.length - 1) { [u[i], u[i+1]] = [u[i+1], u[i]]; } }); setElements(u); saveHistory(u); },
    sendBackward: () => { const u = [...elements]; selectedIds.forEach(id => { const i = u.findIndex(e => e.id === id); if (i > 0) { [u[i], u[i-1]] = [u[i-1], u[i]]; } }); setElements(u); saveHistory(u); },
    convertMagicShape: (id, type, extraText) => {
      setElements(prev => prev.map(e => e.id === id ? { ...e, type, text: extraText || e.text, points: undefined, width: 100, height: 100 } : e));
      setAutoDrawElement(null);
    },
    dismissAutoDrawBar: () => setAutoDrawElement(null),
    autoDrawElement, editingText, setEditingText, commitTextEdit, addAssetItem,
    undo: () => { if (historyStepRef.current > 0) { historyStepRef.current--; setElements(historyRef.current[historyStepRef.current]); } },
    redo: () => { if (historyStepRef.current < historyRef.current.length - 1) { historyStepRef.current++; setElements(historyRef.current[historyStepRef.current]); } },
    clearCanvas: () => { setElements([]); saveHistory([]); localStorage.removeItem('aura_canvas'); }
  };
};

const getResizeHandles = (el) => {
  const s = 8; // handle size
  const { x, y, width: w, height: h } = el;
  return {
    nw: { x: x - s/2, y: y - s/2, size: s },
    n:  { x: x + w/2 - s/2, y: y - s/2, size: s },
    ne: { x: x + w - s/2, y: y - s/2, size: s },
    e:  { x: x + w - s/2, y: y + h/2 - s/2, size: s },
    se: { x: x + w - s/2, y: y + h - s/2, size: s },
    s:  { x: x + w/2 - s/2, y: y + h - s/2, size: s },
    sw: { x: x - s/2, y: y + h - s/2, size: s },
    w:  { x: x - s/2, y: y + h/2 - s/2, size: s }
  };
};
