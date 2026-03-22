import { useState, useRef, useCallback, useEffect } from 'react';
import { floodFill } from '../utils/FloodFill';
import { applyFilter } from '../utils/Filters';

export const useDrawing = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pencil');
  const [brushSize, setBrushSize] = useState(3);
  const [brushOpacity, setBrushOpacity] = useState(1);
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [isFilledShape, setIsFilledShape] = useState(false);
  
  const historyRef = useRef([]);
  const historyStepRef = useRef(-1);

  // For smoothing and shapes
  const pointsRef = useRef([]);
  const startPosRef = useRef({ x: 0, y: 0 });
  const snapshotRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { width, height } = canvas.getBoundingClientRect();
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = Math.max(width, 800);
      canvas.height = Math.max(height, 600);
    }
    const context = canvas.getContext('2d', { willReadFrequently: true });
    context.lineCap = 'round';
    context.lineJoin = 'round';
    contextRef.current = context;

    if (historyRef.current.length === 0) {
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      saveHistoryState();
    }
  }, []);

  const saveHistoryState = useCallback(() => {
    if (!canvasRef.current || !contextRef.current) return;
    const canvas = canvasRef.current;
    const data = contextRef.current.getImageData(0, 0, canvas.width, canvas.height);
    const nextStep = historyStepRef.current + 1;
    historyRef.current = historyRef.current.slice(0, nextStep);
    historyRef.current.push(data);
    historyStepRef.current = nextStep;
  }, []);

  const undo = useCallback(() => {
    if (historyStepRef.current > 0) {
      historyStepRef.current -= 1;
      contextRef.current.putImageData(historyRef.current[historyStepRef.current], 0, 0);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyStepRef.current < historyRef.current.length - 1) {
      historyStepRef.current += 1;
      contextRef.current.putImageData(historyRef.current[historyStepRef.current], 0, 0);
    }
  }, []);

  const clearCanvas = () => {
    contextRef.current.fillStyle = secondaryColor;
    contextRef.current.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveHistoryState();
  };

  const executeFilter = (filterType) => {
    applyFilter(contextRef.current, filterType);
    saveHistoryState();
  };

  const getCanvasCoords = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    const isRightClick = e.button === 2;
    const activeColor = isRightClick ? secondaryColor : primaryColor;
    const { x, y } = getCanvasCoords(e);
    
    contextRef.current.strokeStyle = activeColor;
    contextRef.current.fillStyle = activeColor;
    contextRef.current.lineWidth = currentTool === 'eraser' ? brushSize * 3 : brushSize;
    contextRef.current.globalAlpha = brushOpacity;
    
    if (currentTool === 'eraser') contextRef.current.strokeStyle = '#ffffff'; // Erase with white for simplicity right now
    
    if (currentTool === 'fill') {
      floodFill(contextRef.current, Math.floor(x), Math.floor(y), activeColor);
      saveHistoryState();
      return;
    }

    if (currentTool === 'picker') {
      const pixel = contextRef.current.getImageData(x, y, 1, 1).data;
      const hex = '#' + [...pixel].slice(0,3).map(c => c.toString(16).padStart(2, '0')).join('');
      isRightClick ? setSecondaryColor(hex) : setPrimaryColor(hex);
      return;
    }

    snapshotRef.current = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    startPosRef.current = { x, y };
    pointsRef.current = [{ x, y }];
    
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoords(e);
    
    if (['pencil', 'brush', 'eraser'].includes(currentTool)) {
      pointsRef.current.push({ x, y });
      const points = pointsRef.current;
      contextRef.current.putImageData(snapshotRef.current, 0, 0); // Need to render whole line from start for perfect curves
      contextRef.current.beginPath();
      contextRef.current.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i+1].x) / 2;
        const yc = (points[i].y + points[i+1].y) / 2;
        contextRef.current.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      contextRef.current.stroke();
    } 
    else if (currentTool === 'spray') {
      const radius = brushSize * 2;
      for (let i = 0; i < 20; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.random() * radius;
        contextRef.current.fillRect(x + Math.cos(angle) * r, y + Math.sin(angle) * r, 1, 1);
      }
    }
    else {
      // Shapes
      contextRef.current.putImageData(snapshotRef.current, 0, 0);
      contextRef.current.beginPath();
      const startX = startPosRef.current.x, startY = startPosRef.current.y;
      const w = x - startX, h = y - startY;

      if (currentTool === 'line') {
        contextRef.current.moveTo(startX, startY); contextRef.current.lineTo(x, y);
      } else if (currentTool === 'rect') {
        contextRef.current.rect(startX, startY, w, h);
      } else if (currentTool === 'circle') {
        contextRef.current.arc(startX, startY, Math.sqrt(w*w+h*h), 0, 2*Math.PI);
      } else if (currentTool === 'triangle') {
        contextRef.current.moveTo(startX + w/2, startY);
        contextRef.current.lineTo(startX, y); contextRef.current.lineTo(x, y); contextRef.current.closePath();
      }
      isFilledShape ? contextRef.current.fill() : contextRef.current.stroke();
    }
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveHistoryState();
  };

  return {
    canvasRef, startDrawing, draw, finishDrawing,
    currentTool, setCurrentTool, brushSize, setBrushSize,
    brushOpacity, setBrushOpacity, primaryColor, setPrimaryColor,
    secondaryColor, setSecondaryColor, isFilledShape, setIsFilledShape,
    undo, redo, clearCanvas, executeFilter,
    historyStep: historyStepRef.current,
  };
};
