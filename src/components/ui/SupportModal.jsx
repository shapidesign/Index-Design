import React, { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Heart, ExternalLink } from 'lucide-react';

/**
 * SupportModal - חלון תמיכה ביוצר
 * Popup modal encouraging users to support the creator via Buy Me a Coffee.
 *
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is visible
 * @param {function} props.onClose - Callback to close the modal
 */
const SupportModal = ({ open, onClose }) => {
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
      aria-label="תמיכה ביוצר"
    >
      <div
        dir="rtl"
        className={cn(
          'relative w-full max-w-md',
          'bg-off-white border-3 border-off-black shadow-brutalist',
          'p-6 md:p-7'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute top-3 left-3 p-2',
            'bg-tetris-pink border-2 border-off-black shadow-brutalist-xs',
            'hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]',
            'transition-all duration-200'
          )}
          aria-label="סגירת חלון תמיכה"
        >
          <X size={18} />
        </button>

        {/* Heart icon */}
        <div className="flex justify-center mb-4">
          <div
            className={cn(
              'w-16 h-16',
              'flex items-center justify-center',
              'bg-tetris-pink border-3 border-off-black shadow-brutalist-sm'
            )}
          >
            <Heart size={32} className="text-off-black" fill="#1F1F1F" />
          </div>
        </div>

        {/* Heading */}
        <h3 className="text-2xl font-bold font-shimshon text-off-black mb-3 text-center">
          תמיכה ביוצר
        </h3>

        {/* Description */}
        <p className="text-sm text-dark-gray font-ibm mb-2 text-center leading-relaxed">
          האינדקס נבנה באהבה ובהשקעה רבה כדי לעזור לסטודנטים לעיצוב גרפי למצוא את כל מה שהם צריכים — במקום אחד.
        </p>
        <p className="text-sm text-dark-gray font-ibm mb-6 text-center leading-relaxed">
          אם האתר עזר לכם, אפשר לתמוך ביוצר ולעזור לשמור את הפרויקט חי ומתעדכן.
        </p>

        {/* CTA button */}
        <div className="flex justify-center">
          <a
            href="https://buymeacoffee.com/shapi"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'inline-flex items-center gap-2 px-6 py-3',
              'bg-tetris-purple text-off-white',
              'border-2 border-off-black',
              'font-bold font-shimshon text-base',
              'shadow-brutalist-sm',
              'hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]',
              'transition-all duration-200'
            )}
          >
            <Heart size={18} />
            <span>לתמיכה ביוצר</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default SupportModal;
