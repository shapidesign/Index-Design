import React from 'react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';

/**
 * BookCard - כרטיס ספר
 * Displays a book recommendation with cover, author, and description
 */
const BookCard = ({
  title,
  author,
  why,
  coverUrl,
  featured = false,
  category,
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
      {coverUrl && (
        <div className="mb-4 border-3 border-off-black overflow-hidden">
          <img
            src={coverUrl}
            alt={`כריכת הספר ${title}`}
            loading="lazy"
            decoding="async"
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      <h3 className="text-xl font-bold text-off-black text-right mb-1">{title}</h3>
      {author && <p className="text-sm text-dark-gray text-right mb-3">{author}</p>}
      {category && <Badge color="bg-tetris-blue" className="mb-3">{category}</Badge>}

      {why && (
        <div className="mt-3 pt-3 border-t-3 border-light-gray">
          <p className="text-sm text-off-black text-right leading-relaxed">
            <span className="font-bold">למה לקרוא: </span>{why}
          </p>
        </div>
      )}

      {featured && (
        <div className="absolute -top-3 -right-3">
          <span className={cn(
            'block px-3 py-1',
            'bg-tetris-yellow',
            'text-off-black text-xs font-bold',
            'border-3 border-off-black',
            'shadow-brutalist-xs',
            'rotate-12'
          )}>
            מומלץ
          </span>
        </div>
      )}
    </article>
  );
};

export default BookCard;
