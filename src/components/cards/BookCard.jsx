import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { ExternalLink } from 'lucide-react';
import { getTagColor, getTagTextClass } from '@/lib/tagColors';

const AVAILABILITY_MARK = {
  available: { label: 'זמין להשאלה', color: 'bg-tetris-green' },
  taken: { label: 'מושאל', color: 'bg-tetris-pink' },
  unknown: { label: 'בדקו זמינות', color: 'bg-light-gray' },
};

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
  linkLabel,
  availability,
  viewMode = 'gallery',
  featured = false,
  category,
  className,
}) => {
  const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test(text);
  const isSymbolHeavyText = (value) => /[0-9()[\]{}\-_/\\:;,.+&%#@!?*]/.test(String(value || ''));
  const textFontClass = (value) => (isEnglish(value) || isSymbolHeavyText(value) ? 'font-jersey' : 'font-headline');
  const coverAlt = title ? `כריכת הספר ${title}` : 'כריכת ספר';
  const [coverState, setCoverState] = useState({ url: '', failed: false });
  const coverFailed = coverState.url === coverUrl && coverState.failed;
  const availabilityMark = AVAILABILITY_MARK[availability];
  const availabilityBadge = availabilityMark ? (
    <span
      className={cn(
        'inline-flex items-center justify-center h-6 px-2',
        'text-xs font-normal font-headline border border-off-black shadow-brutalist-xs',
        availabilityMark.color
      )}
    >
      {availabilityMark.label}
    </span>
  ) : null;
  const yearBadge = year ? (
    <span className="inline-flex w-fit items-center px-3 py-0.5 text-sm font-normal font-jersey bg-tetris-purple border-2 border-off-black text-off-white leading-tight">
      {year}
    </span>
  ) : null;

  const coverElement = coverUrl && !coverFailed ? (
    <img
      src={coverUrl}
      alt={coverAlt}
      loading="lazy"
      decoding="async"
      className={cn(
        'w-full h-full',
        viewMode === 'gallery' ? 'object-contain md:object-cover' : 'object-cover'
      )}
      onError={() => setCoverState({ url: coverUrl, failed: true })}
    />
  ) : (
    <div className="w-full h-full bg-light-gray flex items-center justify-center text-center px-1">
      <span className="text-[10px] md:text-xs font-headline text-dark-gray leading-tight">אין כריכה זמינה</span>
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
                <h3 className="text-lg font-bold font-mixed text-off-black text-right mb-1 break-words">{title}</h3>
                {year && !link && (
                  <div className="flex justify-end mb-1">
                    {yearBadge}
                  </div>
                )}
                {author && <p className="text-sm font-mixed text-dark-gray text-right mb-1">{author}</p>}
                {category && (
                  <div className="flex flex-wrap gap-2 justify-end">
                    <Badge color="bg-tetris-blue">{category}</Badge>
                  </div>
                )}
              </div>
              {link && (
                <div dir="ltr" className="flex flex-col items-start gap-2 shrink-0">
                  <a
                    href={link}
                    dir="rtl"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={linkLabel ? `${linkLabel}: ${title}` : `קישור לספר ${title}`}
                    className={cn(
                      'inline-flex items-center justify-center gap-1 p-2',
                      'bg-tetris-cyan border-2 border-off-black shadow-brutalist-xs',
                      'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                      'transition-all duration-200'
                    )}
                  >
                    {linkLabel && <span className="text-xs font-bold font-headline">{linkLabel}</span>}
                    <ExternalLink size={14} />
                  </a>
                  {yearBadge}
                </div>
              )}
            </div>

            {why && (
              <p className="text-sm font-mixed text-off-black text-right leading-relaxed line-clamp-3">
                {why}
              </p>
            )}

            {(tags.length > 0 || availabilityBadge) && (
              <div dir="ltr" className="flex flex-wrap gap-2 justify-start mt-3">
                {availabilityBadge}
                {tags.slice(0, 6).map((tag) => (
                  (() => {
                    const bgColor = getTagColor(tag);
                    return (
                  <span
                    key={tag}
                    className={cn(
                      'inline-flex items-center justify-center h-6 min-w-[76px] px-2',
                      'text-xs font-normal border border-off-black',
                      'shadow-brutalist-xs',
                      textFontClass(tag),
                      bgColor,
                      getTagTextClass(bgColor)
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
        'relative h-full flex flex-col',
        'p-1.5 md:p-6',
        'bg-off-white',
        'border-3 border-off-black',
        featured
          ? 'shadow-[2px_2px_0_#FDE047,4px_4px_0_#1F1F1F] md:shadow-[6px_6px_0_#FDE047,9px_9px_0_#1F1F1F]'
          : 'shadow-brutalist-xs md:shadow-brutalist',
        'hover:shadow-none md:hover:shadow-brutalist-sm hover:translate-x-[2px] hover:translate-y-[2px] md:hover:translate-x-[3px] md:hover:translate-y-[3px]',
        'transition-all duration-200',
        className
      )}
    >
      <div className="mb-1.5 md:mb-4 border-3 border-off-black overflow-hidden aspect-[2/3] md:aspect-auto md:h-48 bg-light-gray">
        <div className="w-full h-full">
          {coverElement}
        </div>
      </div>

      <h3 className="text-[11px] leading-tight md:text-xl md:leading-normal font-bold font-mixed text-off-black text-right mb-0.5 md:mb-1 line-clamp-2 md:min-h-[56px] break-words">{title}</h3>
      {year && (
        <div className="hidden md:flex justify-end mb-2">
          <span className="inline-flex w-fit items-center px-3 py-0.5 text-base font-normal font-jersey bg-tetris-purple border-2 border-off-black text-off-white leading-tight">
            {year}
          </span>
        </div>
      )}
      {(author || year) && (
        <p className="md:hidden text-[10px] leading-tight font-mixed text-dark-gray text-right line-clamp-2 break-words">
          {[author, year].filter(Boolean).join(' · ')}
        </p>
      )}
      {author && <p className="hidden md:block text-sm font-mixed text-dark-gray text-right mb-3 line-clamp-1 min-h-[20px]">{author}</p>}
      {category && (
        <div className="mb-3 hidden md:flex items-center gap-2 justify-end">
          <Badge color="bg-tetris-blue">{category}</Badge>
        </div>
      )}

      {why && (
        <div className="hidden md:block mt-3 pt-3 border-t-3 border-light-gray min-h-[112px]">
          <p className="text-sm font-mixed text-off-black text-right leading-relaxed line-clamp-4">
            <span className="font-bold">למה לקרוא: </span>{why}
          </p>
        </div>
      )}

      {(tags.length > 0 || availabilityBadge) && (
        <div className="mt-3 hidden md:flex flex-wrap gap-2 justify-end">
          {availabilityBadge}
          {tags.slice(0, 5).map((tag) => (
            (() => {
              const bgColor = getTagColor(tag);
              return (
            <span
              key={tag}
              className={cn(
                'inline-flex items-center justify-center h-6 min-w-[76px] px-2',
                'text-xs font-normal border border-off-black',
                'shadow-brutalist-xs',
                textFontClass(tag),
                bgColor,
                getTagTextClass(bgColor)
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
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={linkLabel ? `${linkLabel}: ${title}` : `קישור לספר ${title}`}
          className="absolute inset-0 z-10 md:hidden"
        />
      )}

      {link && (
        <div className="mt-auto pt-3 border-t-3 border-light-gray hidden md:flex justify-end">
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-1.5',
              'text-sm font-bold font-headline text-off-black',
              'px-3 py-1.5 bg-tetris-cyan border-2 border-off-black shadow-brutalist-xs',
              'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
              'transition-all duration-200'
            )}
          >
            <ExternalLink size={14} />
            {linkLabel || 'קישור'}
          </a>
        </div>
      )}

      {featured && (
        <div className="absolute -top-3 -right-3">
          <span className={cn(
            'block px-3 py-1',
            'bg-tetris-yellow',
            'text-off-black text-xs font-normal',
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
