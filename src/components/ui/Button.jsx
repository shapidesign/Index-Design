import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Button - כפתור בסגנון ניאו-ברוטליסטי
 * Neo-brutalist button with tetris-themed states
 * 
 * @param {Object} props
 * @param {'primary'|'secondary'|'icon'|'cta'} props.variant
 * @param {string} props.className
 * @param {React.ReactNode} props.children
 */
const Button = ({
  children,
  variant = 'primary',
  className,
  disabled = false,
  ...props
}) => {
  const variants = {
    primary: cn(
      'px-6 py-3',
      'bg-tetris-purple',
      'text-off-black font-bold text-base',
    ),
    secondary: cn(
      'px-6 py-3',
      'bg-off-white',
      'text-off-black font-bold text-base',
    ),
    icon: cn(
      'p-3',
      'bg-tetris-yellow',
    ),
    cta: cn(
      'px-8 py-4',
      'bg-tetris-orange',
      'text-off-black font-bold text-lg',
    ),
  };

  return (
    <button
      className={cn(
        variants[variant],
        'border-3 border-off-black',
        'shadow-brutalist',
        'transition-all duration-200',
        'hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]',
        'active:shadow-none active:translate-x-[6px] active:translate-y-[6px]',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-brutalist disabled:hover:translate-x-0 disabled:hover:translate-y-0',
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
