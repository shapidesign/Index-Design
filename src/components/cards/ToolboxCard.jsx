import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import PricingBadge from '@/components/ui/PricingBadge';

/**
 * ToolboxCard - כרטיס משאב לארגז הכלים
 * Displays a resource with screenshot preview, type/tag badges,
 * hover description overlay, and pricing indicator.
 *
 * @param {Object} props
 * @param {string} props.name - שם המשאב
 * @param {string} props.description - תיאור
 * @param {string[]} props.types - סוג (e.g. ["אתר", "כלי"])
 * @param {string[]} props.tags - תגיות
 * @param {string} props.link - קישור (URL)
 * @param {string} props.image - תמונה (URL)
 * @param {string} props.pricing - חינם/תשלום
 */

/** Map tool types → primary accent colors */
const typeColorMap = {
  'אתר': 'bg-tetris-purple',
  'כלי': 'bg-tetris-orange',
  'ספרייה/מאגר': 'bg-tetris-green',
  'השראה': 'bg-tetris-yellow',
  'פלאגין': 'bg-tetris-pink',
  'Assets': 'bg-tetris-blue',
  'מדריך': 'bg-tetris-cyan',
};

/** Type → color values for the placeholder gradient */
const typeGradientMap = {
  'אתר': { from: '#7D53FA', to: '#B794F6' },
  'כלי': { from: '#FD982E', to: '#FDBA74' },
  'ספרייה/מאגר': { from: '#36EF79', to: '#86EFAC' },
  'השראה': { from: '#FDE047', to: '#FEF08A' },
  'פלאגין': { from: '#F9A8D4', to: '#FBCFE8' },
  'Assets': { from: '#93C5FD', to: '#BFDBFE' },
  'מדריך': { from: '#67E8F9', to: '#A5F3FC' },
};

/** Secondary accent colors cycled for tags */
const tagColors = [
  'bg-tetris-purple',
  'bg-tetris-orange',
  'bg-tetris-green',
  'bg-tetris-pink',
  'bg-tetris-yellow',
  'bg-tetris-blue',
  'bg-tetris-cyan',
];

const getTagTextClass = (bgColor) => (bgColor === 'bg-tetris-purple' ? 'text-off-white' : 'text-off-black');

/** Check if a string is primarily Latin/English */
const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test(text);

/**
 * Build the screenshot URL for a given link value.
 * Only attempt screenshots for proper http(s) URLs.
 */
function getScreenshotUrl(link) {
  if (!link || !link.startsWith('http')) return null;
  try {
    new URL(link);
    return `https://image.thum.io/get/width/600/?url=${encodeURIComponent(link)}`;
  } catch {
    return null;
  }
}

/**
 * Generate a stable hash from a string → number.
 * Used to deterministically pick rotation/position for decorations.
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Tetris block mini shapes for placeholder decoration.
 * Each returns an SVG path for a small tetris piece.
 */
const miniShapes = [
  // T-shape
  (s) => `M0,${s}h${s*3}v${s}h-${s*3}zM${s},0h${s}v${s}h-${s}z`,
  // L-shape
  (s) => `M0,0h${s}v${s*3}h-${s}zM${s},${s*2}h${s}v${s}h-${s}z`,
  // O-shape
  (s) => `M0,0h${s*2}v${s*2}h-${s*2}z`,
  // S-shape
  (s) => `M${s},0h${s}v${s}h-${s}zM0,${s}h${s}v${s}h-${s}z`,
  // I-shape
  (s) => `M0,0h${s}v${s*4}h-${s}z`,
];

/**
 * PlaceholderImage — a beautifully designed fallback when no screenshot is available.
 * Features the resource name in large text on a type-colored gradient,
 * with scattered decorative mini tetris blocks and a dot-grid pattern.
 */
