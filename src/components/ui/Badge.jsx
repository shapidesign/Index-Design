import React from 'react';
import { cn } from '@/lib/utils';

/** Check if a string is primarily Latin/English */
const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test(text);

/**
 * Badge - תג בסגנון ניאו-ברוטליסטי
 * Small label/tag with tetris-themed styling.
 * Auto-detects English text and applies Jersey 20 font.
 */
const Badge = ({
  children,
  color = 'bg-light-gray',
  className,
  ...props
}) => {
  const text = typeof children === 'string' ? children : '';
  const fontClass = isEnglish(text) ? 'font-jersey' : 'font-shimshon';

  return (
    <span
      className={cn(
        'inline-block px-3 py-1',
        'text-xs font-normal text-off-black',
        fontClass,
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
