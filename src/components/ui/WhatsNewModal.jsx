import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Check } from 'lucide-react';
import { FALLBACK_WHATS_NEW } from '@/data/whatsNew';

/**
 * WhatsNewModal - "מה חדש אצלנו?" popup.
 * Shown once per visitor per version stored in Supabase.
 */
const WhatsNewModal = ({
  open,
  onClose,
  title = FALLBACK_WHATS_NEW.title,
  items = FALLBACK_WHATS_NEW.items,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [openSnapshot, setOpenSnapshot] = useState(open);
  if (open !== openSnapshot) {
    setOpenSnapshot(open);
    if (!open) setDontShowAgain(false);
  }

  useEffect(() => {
    if (!open) return undefined;
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose(dontShowAgain);
    };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose, dontShowAgain]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-off-black/80 dark:bg-black/70 backdrop-blur-sm"
      onClick={() => onClose(dontShowAgain)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
      aria-label="מה חדש באתר"
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <div
        dir="rtl"
        className={cn(
          'relative w-full max-w-md',
          'bg-off-white border-3 border-off-black shadow-brutalist',
          'p-6 md:p-7',
          'animate-tetris-stack'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => onClose(dontShowAgain)}
          className={cn(
            'absolute top-3 left-3 p-2',
            'bg-tetris-pink border-2 border-off-black shadow-brutalist-xs',
            'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
            'transition-all duration-200'
          )}
          aria-label="סגירה"
        >
          <X size={18} />
        </button>

        <h2 id="whats-new-title" className="text-2xl font-bold font-headline text-off-black mb-4 text-right">
          {title}
        </h2>

        <ul
          dir="rtl"
          className={cn(
            'space-y-3 font-ibm text-dark-gray text-base leading-relaxed',
            'list-disc list-inside text-right',
            'ps-4 marker:text-tetris-purple'
          )}
        >
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>

        <div className="mt-8 pt-4 border-t-2 border-off-black/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className={cn(
              "w-5 h-5 border-2 border-off-black flex items-center justify-center transition-colors",
              dontShowAgain ? "bg-tetris-purple" : "bg-off-white group-hover:bg-light-gray"
            )}>
              {dontShowAgain && <Check size={14} strokeWidth={4} className="text-white" />}
            </div>
            <span className="text-sm font-ibm text-dark-gray select-none">אל תראה שוב</span>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
            />
          </label>

          <button
            type="button"
            onClick={() => onClose(dontShowAgain)}
            className={cn(
              'px-6 py-2.5 min-w-[120px]',
              'bg-tetris-green border-2 border-off-black',
              'font-bold font-headline text-off-black shadow-brutalist-xs',
              'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
              'transition-all duration-200'
            )}
          >
            הבנתי
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default WhatsNewModal;