const PlaceholderImage = ({ name, types }) => {
  const firstType = types[0] || 'אתר';
  const gradient = typeGradientMap[firstType] || typeGradientMap['אתר'];
  const hash = hashString(name);
  const nameIsEnglish = isEnglish(name);

  // Extract first letter / initial for the big decorative letter
  const initial = name.charAt(0).toUpperCase();

  // Deterministic decorative blocks (3-5 mini shapes scattered)
  const decorations = useMemo(() => {
    const count = 3 + (hash % 3); // 3 to 5 blocks
    return Array.from({ length: count }, (_, i) => {
      const seed = hash + i * 7919; // prime offset
      const shapeIdx = seed % miniShapes.length;
      const x = 10 + ((seed * 13) % 75); // 10-85% from left
      const y = 8 + ((seed * 17) % 70);  // 8-78% from top
      const rotation = (seed * 23) % 360;
      const opacity = 0.06 + ((seed % 5) * 0.02); // 0.06-0.14
      return { shapeIdx, x, y, rotation, opacity };
    });
  }, [hash]);

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 60%, #FAFAF9 100%)`,
        }}
      />

      {/* Dot grid pattern */}
      <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
        <defs>
          <pattern id={`dots-${hash}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#1F1F1F" opacity="0.08" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${hash})`} />
      </svg>

      {/* Decorative mini tetris blocks — positioned with CSS, not SVG transform */}
      {decorations.map((d, i) => (
        <svg
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            transform: `rotate(${d.rotation}deg)`,
            opacity: d.opacity,
          }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d={miniShapes[d.shapeIdx](6)} fill="#1F1F1F" />
        </svg>
      ))}

      {/* Large decorative initial — offset to bottom-left */}
      <div
        className="absolute bottom-0 left-0 leading-none pointer-events-none select-none"
        style={{
          fontSize: 'clamp(80px, 12vw, 140px)',
          fontFamily: nameIsEnglish
            ? "'Jersey 20', sans-serif"
            : "'Shimshon', sans-serif",
          fontWeight: 700,
          color: '#1F1F1F',
          opacity: 0.07,
          transform: 'translate(-8%, 18%)',
        }}
        aria-hidden="true"
      >
        {initial}
      </div>

      {/* Resource name — centered, prominent */}
      <div className="absolute inset-0 flex items-center justify-center p-5">
        <span
          className={cn(
            'text-center leading-tight font-bold text-off-black',
            'drop-shadow-[0_1px_1px_rgba(255,255,255,0.5)]',
            nameIsEnglish ? 'font-pixelify' : 'font-shimshon',
            name.length > 20 ? 'text-base' : name.length > 12 ? 'text-xl' : 'text-2xl'
          )}
        >
          {name}
        </span>
      </div>

      {/* Thin border line at the bottom for separation */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-off-black/10" />
    </div>
  );
};

