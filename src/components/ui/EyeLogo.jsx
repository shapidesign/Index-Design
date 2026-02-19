import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const EyeLogo = ({ className }) => {
  const eyeRef = useRef(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!eyeRef.current) return;

      const rect = eyeRef.current.getBoundingClientRect();
      const eyeCenterX = rect.left + rect.width / 2;
      const eyeCenterY = rect.top + rect.height / 2;

      // Calculate angle and distance from center
      const dx = e.clientX - eyeCenterX;
      const dy = e.clientY - eyeCenterY;
      const angle = Math.atan2(dy, dx);
      const distance = Math.min(Math.hypot(dx, dy), 150); // Limit distance to keep pupil inside

      // Map distance to pupil movement range (max 80px movement)
      const moveRadius = (distance / 150) * 80;
      
      setPupilPos({
        x: Math.cos(angle) * moveRadius,
        y: Math.sin(angle) * moveRadius
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={eyeRef} className={cn("relative w-48 h-48", className)}>
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
          <g>
            {/* Outer white circle */}
            <circle class="cls-2" cx="440.04" cy="440.04" r="440.04"/>
            {/* Blue iris */}
            <circle class="cls-1" cx="440.04" cy="440.04" r="321.27"/>
            {/* Black pupil - animated */}
            <circle 
              cx="440.04" 
              cy="440.04" 
              r="147.33"
              style={{
                transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)`,
                transition: 'transform 0.1s ease-out'
              }}
            />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default EyeLogo;
