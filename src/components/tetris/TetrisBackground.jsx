import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import TetrisBlock from './TetrisBlock';

/**
 * TetrisBackground - רקע עם בלוקי טטריס מונפשים
 * Subtle animated tetris blocks as background decoration
 */
const TetrisBackground = ({ className }) => {
  const blockTypes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
  const colors = ['purple', 'green', 'orange', 'pink', 'yellow', 'blue', 'cyan'];

  const blocks = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      type: blockTypes[i % blockTypes.length],
      color: colors[i % colors.length],
      left: `${(i * 8.3) % 100}%`,
      delay: `${i * 0.8}s`,
      duration: `${4 + (i % 3) * 2}s`,
      size: 20 + (i % 3) * 8,
    }));
  }, []);

  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden pointer-events-none',
        'opacity-[0.06]',
        className
      )}
      aria-hidden="true"
    >
      {blocks.map((block) => (
        <div
          key={block.id}
          className="absolute animate-tetris-fall"
          style={{
            left: block.left,
            animationDelay: block.delay,
            animationDuration: block.duration,
          }}
        >
          <TetrisBlock
            type={block.type}
            color={block.color}
            size={block.size}
          />
        </div>
      ))}
    </div>
  );
};

export default TetrisBackground;
