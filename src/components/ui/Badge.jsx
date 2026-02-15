import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Badge - תג בסגנון ניאו-ברוטליסטי
 * Small label/tag with tetris-themed styling
 */
const Badge = ({
  children,
  color = 'bg-light-gray',
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-block px-3 py-1',
        'text-xs font-normal font-shimshon text-off-black',
        'border-2 border-off-black',
        'shadow-brutalist-xs',
        color,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
