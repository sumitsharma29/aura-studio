export const distance = (a, b) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

export const getBoundingBox = (element) => {
  if (element.type === 'pencil') {
    const xs = element.points.map(p => p.x);
    const ys = element.points.map(p => p.y);
    return {
      minX: Math.min(...xs), minY: Math.min(...ys),
      maxX: Math.max(...xs), maxY: Math.max(...ys)
    };
  }
  
  const minX = Math.min(element.x, element.x + element.width);
  const maxX = Math.max(element.x, element.x + element.width);
  const minY = Math.min(element.y, element.y + element.height);
  const maxY = Math.max(element.y, element.y + element.height);
  
  return { minX, minY, maxX, maxY };
};

export const hitTest = (element, x, y, zoom = 1) => {
  const padding = 10 / zoom;
  const box = getBoundingBox(element);
  
  return (
    x >= box.minX - padding &&
    x <= box.maxX + padding &&
    y >= box.minY - padding &&
    y <= box.maxY + padding
  );
};

export const resizeElement = (element, handle, dx, dy) => {
  const newEl = { ...element };
  if (element.type === 'pencil') return newEl; // Complex to resize freehand simply, skip for now
  
  switch(handle) {
    case 'se':
      newEl.width += dx;
      newEl.height += dy;
      break;
    case 'sw':
      newEl.width -= dx;
      newEl.height += dy;
      newEl.x += dx;
      break;
    case 'ne':
      newEl.width += dx;
      newEl.height -= dy;
      newEl.y += dy;
      break;
    case 'nw':
      newEl.width -= dx;
      newEl.height -= dy;
      newEl.x += dx;
      newEl.y += dy;
      break;
  }
  return newEl;
};
