import React from 'react';
import { cn } from '@/lib/utils';

/**
 * DesignerCard - כרטיס מעצב
 * Displays a designer's profile in the "museum" section
 */
const DesignerCard = ({
  name,
  period,
  famousFor,
  bio,
  featured = false,
  className,
}) => {
  return (
    <article
      dir="rtl"
      className={cn(
        'relative p-6',
        'bg-off-white',
        'border-3 border-off-black',
        featured
          ? 'shadow-[6px_6px_0_#FDE047,9px_9px_0_#1F1F1F]'
          : 'shadow-brutalist',
        'hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]',
        'transition-all duration-200',
        className
      )}
    >
      <h3 className="text-xl font-bold text-off-black text-right mb-1">{name}</h3>
      {period && (
        <p className="text-sm text-tetris-purple font-medium text-right mb-3">{period}</p>
      )}
      {famousFor && (
        <p className="text-base text-dark-gray text-right mb-3">{famousFor}</p>
      )}
      {bio && (
        <p className="text-sm text-dark-gray text-right leading-relaxed line-clamp-4">
          {bio}
        </p>
      )}
    </article>
  );
};

export default DesignerCard;
