import React from 'react';
import { cn } from '@/lib/utils';

/**
 * TetrisBlock - בלוק טטריס SVG
 * Renders one of 7 tetris block types with configurable color and size
 * 
 * @param {Object} props
 * @param {'I'|'O'|'T'|'S'|'Z'|'J'|'L'} props.type - Block type
 * @param {'purple'|'green'|'orange'|'pink'|'yellow'|'blue'|'cyan'} props.color - Block color
 * @param {number} props.size - Size in pixels
 * @param {string} props.className - Additional classes
 */
const TetrisBlock = ({ type = 'T', color = 'purple', size = 24, className, ...props }) => {
  const blocks = {
    I: { viewBox: '0 0 4 1', cells: [[0,0],[1,0],[2,0],[3,0]] },
    O: { viewBox: '0 0 2 2', cells: [[0,0],[1,0],[0,1],[1,1]] },
    T: { viewBox: '0 0 3 2', cells: [[0,0],[1,0],[2,0],[1,1]] },
    S: { viewBox: '0 0 3 2', cells: [[1,0],[2,0],[0,1],[1,1]] },
    Z: { viewBox: '0 0 3 2', cells: [[0,0],[1,0],[1,1],[2,1]] },
    J: { viewBox: '0 0 3 2', cells: [[0,0],[0,1],[1,1],[2,1]] },
    L: { viewBox: '0 0 3 2', cells: [[2,0],[0,1],[1,1],[2,1]] },
  };

  const colors = {
    purple: '#7D53FA',
    green: '#36EF79',
    orange: '#FD982E',
    pink: '#F9A8D4',
    yellow: '#FDE047',
    blue: '#93C5FD',
    cyan: '#67E8F9',
  };

  const block = blocks[type] || blocks.T;
  const fillColor = colors[color] || colors.purple;

  return (
    <svg
      width={size}
      height={size}
      viewBox={block.viewBox}
      className={cn('tetris-block', className)}
      aria-hidden="true"
      {...props}
    >
      {block.cells.map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={fillColor}
          stroke="#1F1F1F"
          strokeWidth={0.08}
        />
      ))}
    </svg>
  );
};

export default TetrisBlock;
