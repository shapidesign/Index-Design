import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import TetrisIcon from '@/components/tetris/TetrisIcon';
import Badge from '@/components/ui/Badge';

/**
 * ResourceCard - כרטיס משאב
 * Displays a resource with tetris-themed brutalist design
 */
const ResourceCard = ({
  name,
  description,
  category,
  link,
  tip,
  featured = false,
  tags = [],
  className,
}) => {
  const [saved, setSaved] = useState(false);

  const categoryColors = {
    'טיפוגרפיה': 'bg-tetris-purple',
    'מוקאפים': 'bg-tetris-green',
    'כלי AI': 'bg-tetris-orange',
    'תוכנות': 'bg-tetris-blue',
  };

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
        'group',
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-row-reverse items-start justify-between mb-4">
        <div className="flex-1 me-4">
          <h3 className="text-xl font-bold text-off-black text-right mb-2">{name}</h3>
          {category && (
            <Badge color={categoryColors[category] || 'bg-light-gray'}>
              {category}
            </Badge>
          )}
        </div>
        <button
          onClick={() => setSaved(!saved)}
          aria-label={saved ? 'בטל שמירה' : 'שמור משאב'}
          className={cn(
            'p-2',
            'border-3 border-off-black',
            'shadow-brutalist-xs',
            'transition-all duration-300',
            'hover:rotate-90 hover:scale-110',
            saved ? 'bg-tetris-pink' : 'bg-off-white'
          )}
        >
          <TetrisIcon icon={saved ? 'bookmark-filled' : 'bookmark'} size={20} />
        </button>
      </div>

      {/* Description */}
      <p className="text-base text-dark-gray text-right mb-4 leading-relaxed">
        {description}
      </p>

      {/* Link */}
      {link && (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex flex-row-reverse items-center gap-2',
            'text-sm font-medium text-off-black',
            'hover:text-tetris-purple',
            'transition-colors duration-200'
          )}
        >
          <span>קישור למשאב</span>
          <TetrisIcon icon="external-link" size={16} />
        </a>
      )}

      {/* Student Tip */}
      {tip && (
        <div className="mt-4 pt-4 border-t-3 border-light-gray">
          <p className="text-sm text-off-black text-right">
            <span className="font-bold">טיפ: </span>
            {tip}
          </p>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-row-reverse flex-wrap gap-2 mt-4">
          {tags.map((tag) => (
            <Badge key={tag} color="bg-light-gray">{tag}</Badge>
          ))}
        </div>
      )}

      {/* Featured Badge */}
      {featured && (
        <div className="absolute -top-3 -right-3">
          <span className={cn(
            'block px-3 py-1',
            'bg-tetris-yellow',
            'text-off-black text-xs font-bold',
            'border-3 border-off-black',
            'shadow-brutalist-xs',
            'rotate-12',
            'animate-line-clear'
          )}>
            מומלץ
          </span>
        </div>
      )}
    </article>
  );
};

export default ResourceCard;
