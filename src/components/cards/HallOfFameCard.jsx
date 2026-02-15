import React, { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * HallOfFameCard - כרטיס מעצב להיכל התהילה
 * Displays a famous designer with dual-line name (Hebrew + English),
 * era badge, style/field tags, hover description, and link.
 *
 * Supports both gallery (card) and list (table-row) views.
 */

/** Check if a string is primarily Latin/English */
const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test(text);

/** Style → accent color cycling */
const styleColors = [
    'bg-tetris-purple',
    'bg-tetris-orange',
    'bg-tetris-green',
    'bg-tetris-pink',
    'bg-tetris-blue',
];

/** Field → accent color cycling */
const fieldColors = [
    'bg-tetris-yellow',
    'bg-tetris-cyan',
    'bg-tetris-pink',
    'bg-tetris-blue',
];

/** Map style colors to text colors for contrast */
const needsWhiteText = (colorClass) =>
    ['bg-tetris-purple', 'bg-tetris-orange', 'bg-tetris-green', 'bg-tetris-pink', 'bg-tetris-blue'].includes(colorClass);

/** Era → muted accent */
const eraColor = 'bg-tetris-purple';

// ===== GALLERY VIEW CARD =====
const GalleryCard = ({
    itemId,
    nameHe,
    nameEn,
    description,
    fields,
    styles,
    era,
    link,
    imageUrl,
    className,
}) => {
    const [imgError, setImgError] = useState(false);
    const href = link
        ? link.startsWith('http') ? link : `https://${link}`
        : undefined;

    const initial = (nameHe || nameEn || '?').charAt(0).toUpperCase();

    const CardTag = href ? 'a' : 'div';
    const linkProps = href
        ? { href, target: '_blank', rel: 'noopener noreferrer' }
        : {};

    return (
        <CardTag
            {...linkProps}
            id={itemId ? `search-item-hallOfFame-${String(itemId).replace(/[^a-zA-Z0-9_-]/g, '-')}` : undefined}
            dir="rtl"
            aria-label={`${nameHe}${era?.length ? ` — ${era[0]}` : ''}`}
            className={cn(
                'block',
                'bg-off-white',
                'border-3 border-off-black',
                'shadow-brutalist',
                'hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]',
                'transition-all duration-200',
                'group overflow-hidden',
                href && 'cursor-pointer',
                'focus-visible:outline-3 focus-visible:outline-tetris-yellow focus-visible:outline-offset-2',
                className
            )}
        >
            {/* ===== HERO AREA ===== */}
            <div className="relative h-32 overflow-hidden border-b-3 border-off-black bg-gradient-to-bl from-tetris-purple/20 via-tetris-cyan/10 to-tetris-yellow/15">
                {/* Portrait image or decorative initial fallback */}
                {imageUrl && !imgError ? (
                    <img
                        src={imageUrl}
                        alt={nameHe || nameEn}
                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <div
                        className="absolute bottom-0 left-0 leading-none pointer-events-none select-none"
                        style={{
                            fontSize: '120px',
                            fontFamily: "'Shimshon', sans-serif",
                            fontWeight: 700,
                            color: '#1F1F1F',
                            opacity: 0.07,
                            transform: 'translate(-6%, 20%)',
                        }}
                        aria-hidden="true"
                    >
                        {initial}
                    </div>
                )}

                {/* Era badge — top right */}
                {era?.length > 0 && (
                    <div className="absolute top-3 right-3">
                        <span
                            className={cn(
                                'inline-block px-2.5 py-1',
                                'text-sm font-bold text-off-white',
                                'border-2 border-off-black',
                                'shadow-[2px_2px_0px_#1F1F1F]',
                                'font-shimshon',
                                eraColor
                            )}
                        >
                            {era[0]}
                        </span>
                    </div>
                )}

                {/* Hover overlay with description */}
                <div
                    className={cn(
                        'absolute inset-0',
                        'bg-off-black/85',
                        'flex flex-col p-4',
                        'opacity-0 translate-y-4',
                        'group-hover:opacity-100 group-hover:translate-y-0',
                        'transition-all duration-300',
                        'overflow-y-auto max-h-full'
                    )}
                >
                    <p className="text-sm text-off-white text-right leading-relaxed font-ibm">
                        {description}
                    </p>
                </div>
            </div>

            {/* ===== CARD BODY ===== */}
            <div className="p-4">
                {/* Name: Hebrew above, English below */}
                <h3 className="text-lg font-bold text-off-black text-right mb-1 leading-tight font-shimshon">
                    {nameHe}
                </h3>
                {nameEn && (
                    <p className="text-sm text-dark-gray text-right mb-3 font-pixelify leading-tight">
                        {nameEn}
                    </p>
                )}

                {/* Style tags — with white text for dark backgrounds */}
                {styles?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {styles.map((style, i) => {
                            const bgColor = styleColors[i % styleColors.length];
                            return (
                                <span
                                    key={style}
                                    className={cn(
                                        'inline-block px-2 py-0.5',
                                        'text-xs font-bold',
                                        'border border-off-black',
                                        'shadow-[1px_1px_0px_#1F1F1F]',
                                        isEnglish(style) ? 'font-pixelify' : 'font-shimshon',
                                        bgColor,
                                        needsWhiteText(bgColor) ? 'text-off-white' : 'text-off-black'
                                    )}
                                >
                                    {style}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Field tags */}
                {fields?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {fields.map((field, i) => {
                            const bgColor = fieldColors[i % fieldColors.length];
                            return (
                                <span
                                    key={field}
                                    className={cn(
                                        'inline-block px-2 py-0.5',
                                        'text-[11px] font-bold',
                                        'border border-off-black',
                                        'shadow-[1px_1px_0px_#1F1F1F]',
                                        isEnglish(field) ? 'font-pixelify' : 'font-shimshon',
                                        bgColor,
                                        needsWhiteText(bgColor) ? 'text-off-white' : 'text-off-black'
                                    )}
                                >
                                    {field}
                                </span>
                            );
                        })}
                    </div>
                )}
            </div>
        </CardTag>
    );
};

// ===== LIST VIEW ROW =====
const ListRow = ({
    itemId,
    nameHe,
    nameEn,
    description,
    fields,
    styles,
    era,
    link,
    imageUrl,
    className,
}) => {
    const [imgError, setImgError] = useState(false);
    const initial = (nameHe || nameEn || '?').charAt(0).toUpperCase();
    const href = link
        ? link.startsWith('http') ? link : `https://${link}`
        : undefined;

    const CardTag = href ? 'a' : 'div';
    const linkProps = href
        ? { href, target: '_blank', rel: 'noopener noreferrer' }
        : {};

    return (
        <CardTag
            {...linkProps}
            id={itemId ? `search-item-hallOfFame-${String(itemId).replace(/[^a-zA-Z0-9_-]/g, '-')}` : undefined}
            dir="rtl"
            className={cn(
                'flex items-start gap-4 p-4',
                'bg-off-white',
                'border-3 border-off-black',
                'shadow-brutalist-xs',
                'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
                'transition-all duration-200',
                href && 'cursor-pointer',
                className
            )}
        >
            {/* Avatar */}
            <div className="w-10 h-10 shrink-0 border-2 border-off-black overflow-hidden bg-gradient-to-bl from-tetris-purple/20 via-tetris-cyan/10 to-tetris-yellow/15 flex items-center justify-center">
                {imageUrl && !imgError ? (
                    <img
                        src={imageUrl}
                        alt={nameHe || nameEn}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                        loading="lazy"
                    />
                ) : (
                    <span className="text-sm font-bold font-shimshon text-off-black/20 select-none">{initial}</span>
                )}
            </div>

            {/* Name column */}
            <div className="min-w-[180px] shrink-0">
                <h3 className="text-base font-bold text-off-black font-shimshon leading-tight">
                    {nameHe}
                </h3>
                {nameEn && (
                    <p className="text-xs text-dark-gray font-pixelify mt-0.5">{nameEn}</p>
                )}
            </div>

            {/* Description — truncated */}
            <p className="flex-1 text-sm text-dark-gray font-ibm line-clamp-2 text-right">
                {description}
            </p>

            {/* Era */}
            {era?.length > 0 && (
                <span
                    className={cn(
                        'shrink-0 px-2 py-0.5',
                        'text-[11px] font-bold text-off-white',
                        'border border-off-black',
                        'font-shimshon',
                        eraColor
                    )}
                >
                    {era[0]}
                </span>
            )}

            {/* Tags */}
            <div className="hidden md:flex flex-wrap gap-1 shrink-0 max-w-[200px] justify-end">
                {styles?.slice(0, 2).map((style, i) => {
                    const bgColor = styleColors[i % styleColors.length];
                    return (
                        <span
                            key={style}
                            className={cn(
                                'inline-block px-1.5 py-0.5',
                                'text-[10px] font-bold',
                                'border border-off-black',
                                isEnglish(style) ? 'font-pixelify' : 'font-shimshon',
                                bgColor,
                                needsWhiteText(bgColor) ? 'text-off-white' : 'text-off-black'
                            )}
                        >
                            {style}
                        </span>
                    );
                })}
            </div>
        </CardTag>
    );
};

// ===== MAIN EXPORT =====
const HallOfFameCard = ({ viewMode = 'gallery', ...props }) => {
    if (viewMode === 'list') return <ListRow {...props} />;
    return <GalleryCard {...props} />;
};

export default HallOfFameCard;
