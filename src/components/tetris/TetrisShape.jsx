import React from 'react';
import { cn } from '@/lib/utils';

/**
 * TetrisShape - צורות טטריס מ-Figma
 * Renders the exact Figma-exported tetris shapes with configurable color and size.
 * These are the user's custom tetris shapes (I, J, L, O, S, T, Z).
 *
 * @param {'I'|'J'|'L'|'O'|'S'|'T'|'Z'} type - Shape type
 * @param {string} color - Fill color (hex or CSS color)
 * @param {number} size - Pixel size of each individual cell/cube (uniform across all shape types)
 * @param {string} className - Additional CSS classes
 */

const shapeData = {
  I: {
    viewBox: '0 0 16 70',
    rects: [
      { x: 0, y: 0 },
      { x: 0, y: 17.7273 },
      { x: 0, y: 35.4546 },
      { x: 0, y: 53.1819 },
    ],
    cellSize: 15.9091,
    aspect: 16 / 70,
  },
  J: {
    viewBox: '0 0 34 52',
    rects: [
      { x: 17.7273, y: 0 },
      { x: 17.7273, y: 17.7273 },
      { x: 17.7273, y: 35.4546 },
      { x: 0, y: 35.4546 },
    ],
    cellSize: 15.9091,
    aspect: 34 / 52,
  },
  L: {
    viewBox: '0 0 34 52',
    rects: [
      { x: 0, y: 0 },
      { x: 0, y: 17.7273 },
      { x: 0, y: 35.4546 },
      { x: 17.7273, y: 35.4546 },
    ],
    cellSize: 15.9091,
    aspect: 34 / 52,
  },
  O: {
    viewBox: '0 0 34 34',
    rects: [
      { x: 0, y: 0 },
      { x: 17.7273, y: 0 },
      { x: 0, y: 17.7273 },
      { x: 17.7273, y: 17.7273 },
    ],
    cellSize: 15.9091,
    aspect: 1,
  },
  S: {
    viewBox: '0 0 52 34',
    rects: [
      { x: 17.7273, y: 0 },
      { x: 35.4546, y: 0 },
      { x: 0, y: 17.7273 },
      { x: 17.7273, y: 17.7273 },
    ],
    cellSize: 15.9091,
    aspect: 52 / 34,
  },
  T: {
    viewBox: '0 0 52 34',
    rects: [
      { x: 0, y: 17.7273 },
      { x: 17.7273, y: 0 },
      { x: 17.7273, y: 17.7273 },
      { x: 35.4546, y: 17.7273 },
    ],
    cellSize: 15.9091,
    aspect: 52 / 34,
  },
  Z: {
    viewBox: '0 0 52 34',
    rects: [
      { x: 0, y: 0 },
      { x: 17.7273, y: 0 },
      { x: 17.7273, y: 17.7273 },
      { x: 35.4546, y: 17.7273 },
    ],
    cellSize: 15.9091,
    aspect: 52 / 34,
  },
};

const colorMap = {
  purple: '#7D53FA',
  green: '#36EF79',
  orange: '#FD982E',
  pink: '#F9A8D4',
  yellow: '#FDE047',
  blue: '#93C5FD',
  cyan: '#67E8F9',
};

const TetrisShape = ({
  type = 'T',
  color = 'purple',
  size = 14,
  className,
  style,
  ...props
}) => {
  const shape = shapeData[type] || shapeData.T;
  const fillColor = colorMap[color] || color;

  // size = pixel size of each individual cell/cube
  // This ensures all shapes have identically sized cubes regardless of shape type
  const CELL_UNIT = 15.9091;
  const scale = size / CELL_UNIT;
  const [, , vbW, vbH] = shape.viewBox.split(' ').map(Number);
  const width = Math.round(vbW * scale);
  const height = Math.round(vbH * scale);

  return (
    <svg
      width={width}
      height={height}
      viewBox={shape.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('tetris-shape', className)}
      style={style}
      aria-hidden="true"
      {...props}
    >
      {shape.rects.map((rect, i) => (
        <rect
          key={i}
          x={rect.x}
          y={rect.y}
          width={shape.cellSize}
          height={shape.cellSize}
          fill={fillColor}
        />
      ))}
    </svg>
  );
};

export default TetrisShape;
