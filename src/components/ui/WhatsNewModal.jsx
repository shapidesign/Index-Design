import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/**
 * WhatsNewModal - "מה חדש אצלנו?" popup.
 * Shows once per user per version. Update WHATS_NEW_VERSION to show again for returning users.
 */
const WhatsNewModal = ({ open, onClose }) => {
  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-off-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
      aria-label="מה חדש באתר"
    >
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
          onClick={onClose}
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

        <h2 id="whats-new-title" className="text-2xl font-bold font-shimshon text-off-black mb-4 text-right">
          מה חדש אצלנו?
        </h2>

        <ul
          dir="rtl"
          className={cn(
            'space-y-3 font-ibm text-dark-gray text-base',
            'list-disc list-inside text-right',
            'ps-4 marker:text-tetris-purple'
          )}
        >
          <li>שיפרנו את מנגנון החיפוש</li>
          <li>הוספנו עוד 10 כלים</li>
          <li>העין של המחלקה מסתכלת עליכם כל הזמן</li>
        </ul>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'px-5 py-2.5',
              'bg-tetris-green border-2 border-off-black',
              'font-bold font-shimshon text-off-black shadow-brutalist-xs',
              'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
              'transition-all duration-200'
            )}
          >
            מעולה!
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsNewModal;
