import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const EyeLogo = ({ className }) => {
  const eyeRef = useRef(null);
  const pupilRef = useRef(null);
  const eyeGroupRef = useRef(null);
  const currentPosRef = useRef({ x: 0, y: 0 });
  const targetPosRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef(null);

  useEffect(() => {
    const maxDistance = 170;
    const maxOffset = 82;
    const lerp = 0.16;

    const animate = () => {
      const current = currentPosRef.current;
      const target = targetPosRef.current;

      current.x += (target.x - current.x) * lerp;
      current.y += (target.y - current.y) * lerp;

      if (pupilRef.current) {
        pupilRef.current.style.transform = `translate(${current.x}px, ${current.y}px)`;
      }

      frameRef.current = window.requestAnimationFrame(animate);
    };

    const handlePointerMove = (e) => {
      if (!eyeRef.current) return;
      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(Math.hypot(dx, dy), maxDistance);
      const moveRadius = (distance / maxDistance) * maxOffset;

      targetPosRef.current = {
        x: Math.cos(angle) * moveRadius,
        y: Math.sin(angle) * moveRadius,
      };
    };

    const handlePointerLeave = () => {
      targetPosRef.current = { x: 0, y: 0 };
    };

    frameRef.current = window.requestAnimationFrame(animate);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleBlink = () => {
    if (!eyeGroupRef.current) return;
    eyeGroupRef.current.animate(
      [
        { transform: 'scaleY(1)' },
        { transform: 'scaleY(0.08)' },
        { transform: 'scaleY(1)' },
      ],
      {
        duration: 220,
        easing: 'ease-in-out',
      }
    );
  };

  return (
    <button
      type="button"
      ref={eyeRef}
      onClick={handleBlink}
      className={cn("relative w-48 h-48 cursor-pointer", className)}
      aria-label="לוגו עין - לחיצה למצמוץ"
    >
      <svg
        viewBox="0 0 880.07 880.07"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <style>
            {`
              .cls-1 { fill: #1abcfd; }
              .cls-2 { fill: #fff; }
            `}
          </style>
        </defs>
        <g id="Layer_1-2" data-name="Layer 1">
          <g ref={eyeGroupRef} style={{ transformOrigin: '50% 50%' }}>
            {/* Outer white circle */}
            <circle className="cls-2" cx="440.04" cy="440.04" r="440.04" />
            {/* Blue iris */}
            <circle className="cls-1" cx="440.04" cy="440.04" r="321.27" />
            {/* Black pupil - animated */}
            <circle
              ref={pupilRef}
              cx="440.04"
              cy="440.04"
              r="147.33"
              style={{
                transform: 'translate(0px, 0px)',
                willChange: 'transform',
              }}
            />
          </g>
        </g>
      </svg>
    </button>
  );
};

export default EyeLogo;
