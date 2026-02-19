import React, { useEffect } from 'react';
import { useAnimate } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  IPiece,
  JPiece,
  LPiece,
  OPiece,
  SPiece,
  TPiece,
  ZPiece,
} from './loader-pieces';

/**
 * TetrisLoader - אנימציית טעינה בסגנון טטריס
 * Pixel-perfect port of the reference Tetris loading animation.
 * Uses framer-motion useAnimate with the exact same sequence, timings,
 * initial positions, and piece layout as the original sandbox.
 *
 * Colors are mapped to the project palette.
 *
 * @param {string} className - Additional CSS classes
 * @param {boolean} fullScreen - Whether to render as a fixed full-screen overlay
 */
const TetrisLoader = ({ className, fullScreen = false }) => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const sequence = [
      ['.jPiece-1', { opacity: 1 }],
      ['.jPiece-1', { x: (1 + 6) * 15 }],
      ['.jPiece-1', { rotate: 0 }],
      ['.jPiece-1', { y: (2 + 7) * 15 }],

      ['.iPiece-1', { opacity: 1 }],
      ['.iPiece-1', { x: (4 + 0) * 15 }],
      ['.iPiece-1', { y: (0 + 11) * 15 }],

      ['.sPiece-1', { opacity: 1 }],
      ['.sPiece-1', { x: (0 + 5) * 15 }],
      ['.sPiece-1', { y: (0 + 10) * 15 }],

      ['.oPiece', { opacity: 1 }],
      ['.oPiece', { x: (0 + 1) * 15 }],
      ['.oPiece', { y: (0 + 9) * 15 }],

      ['.tPiece-1', { opacity: 1 }],
      ['.tPiece-1', { y: (0 + 9) * 15 }],

      ['.zPiece', { opacity: 1 }],
      ['.zPiece', { y: (0 + 8) * 15 }],

      ['.lPiece', { opacity: 1 }],
      ['.lPiece', { x: (3 + 1) * 15 }],
      ['.lPiece', { rotate: -180 }],
      ['.lPiece', { y: (-1 + 6) * 15 }],

      ['.tPiece-2', { opacity: 1 }],
      ['.tPiece-2', { x: (0 + 6) * 15 }],
      ['.tPiece-2', { rotate: -180 }],
      ['.tPiece-2', { y: (0 + 8) * 15 }],

      ['.jPiece-2', { opacity: 1 }],
      ['.jPiece-2', { x: (-2 + 0) * 15 }],
      ['.jPiece-2', { rotate: 180 }],
      ['.jPiece-2', { y: (-1 + 6) * 15 }],

      ['.iPiece-2', { opacity: 1 }],
      ['.iPiece-2', { rotate: 0 }],
      ['.iPiece-2', { x: (3 + 6) * 15 }],
      ['.iPiece-2', { y: (1 + 7) * 15 }],
    ];

    const controls = animate(sequence, {
      duration: 3.5,
      repeat: Infinity,
      repeatDelay: 1,
    });
    return () => controls.stop();
  }, [animate]);

  const wrapperClasses = fullScreen
    ? 'fixed inset-0 z-[999] bg-off-white'
    : 'w-full';

  return (
    <div
      className={cn(
        wrapperClasses,
        'flex items-center justify-center',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="טוען..."
    >
      <div ref={scope} dir="ltr">
        <div className="tetris-loader-grid">
          <JPiece
            className="piece jPiece-1"
            initial={{
              opacity: 0,
              y: (2 + 2) * 15,
              x: (1 + 3) * 15,
              rotate: 90,
              transformOrigin: 'top right',
            }}
          />
          <IPiece
            className="piece iPiece-1"
            initial={{
              opacity: 0,
              y: (0 + 2) * 15,
              x: (4 + 3) * 15,
              rotate: 90,
              transformOrigin: 'top left',
            }}
          />
          <SPiece
            className="piece sPiece-1"
            initial={{
              opacity: 0,
              y: (0 + 2) * 15,
              x: (0 + 3) * 15,
            }}
          />
          <OPiece
            className="piece oPiece"
            initial={{
              opacity: 0,
              y: (0 + 2) * 15,
              x: (0 + 4) * 15,
            }}
          />
          <TPiece
            className="piece tPiece-1"
            initial={{
              opacity: 0,
              y: (0 + 2) * 15,
              x: (2 + 4) * 15,
              rotate: 90,
              transformOrigin: 'top left',
            }}
          />
          <ZPiece
            className="piece zPiece"
            initial={{
              opacity: 0,
              y: (0 + 2) * 15,
              x: (0 + 4) * 15,
            }}
          />
          <LPiece
            className="piece lPiece"
            initial={{
              opacity: 0,
              y: (-1 + 2) * 15,
              x: (3 + 3) * 15,
              rotate: -90,
              transformOrigin: 'bottom left',
            }}
          />
          <TPiece
            className="piece tPiece-2"
            initial={{
              opacity: 0,
              y: (0 + 2) * 15,
              x: (0 + 3) * 15,
            }}
          />
          <JPiece
            className="piece jPiece-2"
            initial={{
              opacity: 0,
              y: (-1 + 2) * 15,
              x: (-2 + 3) * 15,
              rotate: 90,
              transformOrigin: 'bottom right',
            }}
          />
          <IPiece
            className="piece iPiece-2"
            initial={{
              opacity: 0,
              y: (1 + 2) * 15,
              x: (3 + 3) * 15,
              rotate: 90,
              transformOrigin: 'top right',
            }}
          />
        </div>
        <div className="tetris-loader-base" />
      </div>
    </div>
  );
};

export default TetrisLoader;
