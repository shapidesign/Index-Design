import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import useLongPress from '@/hooks/useLongPress';

const isEnglish = (text) => /^[a-zA-Z0-9\s/&\-_.()]+$/.test((text || '').trim());

export function LongPress({
  as = 'div',
  onLongPress,
  className,
  children,
  ...rest
}) {
  const press = useLongPress(onLongPress);
  return React.createElement(
    as,
    { ...rest, ...press, className: cn('long-press-card', className) },
    children
  );
}

/**
 * DescriptionPopup - תיאור מלא של פריט, נסגר בכפתור X
 */
const isCloseButton = (target) =>
  target instanceof Element && !!target.closest('[data-description-close]');

const DescriptionPopup = ({ open, title, description, onClose }) => {
  const panelRef = useRef(null);
  const body = (description || '').trim() || 'אין תיאור לפריט הזה.';

  useEffect(() => {
    if (!open) return undefined;
    // Focus the panel, not the X, so the yellow focus ring does not sit on the close button.
    panelRef.current?.focus();
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    // The finger is still down when the popup opens. Swallow that release so it
    // doesn't hit the backdrop. A tap on the X is never part of that swallow.
    let swallowClick = false;
    let clearSwallow = 0;
    const armRelease = () => {
      swallowClick = true;
      window.clearTimeout(clearSwallow);
      clearSwallow = window.setTimeout(() => { swallowClick = false; }, 400);
    };
    const onPointerDown = (e) => {
      if (isCloseButton(e.target)) return;
      swallowClick = false;
      window.clearTimeout(clearSwallow);
      document.removeEventListener('pointerup', armRelease, true);
    };
    const onClick = (e) => {
      if (isCloseButton(e.target)) return;
      if (!swallowClick) return;
      swallowClick = false;
      window.clearTimeout(clearSwallow);
      e.preventDefault();
      e.stopPropagation();
    };
    document.addEventListener('keydown', onEsc);
    document.addEventListener('pointerup', armRelease, true);
    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('click', onClick, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(clearSwallow);
      document.removeEventListener('keydown', onEsc);
      document.removeEventListener('pointerup', armRelease, true);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('click', onClick, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-off-black/80 dark:bg-black/70"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="item-description-title"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        dir="rtl"
        className={cn(
          'w-full max-w-md max-h-[85vh] flex flex-col',
          'bg-off-white border-3 border-off-black shadow-brutalist',
          'outline-none'
        )}
        style={{ outline: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b-3 border-off-black shrink-0">
          <h2
            id="item-description-title"
            className={cn(
              'text-xl font-bold text-off-black text-right leading-tight break-words',
              isEnglish(title) ? 'font-jersey' : 'font-headline'
            )}
          >
            {title}
          </h2>
          <button
            type="button"
            data-description-close=""
            onClick={onClose}
            className={cn(
              'shrink-0 inline-flex items-center justify-center w-11 h-11',
              'bg-tetris-pink border-2 border-off-black shadow-brutalist-xs',
              'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
              'transition-all duration-200'
            )}
            aria-label="סגור"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <p className="text-base text-off-black font-ibm leading-relaxed text-right whitespace-pre-line">
            {body}
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DescriptionPopup;
