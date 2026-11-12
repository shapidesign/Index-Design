import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X, Check } from 'lucide-react';

/**
 * WhatsNewModal - "מה חדש אצלנו?" popup.
 * Shows once per user per version. Update WHATS_NEW_VERSION to show again for returning users.
 */
const WhatsNewModal = ({ open, onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (!open) {
      setDontShowAgain(false); // Reset when reopening just in case
      return;
    }
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
          מה חדש אצלנו?
        </h2>

        <ul
          dir="rtl"
          className={cn(
            'space-y-3 font-ibm text-dark-gray text-base leading-relaxed',
            'list-disc list-inside text-right',
            'ps-4 marker:text-tetris-purple'
          )}
        >
          <li>הוספנו מקלדת: קיצורי מקלדת לתוכנות עיצוב, הדגשה חיה של המקשים, תרגול וחידון.</li>
          <li>הוספנו 8 כלים חדשים: 2 בטיפוגרפיה, 2 ב-UX, ועוד כלים לצילום, לצבע, לעיבוד תמונה ולקיצורי מקלדת.</li>
          <li>הוספנו ממשק לספרייה של HIT בצורה נוחה למשתמש.</li>
          <li>נוספו פונטים חדשים למילון, בהם עזר דיאלוג, אקסיומה, רקיע, שפגאט ומשפחת ריזינגר.</li>
          <li>נוספו פונטים מבית <bdi dir="ltr" className="whitespace-nowrap">Nomad</bdi>: קלדנית, ספרא, מידל איסט, יפה נפש, דולומיט, <bdi dir="ltr" className="whitespace-nowrap">Kilo Text</bdi>, <bdi dir="ltr" className="whitespace-nowrap">Kilo Display</bdi>, <bdi dir="ltr" className="whitespace-nowrap">Dear AI</bdi>, <bdi dir="ltr" className="whitespace-nowrap">The Bizarre</bdi>, <bdi dir="ltr" className="whitespace-nowrap">Werd</bdi>, <bdi dir="ltr" className="whitespace-nowrap">Romanisch Spitz</bdi> ו־<bdi dir="ltr" className="whitespace-nowrap">Sugar</bdi>.</li>
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
