import React from 'react';

export interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

export const QRCodeSVG: React.FC<QRCodeProps> = ({
  value,
  size = 140,
  fgColor = '#EC0E78',
  bgColor = '#FFFFFF',
  className = '',
}) => {
  const matrixSize = 25;
  const modules: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  const addFinderPattern = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const mr = row + r;
        const mc = col + c;
        if (mr >= 0 && mr < matrixSize && mc >= 0 && mc < matrixSize) {
          if (
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          ) {
            modules[mr][mc] = true;
          }
        }
      }
    }
  };

  addFinderPattern(0, 0);
  addFinderPattern(0, matrixSize - 7);
  addFinderPattern(matrixSize - 7, 0);

  for (let i = 8; i < matrixSize - 8; i++) {
    if (i % 2 === 0) {
      modules[6][i] = true;
      modules[i][6] = true;
    }
  }

  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const isTopLeft = r < 8 && c < 8;
      const isTopRight = r < 8 && c >= matrixSize - 8;
      const isBottomLeft = r >= matrixSize - 8 && c < 8;
      const isTiming = r === 6 || c === 6;

      if (!isTopLeft && !isTopRight && !isBottomLeft && !isTiming) {
        const cellHash = (hash + r * 31 + c * 17) ^ (r * c);
        modules[r][c] = Math.abs(cellHash) % 3 !== 0;
      }
    }
  }

  const padding = 2;
  const totalCells = matrixSize + padding * 2;
  const cellSize = size / totalCells;

  const rects: React.ReactNode[] = [];
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (modules[r][c]) {
        const keyStr = `${r}_${c}`;
        rects.push(
          React.createElement('rect', {
            key: keyStr,
            x: (c + padding) * cellSize,
            y: (r + padding) * cellSize,
            width: cellSize + 0.1,
            height: cellSize + 0.1,
            fill: fgColor,
          })
        );
      }
    }
  }

  return React.createElement(
    'div',
    {
      className: `inline-block p-2 bg-white rounded-[12px] shadow-sm ${className}`,
      style: { width: size, height: size },
    },
    React.createElement(
      'svg',
      {
        width: size,
        height: size,
        viewBox: `0 0 ${size} ${size}`,
        xmlns: 'http://www.w3.org/2000/svg',
      },
      React.createElement('rect', {
        width: size,
        height: size,
        fill: bgColor,
        rx: 8,
      }),
      ...rects
    )
  );
};
