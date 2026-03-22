/**
 * Flood Fill algorithm to fill an area of pixels with a new color.
 * Works directly on the Canvas API ImageData array for performance.
 */

export const hexToRgba = (hex) => {
  const c = hex.substring(1).split('');
  if (c.length === 3) {
    c.push('FF'); // Add alpha
  } else if (c.length === 6) {
    // Normal hex
  }
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b, a: 255 };
};

const colorsMatch = (data, p, targetColor) => {
  return (
    data[p] === targetColor.r &&
    data[p + 1] === targetColor.g &&
    data[p + 2] === targetColor.b &&
    data[p + 3] === targetColor.a
  );
};

export const floodFill = (context, startX, startY, fillColorHex) => {
  const canvas = context.canvas;
  const cw = canvas.width;
  const ch = canvas.height;
  
  const imageData = context.getImageData(0, 0, cw, ch);
  const data = imageData.data;
  
  const pStart = (startY * cw + startX) * 4;
  const targetColor = {
    r: data[pStart],
    g: data[pStart + 1],
    b: data[pStart + 2],
    a: data[pStart + 3],
  };

  const fillColor = hexToRgba(fillColorHex);

  if (
    targetColor.r === fillColor.r &&
    targetColor.g === fillColor.g &&
    targetColor.b === fillColor.b &&
    targetColor.a === fillColor.a
  ) {
    return; // Already the correct color
  }

  const stack = [[startX, startY]];

  while (stack.length) {
    let [x, y] = stack.pop();
    let p = (y * cw + x) * 4;

    // Move up to the topmost matching pixel
    while (y >= 0 && colorsMatch(data, p, targetColor)) {
      y--;
      p -= cw * 4;
    }

    p += cw * 4;
    y++;

    let reachLeft = false;
    let reachRight = false;

    // Move down coloring pixels
    while (y < ch && colorsMatch(data, p, targetColor)) {
      data[p] = fillColor.r;
      data[p + 1] = fillColor.g;
      data[p + 2] = fillColor.b;
      data[p + 3] = fillColor.a;

      if (x > 0) {
        if (colorsMatch(data, p - 4, targetColor)) {
          if (!reachLeft) {
            stack.push([x - 1, y]);
            reachLeft = true;
          }
        } else if (reachLeft) {
          reachLeft = false;
        }
      }

      if (x < cw - 1) {
        if (colorsMatch(data, p + 4, targetColor)) {
          if (!reachRight) {
            stack.push([x + 1, y]);
            reachRight = true;
          }
        } else if (reachRight) {
          reachRight = false;
        }
      }

      p += cw * 4;
      y++;
    }
  }

  context.putImageData(imageData, 0, 0);
};
