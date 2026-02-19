import React from 'react';
import { cn } from '@/lib/utils';
import TetrisIcon from '@/components/tetris/TetrisIcon';
import Badge from '@/components/ui/Badge';

/**
 * TipCard - כרטיס טיפ מסטודנט
 * Displays a student tip with category and voting
 */
const TipCard = ({
  text,
  category,
  votes = 0,
  className,
}) => {
  return (
    <article
      dir="rtl"
      className={cn(
        'p-6',
        'bg-off-white',
        'border-3 border-off-black',
        'shadow-brutalist',
        'hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]',
        'transition-all duration-200',
        className
      )}
    >
      <p className="text-lg font-medium text-off-black text-right mb-4 leading-relaxed">
        &ldquo;{text}&rdquo;
      </p>

      <div className="flex flex-row-reverse items-center justify-between">
        {category && <Badge color="bg-tetris-pink">{category}</Badge>}

        <div className="flex items-center gap-2">
          <button
            aria-label="הצבע למעלה"
            className={cn(
              'p-1',
              'border-2 border-off-black',
              'bg-off-white',
              'hover:bg-tetris-green',
              'transition-colors duration-200'
            )}
          >
            <TetrisIcon icon="upvote" size={16} />
          </button>
          <span className="text-sm font-bold text-off-black">{votes}</span>
          <button
            aria-label="הצבע למטה"
            className={cn(
              'p-1',
              'border-2 border-off-black',
              'bg-off-white',
              'hover:bg-tetris-pink',
              'transition-colors duration-200'
            )}
          >
            <TetrisIcon icon="downvote" size={16} />
          </button>
        </div>
      </div>
    </article>
  );
};

export default TipCard;
