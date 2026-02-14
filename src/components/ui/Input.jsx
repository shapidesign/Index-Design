import React from 'react';
import { cn } from '@/lib/utils';
import TetrisIcon from '@/components/tetris/TetrisIcon';

/**
 * Input - שדה קלט בסגנון ניאו-ברוטליסטי
 * Neo-brutalist input field with search icon support
 */
const Input = ({
  value,
  onChange,
  placeholder = 'חיפוש...',
  icon = 'search',
  className,
  ...props
}) => {
  return (
    <div className="relative" dir="rtl">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          'w-full px-4 py-3 pe-12',
          'bg-off-white',
          'text-off-black text-right',
          'border-3 border-off-black',
          'focus:outline-none focus:shadow-brutalist',
          'transition-shadow duration-200',
          'font-rubik',
          className
        )}
        dir="rtl"
        {...props}
      />
      {icon && (
        <TetrisIcon
          icon={icon}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-gray"
          size={20}
        />
      )}
    </div>
  );
};

export default Input;