const ToolboxCard = ({
  itemId,
  name,
  description,
  types = [],
  tags = [],
  link,
  image,
  pricing,
  viewMode = 'gallery',
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const screenshotUrl = getScreenshotUrl(link);
  
  // Priority: 1. Custom image, 2. Screenshot (if no error), 3. Placeholder
  const displayImage = image || (screenshotUrl && !imgError ? screenshotUrl : null);
  const showImage = !!displayImage;

  // href: use link as-is if it starts with http, else prepend https://
  const href = link
    ? link.startsWith('http')
      ? link
      : `https://${link}`
    : '#';

  if (viewMode === 'list') {
    return (
      <a
        id={itemId ? `search-item-toolbox-${String(itemId).replace(/[^a-zA-Z0-9_-]/g, '-')}` : undefined}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        dir="rtl"
        aria-label={`${name} - ${pricing || ''}`}
        className={cn(
          'flex items-start gap-4 p-3',
          'bg-off-white',
          'border-3 border-off-black',
          'shadow-brutalist-xs',
          'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
          'transition-all duration-200',
          'group overflow-hidden',
          'focus-visible:outline-3 focus-visible:outline-tetris-yellow focus-visible:outline-offset-2',
          className
        )}
      >
        <div className="w-20 h-14 shrink-0 border-2 border-off-black overflow-hidden bg-light-gray">
          {showImage ? (
            <img
              src={displayImage}
              alt={`תצוגה מקדימה של ${name}`}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top"
            />
          ) : (
            <PlaceholderImage name={name} types={types} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1 min-w-0">
            <h3
              className={cn(
                'text-lg font-bold text-off-black text-right leading-tight line-clamp-2 break-words min-w-0 flex-1',
                isEnglish(name) ? 'font-pixelify' : 'font-shimshon'
              )}
            >
              {name}
            </h3>
            {pricing && <PricingBadge pricing={pricing} />}
          </div>

          {description && (
            <p className="text-sm text-dark-gray text-right font-ibm line-clamp-1 mb-2">
              {description}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 items-center">
            {types.slice(0, 2).map((type) => (
              <Badge
                key={type}
                color={typeColorMap[type] || 'bg-light-gray'}
                className={isEnglish(type) ? 'font-pixelify' : ''}
              >
                {type}
              </Badge>
            ))}
            {tags.slice(0, 4).map((tag, i) => (
              <span
                key={tag}
                className={cn(
                  'inline-block px-2 py-0.5',
                  'text-xs font-normal font-shimshon',
                  'border border-off-black',
                  'shadow-[1px_1px_0px_#1F1F1F]',
                  tagColors[i % tagColors.length],
                  getTagTextClass(tagColors[i % tagColors.length])
                )}
              >
                {tag}
              </span>
            ))}
            {tags.length > 4 && (
              <span className="text-xs font-shimshon text-mid-gray">
                +{tags.length - 4}
              </span>
            )}
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      id={itemId ? `search-item-toolbox-${String(itemId).replace(/[^a-zA-Z0-9_-]/g, '-')}` : undefined}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      dir="rtl"
      aria-label={`${name} - ${pricing || ''}`}
      className={cn(
        'block',
        'bg-off-white',
        'border-3 border-off-black',
        'shadow-brutalist',
        'hover:shadow-brutalist-sm hover:translate-x-[3px] hover:translate-y-[3px]',
        'transition-all duration-200',
        'group overflow-hidden',
        'focus-visible:outline-3 focus-visible:outline-tetris-yellow focus-visible:outline-offset-2',
        className
      )}
    >
      {/* ===== IMAGE AREA ===== */}
      <div className="relative aspect-[16/10] overflow-hidden border-b-3 border-off-black bg-light-gray">
        {showImage ? (
          <img
            src={displayImage}
            alt={`תצוגה מקדימה של ${name}`}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <PlaceholderImage name={name} types={types} />
        )}

        {/* Type badges overlaid on the image — top right in RTL */}
        {types.length > 0 && (
          <div className="absolute top-2 right-2 flex flex-wrap gap-1 max-w-[85%]">
            {types.map((type) => (
              <Badge
                key={type}
                color={typeColorMap[type] || 'bg-light-gray'}
                className={isEnglish(type) ? 'font-pixelify' : ''}
              >
                {type}
              </Badge>
            ))}
          </div>
        )}

        {/* ===== DESCRIPTION OVERLAY (on hover, scrollable for full text) ===== */}
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
          <p
            className={cn(
              'text-sm text-off-white text-right leading-relaxed',
              'font-ibm',
              'min-h-0 flex-1'
            )}
          >
            {description}
          </p>
        </div>
      </div>

      {/* ===== CARD BODY ===== */}
      <div className="p-4">
        {/* Name — Jersey 20 for English, Shimshon for Hebrew */}
        <h3
          className={cn(
            'text-lg font-bold text-off-black text-right mb-2 leading-tight',
            isEnglish(name) ? 'font-pixelify' : 'font-shimshon'
          )}
        >
          {name}
        </h3>

        {/* Tags — secondary accent colors (cycled) */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map((tag, i) => (
              <span
                key={tag}
                className={cn(
                  'inline-block px-2 py-0.5',
                  'text-xs font-normal font-shimshon',
                  'border border-off-black',
                  'shadow-[1px_1px_0px_#1F1F1F]',
                  tagColors[i % tagColors.length],
                  getTagTextClass(tagColors[i % tagColors.length])
                )}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Pricing badge */}
        {pricing && (
          <div className="flex justify-start mt-2">
            <PricingBadge pricing={pricing} />
          </div>
        )}
      </div>
    </a>
  );
};

export default ToolboxCard;
