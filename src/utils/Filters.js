export const applyFilter = (context, filterType) => {
  const canvas = context.canvas;
  const cw = canvas.width;
  const ch = canvas.height;
  const imageData = context.getImageData(0, 0, cw, ch);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    switch (filterType) {
      case 'grayscale':
        const gray = 0.3 * r + 0.59 * g + 0.11 * b;
        data[i] = data[i+1] = data[i+2] = gray;
        break;
      case 'invert':
        data[i] = 255 - r;
        data[i+1] = 255 - g;
        data[i+2] = 255 - b;
        break;
      case 'sepia':
        data[i] = Math.min(255, (r * .393) + (g * .769) + (b * .189));
        data[i+1] = Math.min(255, (r * .349) + (g * .686) + (b * .168));
        data[i+2] = Math.min(255, (r * .272) + (g * .534) + (b * .131));
        break;
    }
  }

  if (filterType === 'blur') {
    // Basic fast box blur
    const passes = 2;
    const w = cw;
    const h = ch;
    // Just delegating to canvas context native filter is much faster and world-class
    context.filter = 'blur(4px)';
    context.drawImage(canvas, 0, 0);
    context.filter = 'none';
    return;
  }

  context.putImageData(imageData, 0, 0);
};
