import React from 'react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { ExternalLink } from 'lucide-react';

const tagColors = [
  'bg-tetris-purple',
  'bg-tetris-orange',
  'bg-tetris-green',
  'bg-tetris-pink',
  'bg-tetris-yellow',
  'bg-tetris-blue',
  'bg-tetris-cyan',
];

/**
 * BookCard - כרטיס ספר
 * Displays a book recommendation with cover, author, and description
 */
const BookCard = ({
  title,
  author,
  why,
  coverUrl,
  tags = [],
  year,
  link,
  viewMode = 'gallery',
  featured = false,
  category,
  className,
}) => {
  const isSymbolHeavyText = (value) => /[0-9()[\]{}\-_/\\:;,.+&%#@!?*]/.test(String(value || ''));
  const symbolicFontClass = (value) => (isSymbolHeavyText(value) ? 'font-pixelify' : 'font-shimshon');
  const tagTextClass = (bgColor) => (bgColor === 'bg-tetris-purple' ? 'text-off-white' : 'text-off-black');
  const coverAlt = title ? `כריכת הספר ${title}` : 'כריכת ספר';

  const coverElement = coverUrl ? (
    <img
      src={coverUrl}
      alt={coverAlt}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover"
    />
  ) : (
    <div className="w-full h-full bg-light-gray flex items-center justify-center text-center px-2">
      <span className="text-xs font-shimshon text-dark-gray">אין כריכה זמינה</span>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <article
        dir="rtl"
        className={cn(
          'p-3 md:p-4',
          'bg-off-white border-3 border-off-black',
          'shadow-brutalist-sm',
          'hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]',
          'transition-all duration-200',
          className
        )}
      >
        <div className="flex gap-4">
          <div className="w-24 h-32 md:w-28 md:h-36 shrink-0 border-2 border-off-black overflow-hidden bg-light-gray">
            {coverElement}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-off-black text-right mb-1 break-words">{title}</h3>
                {year && (
                  <div className="flex justify-end mb-1">
                    <span className="inline-flex w-fit items-center px-3 py-0.5 text-sm font-bold font-pixelify bg-tetris-purple border-2 border-off-black text-off-white leading-tight">
                      {year}
                    </span>
                  </div>
                )}
                {author && <p className="text-sm text-dark-gray text-right mb-1">{author}</p>}
                {category && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Badge color="bg-tetris-blue">{category}</Badge>
                  </div>
                )}
              </div>
              {link && (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`קישור לספר ${title}`}
                  className={cn(
                    'inline-flex items-center justify-center p-2',
                    'bg-tetris-cyan border-2 border-off-black shadow-brutalist-xs',
                    'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                    'transition-all duration-200 shrink-0'
                  )}
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>

            {why && (
              <p className="text-sm text-off-black text-right leading-relaxed line-clamp-3">
                {why}
              </p>
            )}

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-end mt-3">
                {tags.slice(0, 6).map((tag, i) => (
                  (() => {
                    const bgColor = tagColors[i % tagColors.length];
                    return (
                  <span
                    key={tag}
                    className={cn(
                      'inline-flex items-center justify-center h-6 min-w-[76px] px-2',
                      'text-xs font-normal border border-off-black',
                      'shadow-[1px_1px_0px_#1F1F1F]',
                      symbolicFontClass(tag),
                      bgColor,
                      tagTextClass(bgColor)
                    )}
                  >
                    {tag}
                  </span>
                    );
                  })()
                ))}
              </div>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      dir="rtl"
      className={cn(
        'relative p-6 h-full flex flex-col',
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
      <div className="mb-4 border-3 border-off-black overflow-hidden h-48 bg-light-gray">
        <div className="w-full h-full">
          {coverElement}
        </div>
      </div>

      <h3 className="text-xl font-bold text-off-black text-right mb-1 line-clamp-2 min-h-[56px]">{title}</h3>
      {year && (
        <div className="flex justify-end mb-2">
          <span className="inline-flex w-fit items-center px-3 py-0.5 text-base font-bold font-pixelify bg-tetris-purple border-2 border-off-black text-off-white leading-tight">
            {year}
          </span>
        </div>
      )}
      {author && <p className="text-sm text-dark-gray text-right mb-3 line-clamp-1 min-h-[20px]">{author}</p>}
      {category && (
        <div className="mb-3 flex items-center gap-2 justify-end">
          <Badge color="bg-tetris-blue">{category}</Badge>
        </div>
      )}

      {why && (
        <div className="mt-3 pt-3 border-t-3 border-light-gray min-h-[112px]">
          <p className="text-sm text-off-black text-right leading-relaxed line-clamp-4">
            <span className="font-bold">למה לקרוא: </span>{why}
          </p>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 justify-end">
          {tags.slice(0, 5).map((tag, i) => (
            (() => {
              const bgColor = tagColors[i % tagColors.length];
              return (
            <span
              key={tag}
              className={cn(
                'inline-flex items-center justify-center h-6 min-w-[76px] px-2',
                'text-xs font-normal border border-off-black',
                'shadow-[1px_1px_0px_#1F1F1F]',
                symbolicFontClass(tag),
                bgColor,
                tagTextClass(bgColor)
              )}
            >
              {tag}
            </span>
              );
            })()
          ))}
        </div>
      )}

      {link && (
        <div className="mt-auto pt-3 border-t-3 border-light-gray flex justify-end">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5',
              'text-sm font-bold font-shimshon text-off-black',
              'px-3 py-1.5 bg-tetris-cyan border-2 border-off-black shadow-brutalist-xs',
              'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
              'transition-all duration-200'
            )}
          >
            <ExternalLink size={14} />
            קישור
          </a>
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
